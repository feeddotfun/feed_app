import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from 'axios';
import FormData from 'form-data';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { IDL, MemeFund } from "./IDL";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { calculateWithSlippageBuy, uuidToMemeIdAndBuffer } from "../utils";
import { CreateTokenMetadata, TokenCreationResult } from "@/types/solana-program.types";
import { DEFAULT_COMMITMENT, eventAuthority, GLOBAL_ACCOUNT_SEED, mplTokenMetadata, PUMP_FUN_PROGRAM_ID, pumpFeeRecipient } from "@/constants/solana-program.config";
import { GlobalAccount } from "./globalAccount";

export class MemeFundSDK {
    private program: Program<MemeFund>;
    private connection: Connection;
    private authorityWallet: NodeWallet;
    private feeRecipient: PublicKey;
    private SLIPPAGE_BASIS_POINTS: BN;

    constructor() {
        this.connection = new Connection(process.env.RPC_URL!, 'confirmed');
        const privateKeyBase64 = process.env.AUTHORITY_KEY!;
        const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKeyBase64, 'base64'));
        const keyPair = Keypair.fromSecretKey(privateKeyUint8Array);
        this.authorityWallet = new NodeWallet(keyPair);
        this.feeRecipient = new PublicKey(process.env.FEE_RECIPIENT_PUBLIC_KEY!);
        this.SLIPPAGE_BASIS_POINTS = new BN(100); // 1%
        const provider = new AnchorProvider(this.connection, this.authorityWallet, {});
        this.program = new Program(<MemeFund>(IDL), provider);
        this.connection = this.program.provider.connection;
    }

    async createMemeRegistry(memeUuid: string): Promise<{ success: boolean; tx?: string; error?: any }> {
        try {
            const { memeId } = uuidToMemeIdAndBuffer(memeUuid);
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );
            const tx = await this.program.methods.createMemeRegistry(memeId)
                    .accounts({
                        state: statePDA,
                    })
                    .rpc();
            return { success: true, tx };
        }
        catch (error) {
            return { success: false, error };
        }
    }

    async contribute(memeUuid: string, amount: string, contributor: string) {
        const { memeId } = uuidToMemeIdAndBuffer(memeUuid);
        const contributorWallet = new PublicKey(contributor);

        // Get the latest blockhash
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    
        const ix = await this.program.methods.contribute(memeId, new BN(amount))
            .accounts({
                feeRecipient: this.feeRecipient,
                contributor: contributorWallet            
            }).instruction()
            
        const tx = new Transaction().add(ix);
        tx.recentBlockhash = blockhash;
        tx.feePayer = contributorWallet;
        return { tx, lastValidBlockHeight };
    }

    async authorityContribute(memeUuid: string, amount: string): Promise<{ success: boolean; error?: any; tx?: string; }> {
        try {
          const { memeId } = uuidToMemeIdAndBuffer(memeUuid);
          const tx = await this.program.methods.contribute(memeId, new BN(amount))
          .accounts({
            feeRecipient: this.feeRecipient,
            contributor: this.authorityWallet.publicKey            
          })
          .rpc();
          console.log(tx)
          return { success: true, tx };
        } catch (error) {
          console.error('Authority contribution failed:', error);
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Authority contribution failed' 
          };
        }
      }

    async startMeme(memeUuid: string, createTokenMetadata: CreateTokenMetadata): Promise<TokenCreationResult> {
        try {
            const mint = Keypair.generate();

            const { memeId, buffer: memeIdBuffer } = uuidToMemeIdAndBuffer(memeUuid);

            const [vaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault"), memeIdBuffer],
                this.program.programId
            );
            const [registryPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("registry"), Buffer.from(memeId)],
                this.program.programId
            );
            const [mintAuthority] = PublicKey.findProgramAddressSync(
                [Buffer.from('mint-authority')],
                PUMP_FUN_PROGRAM_ID
            );
            const [bondingCurve] = PublicKey.findProgramAddressSync(
                [Buffer.from('bonding-curve'), mint.publicKey.toBuffer()],
                PUMP_FUN_PROGRAM_ID
            );
            const [global] = PublicKey.findProgramAddressSync(
                [Buffer.from('global')],
                PUMP_FUN_PROGRAM_ID
            );
            const [metadata] = PublicKey.findProgramAddressSync(
                [Buffer.from('metadata'), mplTokenMetadata.toBuffer(), mint.publicKey.toBuffer()],
                mplTokenMetadata
            );

            const associatedBondingCurve = await getAssociatedTokenAddress(
                mint.publicKey,
                bondingCurve,
                true
            );
            const associatedUser = await getAssociatedTokenAddress(
                mint.publicKey,
                vaultPda,
                true,  // allowOwnerOffCurve
            );
            const [globalAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from(GLOBAL_ACCOUNT_SEED)],
                new PublicKey(PUMP_FUN_PROGRAM_ID)
            );

            const tokenAccount = await this.connection.getAccountInfo(
                globalAccountPDA,
                DEFAULT_COMMITMENT
            );

            const vaultAccountInfo = await this.connection.getAccountInfo(vaultPda);
            if (!vaultAccountInfo)
                throw new Error('Vault account not found');

            const lamports = vaultAccountInfo.lamports;
            const lamportsForBuy = new BN(lamports).sub(new BN(50000000)); //0.0013 SOL **30000000
            const buyAmountSol = lamportsForBuy.mul(new BN(1e9)).div(new BN(web3.LAMPORTS_PER_SOL));
            const globalAccount = GlobalAccount.fromBuffer(tokenAccount!.data);
            const buyAmount = globalAccount.getInitialBuyPrice(buyAmountSol);
            const buyAmountWithSlippage = calculateWithSlippageBuy(buyAmount, this.SLIPPAGE_BASIS_POINTS);        
            const modifyComputeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
                units: 700000
            });            
 
            let tokenMetadata = await this.createTokenMetadata(createTokenMetadata);

            const tx = await this.program.methods.startMeme(
                memeId,
                createTokenMetadata.name,
                createTokenMetadata.symbol,
                tokenMetadata.metadataUri,
                buyAmount,
                buyAmountWithSlippage            
            ).accounts({
                registry: registryPda,
                mint: mint.publicKey,
                mintAuthority,
                bondingCurve,
                associatedBondingCurve,
                global,
                mplTokenMetadata,
                metadata,
                authority: this.authorityWallet.publicKey,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                eventAuthority,            
                pumpProgram: PUMP_FUN_PROGRAM_ID,  
                feeRecipient: pumpFeeRecipient,
                associatedUser,
            }).preInstructions([modifyComputeBudgetIx])
            .signers([mint])
            .rpc();
            return {
                success: true,
                mintAddress: mint.publicKey.toString(),
                tx
            };
        }
        catch (error: any) {
            console.error('Detailed Error Information:', {
                errorName: error?.constructor.name,
                message: error?.message,
                stack: error?.stack,
                transactionDetails: error.transactionMessage || 'No transaction details'
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create token'
            };
        }

    }

    async createTokenMetadata(create: CreateTokenMetadata) {
        try {          
            // Download image
            const imageResponse = await axios.get(create.imageUrl, {
                responseType: 'arraybuffer'
            });
            
            const buffer = Buffer.from(imageResponse.data);

            // Create FormData
            const formData = new FormData();
            
            // Add file with proper filename and mime type
            const filename = `${create.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            formData.append("file", buffer, {
                filename,
                contentType: 'image/png'
            });

            // Add other fields
            formData.append("name", create.name);
            formData.append("symbol", create.symbol);
            formData.append("description", create.description);
            formData.append("twitter", create.twitter || "");
            formData.append("telegram", create.telegram || "");
            formData.append("website", create.website || "");
            formData.append("showName", "true");

            // Make request with axios
            const response = await axios.post("https://pump.fun/api/ipfs", formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            return response.data;

        } catch (error) {
            throw error;
        }
    }

    async getVaultTokenAccount(mintAddress: string, memeUuid: string): Promise<{ amount: number }> {
        try {
            const { buffer: memeIdBuffer } = uuidToMemeIdAndBuffer(memeUuid);
            
            const [vaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault"), memeIdBuffer],
                this.program.programId
            );
    
            const associatedTokenAddress = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                vaultPda,
                true // allowOwnerOffCurve
            );
    
            const tokenAccount = await this.connection.getTokenAccountBalance(associatedTokenAddress);
    
            if (!tokenAccount.value) {
                throw new Error('Token account not found');
            }
    
            return {
                amount: Number(tokenAccount.value.amount)
            };
        } catch {
            throw new Error('Error get vault token account');
        }
    }

    async getClaimAvailableTime(memeUuid: string): Promise<BN> {
        try {
            const { memeId } = uuidToMemeIdAndBuffer(memeUuid);
            const [registryPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("registry"), Buffer.from(memeId)],
                this.program.programId
            );
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );    
            const registry = await this.program.account.memeRegistry.fetch(registryPda);
            const state = await this.program.account.state.fetch(statePDA);
    
            return new BN(registry.endTime).add(state.tokenClaimAvailableTime);
        } catch {
            throw new Error('Error getting claim available time');
        }
    }

    async claim(memeUuid: string, contributor: string, mintAddress: string) {
        try {
            const { memeId, buffer: memeIdBuffer } = uuidToMemeIdAndBuffer(memeUuid);
            const contributorWallet = new PublicKey(contributor);
            const mintPublicKey = new PublicKey(mintAddress);
    
            // Find PDAs
            const [registryPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("registry"), Buffer.from(memeId)],
                this.program.programId
            );
    
            const [contributionPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("contribution"), memeIdBuffer, contributorWallet.toBuffer()],
                this.program.programId
            );
    
            const [vaultPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault"), memeIdBuffer],
                this.program.programId
            );
    
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );
    
            // Get token accounts
            const userTokenAccount = await getAssociatedTokenAddress(
                mintPublicKey,
                contributorWallet
            );
    
            const vaultTokenAccount = await getAssociatedTokenAddress(
                mintPublicKey,
                vaultPda,
                true // allowOwnerOffCurve
            );
    
            // Get the latest blockhash
            const latestBlockhash = await this.connection.getLatestBlockhash('finalized');
    
            const ix = new TransactionInstruction({
                keys: [
                    {pubkey: registryPda, isSigner: false, isWritable: true},
                    {pubkey: contributionPda, isSigner: false, isWritable: true},
                    {pubkey: contributorWallet, isSigner: true, isWritable: false},
                    {pubkey: vaultPda, isSigner: false, isWritable: false},
                    {pubkey: vaultTokenAccount, isSigner: false, isWritable: true},
                    {pubkey: userTokenAccount, isSigner: false, isWritable: true},
                    {pubkey: mintPublicKey, isSigner: false, isWritable: false},
                    {pubkey: statePDA, isSigner: false, isWritable: false},
                    {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
                    {pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
                    {pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false},
                ],
                programId: this.program.programId,
                data: this.program.coder.instruction.encode("claimTokens", {memeId})
            });
    
            const tx = new Transaction();
            tx.add(ix);
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
            tx.feePayer = contributorWallet;
    
            return {
                tx,
                serializedTransaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            };
        } catch  {
            throw new Error('Error claiming tokens')
        }
    }

    async updateMaxBuyAmount(newMaxBuyAmount: BN): Promise<{ success: boolean; error?: any, tx?: string }> {
        try {
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );

            const tx = await this.program.methods.updateMaxBuyAmount(newMaxBuyAmount)
                .accounts({
                    state: statePDA,
                    authority: this.authorityWallet.publicKey,
                })
                .rpc();

            return { success: true, tx };
        } catch (error) {
            return { success: false, error };
        }
    }

    async updateMinBuyAmount(newMinBuyAmount: BN): Promise<{ success: boolean; error?: any, tx?: string }> {
        try {
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );

            const tx = await this.program.methods.updateMinBuyAmount(newMinBuyAmount)
                .accounts({
                    state: statePDA,
                    authority: this.authorityWallet.publicKey,
                })
                .rpc();

            return { success: true, tx };
        } catch (error) {
            return { success: false, error };
        }
    }

    async updateFundDuration(newFundDuration: BN): Promise<{ success: boolean; error?: any, tx?: string }> {
        try {
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );

            const tx = await this.program.methods.updateFundDuration(newFundDuration)
                .accounts({
                    state: statePDA,
                    authority: this.authorityWallet.publicKey,
                })
                .rpc();

            return { success: true, tx };
        } catch (error) {
            return { success: false, error };
        }
    }

    async updateSafeLimits(params: {
        minBuyAmount?: BN;
        maxBuyAmount?: BN;
        fundDuration?: BN;
    }): Promise<{ success: boolean; error?: any }> {
        try {
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );

            let results = [];

            if (params.maxBuyAmount) {
                const result = await this.updateMaxBuyAmount(params.maxBuyAmount);
                results.push({ type: 'maxBuyAmount', ...result });
            }

            if (params.minBuyAmount) {
                const result = await this.updateMinBuyAmount(params.minBuyAmount);
                results.push({ type: 'minBuyAmount', ...result });
            }

            if (params.fundDuration) {
                const result = await this.updateFundDuration(params.fundDuration);
                results.push({ type: 'fundDuration', ...result });
            }

            // Check if any updates failed
            const hasFailures = results.some(r => !r.success);
            if (hasFailures) {
                return {
                    success: false,
                    error: {
                        message: 'Some updates failed',
                        details: results
                    }
                };
            }

            return {
                success: true,
            };
        } catch (error) {
            return { success: false, error };
        }
    }

    async getStateConfig(): Promise<{ success: boolean; state?: any; error?: any }> {
        try {
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("state")],
                this.program.programId
            );

            const state = await this.program.account.state.fetch(statePDA);
            return {
                success: true,
                state: {
                    minBuyAmount: state.minBuyAmount.toString(),
                    maxBuyAmount: state.maxBuyAmount.toString(),
                    fundDuration: state.fundDuration.toString(),
                    maxFundLimit: state.maxFundLimit.toString(),
                    commissionRate: state.commissionRate,
                    tokenClaimAvailableTime: state.tokenClaimAvailableTime.toString()
                }
            };
        } catch (error) {
            return { success: false, error };
        }
    }


}
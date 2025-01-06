import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import axios from 'axios';
import FormData from 'form-data';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
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
            const lamportsForBuy = new BN(lamports).sub(new BN(30000000)); //0.0013 SOL
            const buyAmountSol = lamportsForBuy.mul(new BN(1e9)).div(new BN(web3.LAMPORTS_PER_SOL));
            const globalAccount = GlobalAccount.fromBuffer(tokenAccount!.data);
            const buyAmount = globalAccount.getInitialBuyPrice(buyAmountSol);
            const buyAmountWithSlippage = calculateWithSlippageBuy(buyAmount, this.SLIPPAGE_BASIS_POINTS);        
            const modifyComputeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
                units: 500000
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
        catch (error) {
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
            console.error('Error creating token metadata:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                console.error('Response headers:', error.response?.headers);
            }
            throw error;
        }
    }

}
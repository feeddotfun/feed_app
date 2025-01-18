'use server'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { MemeFundSDK } from "../meme-fund/fund.sdk";
import { BN } from 'bn.js';

export async function memeRegistry(memeId: string) {
    const sdk = new MemeFundSDK();
    const tx = await sdk.createMemeRegistry(memeId);
    return tx;
}

export async function memeContribute(
    memeProgramId: string, 
    contributor: string, 
    amount: string
  ) {
      try {
          // Validate contributor public key
          if (!PublicKey.isOnCurve(contributor)) {
              throw new Error('Invalid contributor public key');
          }
  
          // Create SDK instance and get transaction
          const sdk = new MemeFundSDK();
          const { tx, lastValidBlockHeight } = await sdk.contribute(
            memeProgramId, 
            amount, 
            contributor
          );
  
          if (!tx) {
              throw new Error('Failed to create transaction');
          }
      
          const serializedTransaction = tx.serialize({ 
            requireAllSignatures: false 
          }).toString('base64');
  
          return { serializedTransaction, lastValidBlockHeight };
      }
      catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Transaction creation failed');
      }
}

export async function memeClaim(
    memeUuid: string,
    contributor: string,
    mintAddress: string
  ) {
    try {
      const sdk = new MemeFundSDK();
      const {tx, serializedTransaction, lastValidBlockHeight} = await sdk.claim(memeUuid, contributor, mintAddress);
  
      if (!tx) {
        throw new Error('Failed to create claim transaction');
      }

      return {
        serializedTransaction,
        lastValidBlockHeight
      };
    } catch  {
      throw new Error('Claim action error');
    }
  }

export async function updateProgramConfig(params: {
  minBuyAmount?: number; // SOL Amount
  maxBuyAmount?: number; // SOL Amount
  fundDuration?: number; // Seconds Contribution Time Limit
}) {
  try {
    const sdk = new MemeFundSDK();
    
    // Convert SOL amounts to lamports
    const updates = {
      minBuyAmount: params.minBuyAmount ? new BN(params.minBuyAmount * LAMPORTS_PER_SOL) : undefined,
      maxBuyAmount: params.maxBuyAmount ? new BN(params.maxBuyAmount * LAMPORTS_PER_SOL) : undefined,
      fundDuration: params.fundDuration ? new BN(params.fundDuration) : undefined
    }
    
    const result = await sdk.updateSafeLimits(updates);
    const updatedConfig = await sdk.getStateConfig();
    console.log(updatedConfig.state)

    return result;
  }
  catch (error) {
    console.error('Program config update failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Config update failed');
  }
}



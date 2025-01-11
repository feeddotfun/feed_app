'use server'
import { PublicKey } from '@solana/web3.js';
import { MemeFundSDK } from "../meme-fund/fund.sdk";

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
          console.error('Contribute action error:', error);
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
    } catch (error) {
      console.error('Claim action error:', error);
      throw error;
    }
  }

import { Connection, Transaction } from '@solana/web3.js';
import { BaseService } from '../core/base-service';
import { ServiceResponse, InvestmentData, ClaimParams } from '@/types';

export class InvestmentService extends BaseService<InvestmentData> {
  constructor() {
    super('/api/investments');
  }

  async getInvestments(publicKey: string, page = 1, filter = 'waiting-claim'): Promise<ServiceResponse<InvestmentData>> {
    if (!publicKey) throw new Error('Require public key');
  
    const response = await fetch(`${this.baseURL}?publicKey=${publicKey}&page=${page}&filter=${filter}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch investments');
    }
    
    return response.json();
  }

  async claim({ investmentId, mintAddress, memeUuid, memeId }: ClaimParams): Promise<{ signature: string }> {
    try {
      if (!window.solana?.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get transaction from API
      const response = await fetch(`${this.baseURL}/${investmentId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor: window.solana.publicKey.toString(),
          mintAddress,
          memeUuid
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const { serializedTransaction, lastValidBlockHeight } = await response.json();

      // Deserialize and sign
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, 'base64')
      );
      
      const signedTx = await window.solana.signTransaction(transaction);
      
      // Send and Confirm
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      await connection.confirmTransaction({
        signature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight
      });

      // Update investment status
      await fetch(`${this.baseURL}/${investmentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signature,
          contributor: window.solana.publicKey.toString(),
          memeId: memeId
        })
      });

      return { signature };
    } catch (error) {
      console.error('Claim error:', error);
      throw error;
    }
  }
}
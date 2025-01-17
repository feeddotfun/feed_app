import { useState, useEffect, useCallback } from 'react'
import { Transaction, Connection, LAMPORTS_PER_SOL, TransactionInstruction, PublicKey } from '@solana/web3.js'
import confetti from 'canvas-confetti'
import BN from 'bn.js'
import { MemeData, MemeArenaSessionData } from "@/types"
import { createMemeContribution } from '@/lib/actions/meme-arena.action'

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export function useWinnerMeme(
  meme: MemeData, 
  session: MemeArenaSessionData, 
  maxContributionSol: number,
  publicKey?: string,
  signTransaction?: (transaction: Transaction) => Promise<Transaction>
) {
  const [isVisible, setIsVisible] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [isContributing, setIsContributing] = useState(false)
  const [isEligible, setIsEligible] = useState<boolean | null>(true)
  const [eligibilityError, setEligibilityError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed')

  // Winner visibility and confetti effect
  useEffect(() => {
    if (meme.isWinner && !isVisible) {
      setIsVisible(true)
      launchConfetti()
    }
  }, [meme.isWinner, isVisible])

  // Time remaining calculation
  useEffect(() => {
    const updateRemainingTime = () => {
      if (session.contributeEndTime) {
        const endTime = new Date(session.contributeEndTime).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
        setRemainingTime(remaining)
      } else {
        setRemainingTime(null)
      }
    }

    updateRemainingTime()
    const timer = setInterval(updateRemainingTime, 1000)

    return () => clearInterval(timer)
  }, [session.contributeEndTime])

  // Eligibility check
  const checkEligibility = useCallback(async () => {
    setEligibilityError(null);

    if (session.status !== 'Contributing') {
      setIsEligible(false);
      setEligibilityError('Contribution period is not active');
      return;
    }

    if (!publicKey || !meme.id) {
      setIsEligible(false);
      return;
    }

    try {
      const res = await fetch('/api/meme-arena/check-contribution-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId: meme.id,
          contributor: publicKey.toString()
        })
      });
      
      const data = await res.json();
      
      if (!data.result.eligible) {
        setIsEligible(false);
        setEligibilityError(data.result.reason || 'Not eligible for contribution');
      } else {
        setIsEligible(true);
        setEligibilityError(null);
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      setIsEligible(false);
      setEligibilityError('Failed to check eligibility');
    }
  }, [meme.id, publicKey, session.status]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  // Utility functions
  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const setPurchaseAmountWithLimit = useCallback((amount: string) => {
    const numericAmount = parseFloat(amount);
    if (!session.remainingContributions) {
      setPurchaseAmount("");
      return;
    }
    const maxAllowedContribution = Math.min(
      maxContributionSol,
      session.remainingContributions / LAMPORTS_PER_SOL
    );  
  
    if (!isNaN(numericAmount)) {
      if (numericAmount <= maxAllowedContribution) {
        setPurchaseAmount(amount);
      } else {
        setPurchaseAmount(maxAllowedContribution.toString());
      }
    }
  }, [maxContributionSol, session.remainingContributions]);

  // Contribution handler
  const handleContribute = useCallback(async () => {
    if (!publicKey || !signTransaction || !isEligible || !purchaseAmount) {
      return;
    }

    const contributionAmount = parseFloat(purchaseAmount);
    if (!session.remainingContributions) {
      throw new Error('No remaining contributions allowed');
    }
    const remainingInSol = session.remainingContributions / LAMPORTS_PER_SOL;
    const maxAllowedContribution = Math.min(maxContributionSol, remainingInSol);

    if (isNaN(contributionAmount) || 
      contributionAmount <= 0 || 
      contributionAmount > maxAllowedContribution
    ) {
      console.error('Invalid contribution amount');
      return;
    }

    setIsContributing(true);
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const lamports = new BN(Math.floor(contributionAmount * LAMPORTS_PER_SOL));
    
        // Get transaction from API
        const contributeResponse = await fetch('/api/meme-arena/contribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memeProgramId: meme.memeProgramId,
            contributor: publicKey.toString(),
            amount: lamports.toString()
          })
        });

        if (!contributeResponse.ok) {
          let errorMessage = 'Failed to create transaction';
          try {
            const errorData = await contributeResponse.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('Raw response:', await contributeResponse.text());
          }
          throw new Error(errorMessage);
        }

        let responseData;
        try {
          responseData = await contributeResponse.json();
        } catch (e) {
          console.error('Failed to parse response:', e);
          throw new Error('Invalid response from server');
        }

        const { serializedTransaction, lastValidBlockHeight } = responseData;

        // Create and modify transaction
        const transaction = Transaction.from(
          Buffer.from(serializedTransaction, 'base64')
        );

        // Add memo instruction
        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(
              `Contribute ${contributionAmount} SOL to Meme: ${meme.name}`, 
              "utf-8"
            )
          })
        );

        // Sign and send transaction
        const signed = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signed.serialize(),
          { maxRetries: 3 } 
        );

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: transaction.recentBlockhash!,
          lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        // Get client IP and create contribution record
        await createMemeContribution({
          meme: meme.id,
          session: session.id,
          contributor: publicKey.toString(),
          amount: lamports.toNumber()
        });

        setPurchaseAmount(''); // Reset purchase amount after successful contribution
        setIsContributing(false);
        await checkEligibility();
        break;

      } catch (error) {
        console.error('Contribution error:', error);
        
        throw error;
      }
      finally {
        setIsContributing(false);
      }
    }
  }, [
    meme, 
    publicKey, 
    purchaseAmount, 
    session.id, 
    session.remainingContributions,
    signTransaction, 
    connection, 
    isEligible, 
    checkEligibility,
    maxContributionSol
  ]);

  return {
    isVisible,
    remainingTime,
    purchaseAmount,
    setPurchaseAmount: setPurchaseAmountWithLimit,
    isTokenCreation: session.isTokenCreating,
    isEligible,
    eligibilityError,
    handleContribute,
    maxContributionSol,
    isContributing
  }
}
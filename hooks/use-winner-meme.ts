import { useState, useEffect, useCallback } from 'react'
import { Transaction, Connection, LAMPORTS_PER_SOL, TransactionInstruction, PublicKey } from '@solana/web3.js'
import confetti from 'canvas-confetti'
import BN from 'bn.js'
import { MemeData, MemeArenaSessionData, CreateMemeContributionDto } from "@/types"
import { createMemeContribution } from '@/lib/actions/meme-arena.action'

const MAX_CONTRIBUTION_SOL = 1;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useWinnerMeme(
  meme: MemeData, 
  session: MemeArenaSessionData, 
  publicKey?: string,
  signTransaction?: (transaction: Transaction) => Promise<Transaction>
) {
  const [isVisible, setIsVisible] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [isContributing, setIsContributing] = useState(false)
  const [isTokenCreation, setIsTokenCreation] = useState(false)
  const [isEligible, setIsEligible] = useState<boolean | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, 'confirmed')

  const checkEligibility = useCallback(async () => {
    if (!publicKey || !meme.id) {
      setIsEligible(false)
      return
    }

    try {
      const res = await fetch('/api/meme-arena/check-contribution-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId: meme.id,
          contributor: publicKey.toString()
        })
      })
      const resData = await res.json()
      setIsEligible(resData.result.eligible)
    } catch {
      setIsEligible(false)
    }
  }, [meme.id, publicKey])

  useEffect(() => {
    if (isEligible === null) {
      checkEligibility()
    }
  }, [checkEligibility, isEligible])

  useEffect(() => {
    if (meme.isWinner) {
      setIsVisible(true)
      launchConfetti()
    }
  }, [meme.isWinner])

  useEffect(() => {
    const updateRemainingTime = () => {
      if (session.contributeEndTime) {
        const endTime = new Date(session.contributeEndTime).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
        setRemainingTime(remaining)

        if (remaining <= 0 && session.status === 'Contributing') {
          setIsTokenCreation(true)
          setTimeout(() => {
            setIsTokenCreation(false)
          }, 5000)
        }
      } else {
        setRemainingTime(null)
      }
    }

    updateRemainingTime()
    const timer = setInterval(updateRemainingTime, 1000)

    return () => clearInterval(timer)
  }, [session.contributeEndTime, session.status])

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const copyToClipboard = useCallback(() => {
    if (session.tokenMintAddress) {
      navigator.clipboard.writeText(session.tokenMintAddress)
    }
  }, [session.tokenMintAddress])

  const setPurchaseAmountWithLimit = useCallback((amount: string) => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount <= MAX_CONTRIBUTION_SOL) {
      setPurchaseAmount(amount);
    } else if (numericAmount > MAX_CONTRIBUTION_SOL) {
      setPurchaseAmount(MAX_CONTRIBUTION_SOL.toString());
    }
  }, []);

  const handleContribute = useCallback(async () => {
    if (!publicKey || !signTransaction || isEligible == false) {
      return
    }

    if (purchaseAmount === null || isNaN(parseFloat(purchaseAmount))) {
      return;
    }
    setIsContributing(true);
    let retries = 0;
    while (retries < MAX_RETRIES) { 
      try {
        
        // Convert purchase amount SOL to lamports  
        const contributionAmount = Math.min(parseFloat(purchaseAmount), MAX_CONTRIBUTION_SOL);
        const lamports = new BN(Math.floor(contributionAmount * LAMPORTS_PER_SOL));
        const anchorContributeResponse = await fetch('api/meme-arena/contribute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memeProgramId: meme.memeProgramId,
            contributor: publicKey,
            amount: lamports.toString(), // send the amount in lamports
          }),
        })
        if (!anchorContributeResponse.ok) {
          throw new Error('Failed to create transaction')       
        }

        const { serializedTransaction, lastValidBlockHeight } = await anchorContributeResponse.json();
        const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'))

        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(`Contribute ${contributionAmount} SOL to Meme: ${meme.name}`, "utf-8")
          })
        );        
        const signed = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        const confirmationStrategy = {
          signature,
          blockhash: transaction.recentBlockhash!,
          lastValidBlockHeight: lastValidBlockHeight
        };
        const confirm = await connection.confirmTransaction(confirmationStrategy);
        if (confirm.value.err) {
          throw new Error('Transaction failed');
        }
        const response = await fetch('/api/meme-arena/ip')
        const ipResponse = await response.json()
        const dto: CreateMemeContributionDto = {
          meme: meme.id,
          session: session.id,
          contributor: publicKey.toString(),
          contributorIpAddress: ipResponse.ip,
          amount: lamports.toNumber(), // store the amount in lamports
        }
        await createMemeContribution(dto)        
        setIsContributing(false)
        checkEligibility()
        break;

      } catch (error) {
        retries++;
        if (retries < MAX_RETRIES) {
          //toast.error(`Attempt ${retries} failed. Retrying...`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        } else {
          setIsContributing(false)
          //toast.error('Failed to contribute after multiple attempts. Please try again later.')
        }
        throw error
      }
    }

    setIsContributing(false)

  }, [meme, publicKey, purchaseAmount, session.id, signTransaction, connection, isEligible, checkEligibility])

  return {
    isVisible,
    remainingTime,
    purchaseAmount,
    setPurchaseAmount: setPurchaseAmountWithLimit,
    isTokenCreation,
    isEligible,
    handleContribute,
    copyToClipboard,
    MAX_CONTRIBUTION_SOL,
    isContributing
  }
}
'use client';

import { Button } from '@/components/ui/button';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect, useCallback } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function UserNav() {
  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const getBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error getting balance:', error);
      }
    }
  }, [publicKey, connection]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (publicKey) {
      getBalance();

      // WebSocket subscription for account changes
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (updatedAccountInfo) => {
          setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
        },
        'confirmed'
      );

      return () => {
        try {
          connection.removeAccountChangeListener(subscriptionId);
        } catch (error) {
          console.error('Error removing listener:', error);
        }
      };
    }
  }, [publicKey, connection, getBalance]);

  if (!mounted) return null;

  if (!publicKey) {
    return (
      <Button 
        variant="outline" 
        className="relative h-8 w-auto rounded-full px-4"
        onClick={() => setVisible(true)}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">
        {publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4)}
      </span>
      {balance !== null && (
        <span className="text-sm font-medium">
          {balance.toFixed(2)} SOL
        </span>
      )}
      <Button 
        variant="outline" 
        className="h-8 px-2"
        onClick={() => disconnect()}
      >
        Disconnect
      </Button>
      <Button
        variant="ghost"
        className="h-8 px-2"
        onClick={getBalance}
      >
        ↻
      </Button>
    </div>
  );
}
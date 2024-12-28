'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export function UserNav() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Button 
        variant="outline" 
        className="h-8 px-2"
        onClick={() => disconnect()}
      >
        Disconnect
      </Button>
    </div>
  );
}

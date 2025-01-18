"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RefreshCw, SendIcon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SolanaIcon from "@/components/ui/solana-icon";

const AirdropFaucet = () => {
  const [amount, setAmount] = useState("");
  const [solBal, setSolBal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAirDropping, setIsAirDropping] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const getBalance = async () => {
    try {
      if (!wallet.publicKey) {
        throw new Error("Wallet public key is missing.");
      }
      const balance = await connection.getBalance(wallet.publicKey);
      setSolBal(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Balance fetch error:", error);
      setSolBal(0);
    }
  };

  const handleRefreshBalance = async () => {
    setIsLoading(true);
    try {
      await getBalance();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirdrop = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsAirDropping(true);
    try {
      if (!wallet.publicKey) {
        throw new Error("Wallet public key is missing!");
      }
      
      await connection.requestAirdrop(
        wallet.publicKey,
        parseFloat(amount) * LAMPORTS_PER_SOL
      );

      toast.success("Airdrop successful!");
      await handleRefreshBalance();
      setAmount("");
    } catch (error) {
      console.error("Airdrop error:", error);
      toast.error("Airdrop failed!", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsAirDropping(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      getBalance();
    }
  }, [wallet.connected]);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-center">
        <SolanaIcon className="w-16 h-16" />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Request Airdrop</h2>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see your faucet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Maximum of 5 requests per hour
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base">Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isLoading || !wallet.connected}
              className="text-primary-foreground"
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <motion.div 
            className="bg-[#1E2B1A] rounded-lg p-4 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-xl font-semibold">
              {isLoading ? "..." : solBal.toFixed(8)}
            </span>
            <span className="ml-2 text-[#66F94B]">SOL</span>
          </motion.div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Airdrop Amount (SOL)
          </label>
          <Input
            type="number"
            placeholder="Enter amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background border-gray-800"
          />
        </div>

        <Button
          className="w-full bg-[#66F94B] hover:bg-[#66F94B]/90 text-black font-medium h-12"
          onClick={handleAirdrop}
          disabled={isAirDropping || !wallet.connected || !amount}
        >
          {isAirDropping ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <SendIcon className="w-4 h-4" />
              Confirm Airdrop
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AirdropFaucet;
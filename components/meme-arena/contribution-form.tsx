import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import SolIcon from '@/components/ui/solana-icon';

interface ContributionFormProps {
  isEligible: boolean;  
  minContributionSol: number;
  maxContributionSol: number;
  eligibilityError?: string | null;
  isContributing: boolean;
  handleContribute: () => Promise<void>;
  purchaseAmount: string;
  setPurchaseAmount: (amount: string) => void;
  connected: boolean;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  isEligible,
  minContributionSol,
  maxContributionSol,
  isContributing,
  eligibilityError,
  handleContribute,
  purchaseAmount,
  setPurchaseAmount,
  connected
}) => {
  if (!connected) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-4"
      >
        <WalletMultiButton className="mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">
          Connect your wallet to contribute to this meme
        </p>
      </motion.div>
    );
  }

  if (!isEligible) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-4"
      >
        <p className="text-sm text-red-500 font-medium">
          {eligibilityError || `You've already contributed. A second contribution is not permitted.`}
        </p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[0.1, 0.3, 0.5, 1].map((amount) => (
          <Button
            key={amount}
            size="sm"
            disabled={isContributing}
            variant="outline"
            className="font-bold transition-all transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            onClick={() => setPurchaseAmount(amount.toString())}
          >
            <SolIcon className="mr-1 w-4 h-4" />
            {amount}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
      <Input
          type="number"
          disabled={!isEligible || isContributing}
          value={purchaseAmount ?? ''}
          onChange={(e) => setPurchaseAmount(e.target.value)}
          min={minContributionSol}
          max={maxContributionSol}
          step={minContributionSol}
          className="w-full sm:w-2/3"
        />
        <Button
          disabled={
            !isEligible || 
            !purchaseAmount || 
            isNaN(parseFloat(purchaseAmount)) || 
            parseFloat(purchaseAmount) < minContributionSol ||
            parseFloat(purchaseAmount) > maxContributionSol ||
            isContributing
          } 
          className="w-full sm:w-1/3"
          onClick={handleContribute}
        >
          {isContributing ? 'Contributing...' : 'Contribute'}
        </Button>
      </div>
    </motion.div>
  );
};
import React from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SolIcon from '@/components/ui/solana-icon'

interface ContributionFormProps {
  isEligible: boolean;
  MAX_CONTRIBUTION_SOL: number;
  isContributing: boolean;
  handleContribute: () => Promise<void>;
  purchaseAmount: string;
  setPurchaseAmount: (amount: string) => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  isEligible,
  MAX_CONTRIBUTION_SOL,
  isContributing,
  handleContribute,
  purchaseAmount,
  setPurchaseAmount
}) => {
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
            disabled={!isEligible}
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
          placeholder="Amount in SOL"
          value={purchaseAmount ?? ''}
          onChange={(e) => setPurchaseAmount(e.target.value)}
          max={MAX_CONTRIBUTION_SOL}
          step="0.1"
          className="w-full sm:w-2/3"
        />
        <Button 
          disabled={!isEligible || purchaseAmount === null || isNaN(parseFloat(purchaseAmount)) || isContributing} 
          className='w-full sm:w-1/3'         
          onClick={handleContribute}
        >
          {!isContributing ? 'Contribute' : 'Contributing...'} 
        </Button>
      </div>
    </motion.div>
  )
}
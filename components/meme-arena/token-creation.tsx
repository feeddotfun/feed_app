import React from 'react'
import { motion } from 'framer-motion'
import { TokenCreationAnimation } from '@/components/ui/token-creation-animation'
import SolanaIcon from '@/components/ui/solana-icon'

export const TokenCreation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="relative w-40 h-40">
        <TokenCreationAnimation />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center">
            <SolanaIcon className="w-12 h-12" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-6">Creating Token</h2>
      <p className="text-lg mt-2">Please wait while we create token on pump.fun...</p>
      <div className="mt-4 flex space-x-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </motion.div>
  )
}
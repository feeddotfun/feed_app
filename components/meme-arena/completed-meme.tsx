import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from 'lucide-react'
import { MemeArenaSessionData, MemeData } from "@/types"
import { IconCopy } from '@tabler/icons-react'

interface CompletedMemeProps {
  session: MemeArenaSessionData;
}

export const CompletedMeme: React.FC<CompletedMemeProps> = ({ session }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = useCallback(() => {
    if (session.tokenMintAddress) {
      navigator.clipboard.writeText(session.tokenMintAddress)
        .then(() => {
          setCopiedStates(prev => ({ ...prev, [session.id!]: true }));
          setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [session.id!]: false }));
          }, 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  }, [session.tokenMintAddress, session.id]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`flex items-center w-full max-w-md rounded-md p-2 border transition-all duration-300 ${
        copiedStates[session.id!] 
          ? 'border-green-500 bg-green-100 dark:bg-green-900' 
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
      }`}>
        <input 
          type="text" 
          value={session.tokenMintAddress} 
          readOnly 
          className="bg-transparent text-sm flex-grow font-mono w-0 min-w-0 overflow-hidden text-ellipsis focus:outline-none"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="ml-2 focus:ring-2 focus:ring-primary"
        >
          <IconCopy size={18} className={`transition-colors duration-300 ${copiedStates[session.id!] ? 'text-green-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`} />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-300"
        asChild
      >
        <a
          href={`https://pump.fun/${session.tokenMintAddress}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>View on Pump.fun</span>
          <ExternalLink size={14} />
        </a>
      </Button>
    </motion.div>
  )
}
'use client'

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { IconCopy } from '@tabler/icons-react';
import { cn } from "@/lib/utils";

interface CopyAddressProps {
  address: string;
  id: string;
  externalLink?: {
    url: string;
    text: string;
  };
  className?: string;
  isCompact?: boolean;
}

export const CopyAddress: React.FC<CopyAddressProps> = ({
  address,
  id,
  externalLink,
  className = '',
  isCompact = false
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!address) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        setIsCopied(true);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setIsCopied(true);
        } catch {
        }
        document.body.removeChild(textArea);
      }

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch  {
    }
  }, [address]);

  const containerClasses = cn(
    "flex items-center transition-all duration-300",
    isCompact ? "w-full" : "flex-col items-center justify-center space-y-4",
    className
  );

  const inputContainerClasses = cn(
    "flex items-center rounded-md border transition-all duration-300",
    isCompact ? "w-full p-1.5" : "w-full max-w-md p-2",
    isCopied 
      ? 'border-green-500 bg-green-100 dark:bg-green-900' 
      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
  );

  const buttonClasses = cn(
    "focus:ring-2 focus:ring-primary",
    isCompact ? "h-5 w-5 ml-1" : "h-8 w-8 ml-2"
  );

  const iconSize = isCompact ? 12 : 18;
  const textSize = isCompact ? "text-xs leading-none" : "text-sm";

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={inputContainerClasses}>
        <input 
          type="text" 
          value={address} 
          readOnly 
          className={cn(
            "bg-transparent font-mono w-0 min-w-0 overflow-hidden text-ellipsis focus:outline-none flex-grow",
            textSize
          )}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className={buttonClasses}
        >
          <IconCopy 
            size={iconSize}
            className={`transition-colors duration-300 ${
              isCopied 
                ? 'text-green-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`} 
          />
        </Button>
      </div>

      {externalLink && !isCompact && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-300"
          asChild
        >
          <a
            href={externalLink.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{externalLink.text}</span>
            <ExternalLink size={14} />
          </a>
        </Button>
      )}
    </motion.div>
  );
};
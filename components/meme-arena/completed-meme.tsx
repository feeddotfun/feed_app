import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Check, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemeArenaSessionData } from "@/types";
import { IconCopy } from '@tabler/icons-react';

interface CompletedMemeProps {
  session: MemeArenaSessionData;
}

export const CompletedMeme: React.FC<CompletedMemeProps> = ({ session }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (session.tokenMintAddress) {
      try {
        await navigator.clipboard.writeText(session.tokenMintAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [session.tokenMintAddress]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Token Creation Success Banner */}
      <Alert className="bg-green-500/10 border-green-500/50 w-full max-w-md">
        <RefreshCcw className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-sm text-green-500">
          Token creation completed successfully! 🎉
        </AlertDescription>
      </Alert>

      {/* Token Information Card */}
      <Card className="w-full max-w-md bg-secondary/5">
        <CardContent className="pt-6 space-y-4">
          {/* Mint Address */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Token Mint Address</span>
              <Badge variant="outline" className="text-xs">Verified ✓</Badge>
            </div>
            <div className={`
              flex items-center w-full rounded-md p-2 border bg-background/50
              transition-all duration-300 ${copied ? 'border-green-500' : 'border-border'}
            `}>
              <input 
                type="text" 
                value={session.tokenMintAddress} 
                readOnly 
                className="bg-transparent text-sm flex-grow font-mono px-2 focus:outline-none overflow-hidden text-ellipsis"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="ml-2 h-8 w-8"
              >
                <IconCopy size={16} className={`transition-colors duration-300 ${copied ? 'text-green-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`} />
              </Button>
            </div>
          </div>

          {/* Transaction Hash */}
          {session.tx && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
                <Badge variant="outline" className="text-xs">Confirmed</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs font-mono"
                asChild
              >
                <a
                  href={`https://solscan.io/tx/${session.tx}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="truncate max-w-[250px]">{session.tx}</span>
                  <ExternalLink size={12} />
                </a>
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="w-full"
              asChild
            >
              <a
                href={`https://pump.fun/${session.tokenMintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <span>Trade on Pump.fun</span>
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contributor Information Alert */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full max-w-md"
        >
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription className="text-sm">
              <span className="font-semibold text-primary">Note for Contributors:</span>
              <br />
              After the contribution period ends, you can claim your tokens or withdraw your contribution from the My Investments section. Make sure to check your eligible amount based on your contribution.
            </AlertDescription>
          </Alert>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CompletedMeme;
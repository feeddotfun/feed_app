import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Timer, Wallet, Check } from "lucide-react";
import SolIcon from '@/components/ui/solana-icon';
import { CommunitySettingConfig, CommunitySettingKeyType } from "@/types";

type OptionWithVotes = {
  value: number;
  label: string;
  votes: number;
};

interface SettingCardProps {
  settingKey: CommunitySettingKeyType;
  config: CommunitySettingConfig;
  currentValue: number;
  options: OptionWithVotes[];
  onVote: (value: number) => void;
  isVoting: boolean;
  isWalletConnected: boolean;
}

const getIcon = (iconType: CommunitySettingConfig['iconType']) => {
  switch (iconType) {
    case 'sol':
      return <SolIcon className="w-5 h-5" />;
    case 'clock':
      return <Clock className="w-5 h-5" />;
    case 'timer':
      return <Timer className="w-5 h-5" />;
    case 'wallet':
      return <Wallet className="w-5 h-5" />;
    default:
      return null;
  }
};

export const SettingCard: React.FC<SettingCardProps> = ({
  settingKey,
  config,
  currentValue,
  options,
  onVote,
  isVoting,
  isWalletConnected
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoted, setIsVoted] = useState(false);
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVoteClick = async (value: number) => {
    setSelectedOption(value);
    setIsVoted(false);
    
    try {
      await onVote(value);
      setIsVoted(true);
      setTimeout(() => {
        setIsVoted(false);
        setSelectedOption(null);
      }, 2000);
    } catch {
      setSelectedOption(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          {getIcon(config.iconType)}
          <CardTitle className="text-xl">{config.title}</CardTitle>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              Current: {config.format(currentValue)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {options.map((option) => {
              const percentage = totalVotes > 0 
                ? Math.round((option.votes / totalVotes) * 100) 
                : 0;
              const isWinning = option.votes === Math.max(...options.map(o => o.votes));
              const isSelected = selectedOption === option.value;

              return (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: isVoting ? 1 : 1.02 }}
                  whileTap={{ scale: isVoting ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`
                      w-full h-auto flex flex-col p-4 relative overflow-hidden
                      transition-all duration-300
                      ${isSelected && isVoted ? 'bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)]' : ''}
                    `}
                    onClick={() => handleVoteClick(option.value)}
                    disabled={isVoting || !isWalletConnected}
                  >
                    <AnimatePresence>
                      {isSelected && isVoted && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-emerald-500/5"
                          style={{
                            backdropFilter: 'blur(4px)'
                          }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <div className="z-10 relative">
                      <div className="font-bold mb-1 flex items-center justify-center gap-1">
                        {settingKey.includes('Sol') ? <SolIcon className="w-4 h-4" /> : <Clock className="w-4 h-4"/>}
                        {option.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.votes} votes ({percentage}%)
                      </div>
                    </div>

                    <div 
                      className={`absolute bottom-0 left-0 h-1 ${isWinning ? 'bg-primary' : 'bg-muted'}`}
                      style={{ 
                        width: `${percentage}%`,
                        opacity: isWinning ? 1 : 0.5 
                      }} 
                    />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
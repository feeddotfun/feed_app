'use client'

import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SolIcon from '@/components/ui/solana-icon';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { CommunitySettingKeyType, CommunitySettingOption } from '@/types';
import { SETTINGS_CONFIG } from '@/constants/community-setting.config';
import { SettingCard } from './setting-card';
import { VotingProgress } from './voting-progress';
import { useCommunitySetting } from '@/lib/query/community-setting/hooks';


const CommunitySetting: React.FC = () => {
  const { publicKey } = useWallet();
  const { 
    votingStartTime,
    votingEndTime,
    isLoading, 
    vote, 
    isVoting,
    getVotesForSetting,
    getCurrentValue
  } = useCommunitySetting();


  const handleVote = async (settingKey: string, selectedValue: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    try {
      await vote({
        voter: (Math.random() + 1).toString(36).substring(7),  //publicKey.toString(), //!!! Just Testing
        settingKey,
        selectedValue
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit vote');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const prepareOptionsWithVotes = (settingKey: CommunitySettingKeyType) => {
    const configOptions = SETTINGS_CONFIG[settingKey].options;
    const voteData = getVotesForSetting(settingKey);
    
    return configOptions.map((option) => ({
      ...option,
      votes: voteData.find(v => v.optionValue === option.value)?.votes || 0
    })) as Array<CommunitySettingOption & { votes: number }>;
  }

  const categories = useMemo(() => ({
    investment: Object.entries(SETTINGS_CONFIG)
      .filter(([_, config]) => config.category === 'investment'),
    timing: Object.entries(SETTINGS_CONFIG)
      .filter(([_, config]) => config.category === 'timing')
  }), []);
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Community Setting</h1>
        <VotingProgress 
          endTime={votingEndTime!}
          startTime={votingStartTime!}
        />
      </div>

      <Tabs defaultValue="investment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <SolIcon className="w-4 h-4" />
            Investment Limits
          </TabsTrigger>
          <TabsTrigger value="timing" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timing Settings
          </TabsTrigger>
        </TabsList>
        
        {(['investment', 'timing'] as const).map(category => (
        <TabsContent 
          key={category}
          value={category} 
          className="mt-6"
        >
          <AnimatePresence mode="sync">
            <motion.div 
              key={category}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {categories[category].map(([key, config]) => (
                <SettingCard
                  key={key}
                  settingKey={key as CommunitySettingKeyType}
                  config={config}
                  currentValue={getCurrentValue(key) || 0}
                  options={prepareOptionsWithVotes(key as CommunitySettingKeyType)}
                  onVote={(value) => handleVote(key, value)}
                  isVoting={isVoting}
                  isWalletConnected={!!publicKey}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      ))}
      </Tabs>
    </div>
  );
};

export default CommunitySetting;
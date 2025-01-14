'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Vote, Trophy, Wallet, ThumbsUp, Award } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAirdropStats } from '@/lib/query/airdrop-stats/hooks';
import SolIcon from '@/components/ui/solana-icon';
import { formatNumber } from '@/lib/utils';
import { AirdropStatsSkeleton, ConnectWalletMessage } from '@/components/skeletons';

interface ActivityCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  points: number;
  color?: string;
}

const ActivityCard = ({ 
  icon: Icon, 
  title, 
  value, 
  points
}: ActivityCardProps) => (
  <div className="bg-[#141716] rounded-lg p-4 lg:p-6">
    <div className="space-y-1.5">
      <div className="text-gray-400 text-xs sm:text-sm">
        {title}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {value}
        </span>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-[#99FF19]" />
      </div>
      <div className="text-gray-500 text-xs sm:text-sm">
        {points} points each
      </div>
    </div>
  </div>
);

const AirdropStats = () => {
  const [mounted, setMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const { stats, isLoading } = useAirdropStats(publicKey?.toString());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AirdropStatsSkeleton />;
  }

  const renderContent = () => {
      if (!connected || !publicKey) {
        return <ConnectWalletMessage title='Airdrop Stats'/>
      }

      if (!stats)
        return

      if (isLoading) {
        return <AirdropStatsSkeleton />;
      }

      return (
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
          {/* Header with Total Points Progress */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">Airdrop Stats</h1>
              <Badge variant="outline" className="font-mono text-sm sm:text-base w-fit">
                {formatNumber(stats.totalPoints)} / {formatNumber(stats.maxPoints)} points
              </Badge>
            </div>
            <Progress value={stats.progress} className="h-2" />
          </div>
    
          {/* Wallet Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 sm:p-4 bg-secondary/50 rounded-lg">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs sm:text-sm break-all">{publicKey.toString()}</span>
          </div>
    
          {/* Activity Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <ActivityCard 
              icon={ThumbsUp}
              title="Meme Votes"
              value={stats.activities.votes.count}
              points={10}
            />
            <ActivityCard 
              icon={Vote}
              title="Community Votes"
              value={stats.activities.communityVotes.count}
              points={15}
            />
            <ActivityCard 
              icon={Trophy}
              title="Contributions"
              value={`${stats.activities.contributions.count}`}
              points={50}
            />
            <ActivityCard 
              icon={Award}
              title="Claims"
              value={stats.activities.claims.count}
              points={70}
            />
          </div>
    
          {/* Detailed Tabs */}
          <Tabs defaultValue="votes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="votes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Votes
              </TabsTrigger>
              <TabsTrigger value="contributions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                Contributions
              </TabsTrigger>
              <TabsTrigger value="claims" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                Claims
              </TabsTrigger>
            </TabsList>
    
            <TabsContent value="votes" className="mt-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col space-y-4 sm:space-y-6">
                      <div className="flex justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">Voting Activity</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Meme votes and community governance
                          </p>
                        </div>
                      </div>
                      
                      {/* Meme Votes */}
                      <div className="flex items-center justify-between p-4 sm:p-6 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-green-500 flex items-center justify-center">
                            <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Meme Votes</div>
                            <div className="text-xl sm:text-3xl font-bold">{stats.activities.votes.count}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-muted-foreground">Points</div>
                          <div className="text-sm sm:text-base font-semibold">{formatNumber(stats.activities.votes.points)}</div>
                        </div>
                      </div>
    
                      {/* Community Votes */}
                      <div className="flex items-center justify-between p-4 sm:p-6 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-green-500 flex items-center justify-center">
                            <Vote className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Community Votes</div>
                            <div className="text-xl sm:text-3xl font-bold">{stats.activities.communityVotes.count}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-muted-foreground">Points</div>
                          <div className="text-sm sm:text-base font-semibold">{formatNumber(stats.activities.communityVotes.points)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
    
            <TabsContent value="contributions" className="mt-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col space-y-4 sm:space-y-6">
                      <div className="flex justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">Contribution History</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total SOL contributed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 sm:p-6 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Contributions</div>
                            <div className="text-xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
                              <span>{stats.activities.contributions.count}</span>
                              <div className="text-sm sm:text-base text-muted-foreground flex items-center gap-1">
                                ({stats.activities.contributions.totalSol.toFixed(2)} SOL
                                <SolIcon className="w-3 h-3 sm:w-4 sm:h-4" />)
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-muted-foreground">Points</div>
                          <div className="text-sm sm:text-base font-semibold">
                            {formatNumber(stats.activities.contributions.points)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
    
            <TabsContent value="claims" className="mt-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col space-y-4 sm:space-y-6">
                      <div className="flex justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">Claim Activity</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Successfully claimed tokens</p>
                        </div>                   
                      </div>
                      
                      <div className="flex items-center justify-between p-4 sm:p-6 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Total Claims</div>
                            <div className="text-xl sm:text-3xl font-bold">{stats.activities.claims.count}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-muted-foreground">Points</div>
                          <div className="text-sm sm:text-base font-semibold">{formatNumber(stats.activities.claims.points)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
  }

  return renderContent();
};

export default AirdropStats;
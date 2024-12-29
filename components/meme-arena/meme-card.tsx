'use client'

import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, ThumbsUp, Newspaper } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MemeData } from '@/types';
import { useVoteMeme } from '@/lib/queries/meme-queries';

// ** Utils
import { v4 as uuidv4 } from 'uuid';

interface MemeCardProps {
  meme: MemeData;
  sessionId: string;
  walletAddress: string;
  walletConnected: boolean;
}

const MemeCard: React.FC<MemeCardProps> = ({ 
  meme, 
  sessionId, 
  walletAddress, 
  walletConnected 
}) => {
  const voteMutation = useVoteMeme();
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleVote = async () => {
    if (!walletConnected || voteMutation.isPending) return;
    
    try {
      await voteMutation.mutateAsync({
        session: sessionId,
        meme: meme.id,
        voter: uuidv4(),
        voterIpAddress: uuidv4(),
      });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const truncatedName = meme.name.length > 32 
    ? `${meme.name.substring(0, 29)}...` 
    : meme.name;

    return (
      <Card className={cn(
        "h-full flex flex-col hover:shadow-lg transition-all duration-300",
        meme.isFromNews && "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent"
      )}>
        <div className="relative w-full aspect-[16/9] bg-muted group">
          {/* Blur background for aesthetics */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={meme.image}
              alt=""
              fill
              className="object-cover blur-xl opacity-50 scale-110"
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* Main image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "relative w-full h-full transition-opacity duration-300",
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}>
              <Image
                src={meme.image}
                alt={`Meme: ${meme.name}`}
                fill
                className="object-contain"
                onLoad={() => setImageLoaded(true)}
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
  
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
  
          {meme.isFromNews && (
            <div className="absolute top-2 left-2 z-10">
              <Badge 
                variant="secondary" 
                className="bg-background/80 backdrop-blur-sm font-medium flex items-center gap-1.5"
              >
                <Newspaper className="w-3 h-3" />
                News Meme
              </Badge>
            </div>
          )}
        </div>
  
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-bold text-lg truncate">
                      {truncatedName}
                    </h3>
                  </TooltipTrigger>
                  {meme.name.length > 32 && (
                    <TooltipContent>
                      <p>{meme.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "shrink-0",
                meme.isFromNews && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {meme.ticker}
            </Badge>
          </div>
        </CardHeader>
  
        <CardContent className="pb-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {meme.description}
          </p>
        </CardContent>
  
        <CardFooter className="pt-4 flex justify-between items-center border-t">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{meme.totalVotes}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Total Votes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
  
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {walletConnected && (
              <Button
                variant="default"
                size="sm"
                onClick={handleVote}
                disabled={voteMutation.isPending}
                className="font-semibold bg-primary hover:bg-primary/90"
              >
                {voteMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Voting...</span>
                  </span>
                ) : (
                  'Vote'
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
};

export default MemeCard;
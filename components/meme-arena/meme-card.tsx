import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, ThumbsUp, Newspaper } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MemeData } from '@/types';

interface MemeCardProps {
  meme: MemeData;
  walletConnected: boolean;
  onVote: (memeId: string) => Promise<void>;
  isVoting: boolean;
}

export default function MemeCard({ 
  meme, 
  walletConnected,
  onVote,
  isVoting 
}: MemeCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

 const handleVote = async () => {
    if (!walletConnected || isVoting) return;
    await onVote(meme.id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: meme.name,
        text: meme.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Card className={cn(
      "h-full flex flex-col hover:shadow-lg transition-all duration-300",
      meme.isFromNews && "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent"
    )}>
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={meme.image}
            alt=""
            fill
            className="object-cover blur-xl opacity-50 scale-110"
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
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

        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {meme.isFromNews && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm font-medium flex items-center gap-1.5"
          >
            <Newspaper className="w-3 h-3" />
            News Meme
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-bold text-lg truncate">
                  {meme.name}
                </h3>
              </TooltipTrigger>
              {meme.name.length > 32 && (
                <TooltipContent>
                  <p>{meme.name}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          {walletConnected && (
            <Button
              variant="default"
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className="font-semibold bg-primary hover:bg-primary/90"
            >
              {isVoting ? (
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
}
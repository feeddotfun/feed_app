'use client'
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2 } from "lucide-react";
import { useWinningMemes } from '@/lib/query/winning-memes/hooks';
import MemeCard from './meme-card';
import { Separator } from '../ui/separator';
import { WinningMemesSkeleton } from '../skeletons';

const WinningMemesPage = () => {
  const [sortBy, setSortBy] = useState('votes');
  const { 
    memes, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useWinningMemes();

  const sortedMemes = useMemo(() => {
    if (!memes) return [];
    
    return [...memes].sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'marketCap':
          return 0;
        case 'created':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });
  }, [memes, sortBy]);

  if (isLoading) {
    return <WinningMemesSkeleton />;
  }

  if (isError) {
    return <div>Error loading winning memes</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Winning Memes
        </h1>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-[#141716] border-none">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Most Votes</SelectItem>
            <SelectItem value="marketCap">Market Cap</SelectItem>
            <SelectItem value="created">Creation Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMemes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WinningMemesPage;
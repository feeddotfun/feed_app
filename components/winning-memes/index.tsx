'use client'
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2, Clock } from "lucide-react";
import { useWinningMemes } from '@/lib/query/winning-memes/hooks';
import MemeCard from './meme-card';
import { Separator } from '../ui/separator';
import { WinningMemesSkeleton } from '../skeletons';
import { WinningMemesSortType } from '@/types';

const WinningMemesPage = () => {
  const [sortBy, setSortBy] = useState<WinningMemesSortType>('votes');
  const { 
    memes, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useWinningMemes(sortBy);

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
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as WinningMemesSortType)}>
          <SelectTrigger className="w-[180px] bg-[#141716] border-none">
            <SelectValue>
              {sortBy === 'votes' && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Most Votes
                </div>
              )}
              {sortBy === 'created' && (
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4'/> Creation Time
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Most Votes
              </div>
            </SelectItem>
            <SelectItem value="created">
              <div className='flex items-center gap-2'>
                <Clock className="h-4 w-4" />
                Creation Time
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.map((meme) => (
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
            className="border-[#99FF19]/20 text-[#99FF19] hover:bg-[#99FF19]/10"
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

export default WinningMemesPage
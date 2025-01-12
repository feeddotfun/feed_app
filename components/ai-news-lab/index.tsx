'use client'

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
import { useAINewsLab } from '@/lib/query/ai-news-lab/hooks';
import { AINewsLabSkeleton } from '../skeletons';
import { useMemeArena } from '@/lib/query/meme-arena/hooks';

const ITEMS_PER_PAGE = 6;

export default function NewsLabContent() {
  const [imageLoaded, setImageLoaded] = React.useState<{[key: string]: boolean}>({});
  const [visibleItems, setVisibleItems] = React.useState(ITEMS_PER_PAGE);
  const [loadingItems, setLoadingItems] = React.useState<{[key: string]: boolean}>({});
  
  const { items, convertMutation } = useAINewsLab();
  const { session, memes } = useMemeArena();


  if (items.isLoading || !items.data || !session) {
    return <AINewsLabSkeleton />;
  }

  const handleTransformToMeme = async (newsId: string) => {
    if (memes?.length >= session?.maxMemes) {
      return;
    }
    
    try {
      setLoadingItems(prev => ({ ...prev, [newsId]: true }));      
      await convertMutation.mutateAsync(newsId);
    } catch  {
      throw new Error('Failed to transform')
    } finally {
      setLoadingItems(prev => ({ ...prev, [newsId]: false }));
    }
  };

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };


  if (items.error) {
    return <div>Error loading news</div>; 
  }

  const displayedItems = items.data.items.slice(0, visibleItems);
  const hasMoreItems = items.data.items.length > visibleItems;

  return (
    <div className="py-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AI News Lab</h1>
        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground text-sm">
            Transform trending news into viral memes ✨
          </p>
          <div className="flex items-center gap-4">
            {memes && (
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {memes.length}/{session.maxMemes}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              T30
            </Badge>
          </div>
        </div>

        <Separator className="shadow mb-6"/>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group overflow-hidden bg-card hover:shadow-md transition-all duration-300 h-[450px] flex flex-col">
                  <CardContent className="p-3 flex-1 flex flex-col">
                    {/* Image Section */}
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted group mb-3">
                      {/* Blur background */}
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover blur-xl opacity-50 scale-110"
                          priority={false}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      {/* Main image */}
                      <div className={cn(
                        "relative w-full h-full transition-opacity duration-300",
                        imageLoaded[item.id] ? 'opacity-100' : 'opacity-0'
                      )}>
                        <Image
                          src={item.image}
                          alt={`Meme: ${item.name}`}
                          fill
                          className="object-contain"
                          onLoad={() => setImageLoaded(prev => ({ ...prev, [item.id]: true }))}
                          priority={false}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>

                      {/* Loading skeleton */}
                      {!imageLoaded[item.id] && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                      )}

                      {/* AI Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          className="bg-black/50 backdrop-blur-sm text-white border-none font-medium"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col">
                      {/* News Context */}
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2 mb-3">
                        <div className="line-clamp-3">{item.news}</div>
                      </div>

                      {/* Meme Info */}
                      <div className="space-y-2 mb-3 flex-1">
                        <Badge 
                          className="bg-primary/10 text-primary border-primary/20 font-medium text-sm"
                        >
                          {item.ticker}
                        </Badge>
                        <p className="text-sm font-medium">
                          {item.meme}
                        </p>
                      </div>

                      {/* Transform Button */}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handleTransformToMeme(item.id)}
                        disabled={loadingItems[item.id] || convertMutation.isPending || (memes?.length >= session?.maxMemes)}
                      >
                        {loadingItems[item.id] ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Converting...</span>
                          </span>
                        ) : memes?.length >= session?.maxMemes ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Arena Full
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Add to Meme Arena
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMoreItems && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="px-8"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
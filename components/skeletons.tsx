import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Award, ThumbsUp, Trophy, Vote } from "lucide-react";

interface ConnectWalletMessageProps {
  title: string;
  description?: string;
}
export const MemeCardSkeleton = () => {
  return (
    <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
  );
};



export const MemeGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="overflow-hidden bg-card hover:shadow-md transition-all duration-300">
          <CardContent className="p-3">
            {/* Image Skeleton */}
            <div className="relative aspect-square rounded-md overflow-hidden bg-muted mb-4">
              <div className="absolute inset-0 animate-pulse" />
              {/* Badge Skeleton */}
              <div className="absolute top-2 right-2">
                <div className="h-5 w-20 bg-black/20 rounded-full" />
              </div>
            </div>

            {/* Content Skeletons */}
            <div className="space-y-4">
              {/* Title and badges container */}
              <div className="space-y-2">
                {/* Title skeleton */}
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                {/* Badge skeleton */}
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                  <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-3 pt-0">
            {/* Vote button skeleton */}
            <div className="w-full h-9 bg-primary/20 rounded animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export const MemeArenaSkeleton = () => {
  return (
    <div className="py-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Meme Arena</h1>
        
        {/* Status and Timer Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-7 w-28 bg-muted/60 rounded-full animate-pulse" />
          <div className="h-5 w-48 bg-muted/60 rounded-full animate-pulse" />
        </div>

        <Separator className="shadow mb-6"/>

        {/* Grid of Meme Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full flex flex-col hover:shadow-lg transition-all duration-300">
              {/* Image Section */}
              <div className="relative w-full aspect-[16/9] bg-muted group">
                <div className="absolute inset-0 animate-pulse" />
                
                {/* Badge Skeleton */}
                <div className="absolute top-2 left-2">
                  <div className="h-6 w-24 bg-background/80 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Content Section */}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="h-7 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                </div>
              </CardHeader>

              <CardContent className="pb-2 flex-grow">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>

              <CardFooter className="pt-4 flex justify-between items-center border-t">
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-20 bg-primary/20 rounded animate-pulse" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AINewsLabSkeleton = () => {
  return (
    <div className="py-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        <Separator className="shadow mb-6" />

        {/* Grid of skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden bg-card h-[450px] flex flex-col">
              <CardContent className="p-3 flex-1 flex flex-col">
                {/* Image skeleton */}
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted mb-3">
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                  <div className="absolute top-2 right-2">
                    <div className="h-6 w-24 bg-black/20 rounded-full" />
                  </div>
                </div>

                {/* Content skeleton */}
                <div className="flex-1 flex flex-col">
                  {/* News context skeleton */}
                  <div className="h-16 bg-muted/50 rounded mb-3 animate-pulse" />

                  {/* Meme info skeleton */}
                  <div className="space-y-2 mb-3 flex-1">
                    <div className="h-6 w-16 bg-primary/10 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Button skeleton */}
                  <div className="h-10 w-full bg-primary/20 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Dashboard Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px] bg-muted/60" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full bg-muted/60" />
                  <Skeleton className="h-7 w-[120px] bg-muted/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Stats Skeleton */}
      <Card className="bg-card/50 backdrop-blur-sm mt-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted/60" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full bg-muted/60" />
                  <Skeleton className="h-6 w-20 bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Chart Skeleton */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24 bg-muted/60" />
        </CardHeader>
        <CardContent>
          <div className="h-[160px] w-full">
            <div className="h-full w-full bg-muted/60 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Trending Memes Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Winners Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-[#99FF19]/20" />
            <Skeleton className="h-6 w-40 bg-muted/60" />
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image Skeleton */}
                    <div className="relative w-full sm:w-28 aspect-square rounded-md bg-muted/60 animate-pulse" />
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-32 bg-muted/60" />
                        <Skeleton className="h-6 w-20 rounded-full bg-muted/60" />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-4 bg-muted/60" />
                          <Skeleton className="h-4 w-16 bg-muted/60" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-24 bg-muted/60" />
                          <Skeleton className="h-4 w-16 bg-muted/60" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <Skeleton className="h-8 w-full bg-muted/60" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Voted Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-[#99FF19]/20" />
            <Skeleton className="h-6 w-40 bg-muted/60" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image Skeleton */}
                    <div className="relative w-full sm:w-28 aspect-square rounded-md bg-muted/60 animate-pulse" />
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-32 bg-muted/60" />
                        <Skeleton className="h-6 w-20 rounded-full bg-muted/60" />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-4 bg-muted/60" />
                          <Skeleton className="h-4 w-16 bg-muted/60" />
                        </div>
                        <Skeleton className="h-4 w-32 bg-muted/60" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const WinningMemesSkeleton = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-[180px] h-10 bg-[#141716] rounded animate-pulse" />
      </div>

      <Separator />

      {/* Grid of Meme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="group relative bg-[#141716]/50 backdrop-blur-sm border-0 overflow-hidden">
            {/* Winner Badge Skeleton */}
            <div className="absolute top-2 left-2 z-10 bg-amber-500/90 h-5 w-20 rounded-full animate-pulse" />

            {/* Image Container */}
            <div className="relative w-full aspect-video bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-muted/60 animate-pulse" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title and Ticker */}
              <div className="flex justify-between items-start gap-2">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-6 w-20 bg-[#99FF19]/10 rounded animate-pulse" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>

              {/* Mint Address */}
              <div className="pt-2 pb-1 border-t border-white/10">
                <div className="h-8 w-full bg-muted rounded animate-pulse" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 pt-2 border-t border-white/10">
                {['Market Cap', 'Votes', 'Created'].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-muted/40 rounded mb-1 animate-pulse" />
                    <div className="h-5 w-16 bg-muted/90 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <div className="h-11 w-[200px] bg-muted/20 rounded animate-pulse" />
      </div>
    </div>
  );
};

export const InvestmentCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="group relative bg-[#141716]/50 backdrop-blur-sm border-0 overflow-hidden">
        {/* Image Skeleton */}
        <div className="relative w-full aspect-video bg-muted/20 overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-muted/10" />
        </div>

        <div className="p-4 space-y-3">
          {/* Title and Ticker Skeleton */}
          <div className="flex justify-between items-start gap-2">
            <div className="h-7 w-48 bg-muted/10 rounded animate-pulse" />
            <div className="h-6 w-20 bg-[#99FF19]/5 rounded animate-pulse" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/10 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted/10 rounded animate-pulse" />
          </div>

          {/* Market Cap Box Skeleton */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="h-5 w-24 bg-muted/10 rounded animate-pulse" />
            <div className="h-5 w-24 bg-[#99FF19]/5 rounded animate-pulse" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index}>
                <div className="h-4 w-16 bg-muted/10 rounded mb-1.5 animate-pulse" />
                <div className="h-5 w-20 bg-muted/10 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Token Address Skeleton */}
          <div className="pt-2 pb-1 border-t border-white/10">
            <div className="h-8 w-full bg-muted/10 rounded animate-pulse" />
          </div>

          {/* Button/Status Skeleton */}
          <div className="pt-3">
            <div className="h-10 w-full bg-[#99FF19]/5 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const ConnectWalletMessage: React.FC<ConnectWalletMessageProps> = ({ 
  title,
  description = `Connect your wallet to see your ${title.toLowerCase()}`
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mb-4">{description}</p>
      <WalletMultiButton />
    </motion.div>
  );
};

export const InvestmentsPageSkeleton = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#99FF19]/20 rounded animate-pulse" />
          <div className="h-8 w-40 bg-muted/10 rounded animate-pulse" />
        </div>
        
        <div className="w-[180px] h-10 bg-[#141716] rounded animate-pulse" />
      </div>

      <Separator className="bg-white/10" />

      {/* Grid of Investment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <InvestmentCardSkeleton key={index} />
        ))}
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center pt-4">
        <div className="h-10 w-32 bg-[#99FF19]/10 rounded animate-pulse" />
      </div>
    </div>
  );
};

export const AirdropStatsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header with Total Points Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-40 bg-muted/60" />
          <Skeleton className="h-6 w-48 bg-muted/60 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full bg-muted/60" />
      </div>

      {/* Wallet Info */}
      <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg">
        <Skeleton className="h-5 w-5 rounded-full bg-muted/60" />
        <Skeleton className="h-5 w-64 bg-muted/60" />
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ThumbsUp, Vote, Trophy, Award].map((Icon, index) => (
          <div key={index} className="bg-[#141716] rounded-lg p-6">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 bg-muted/60 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-16 bg-muted/60" />
                <Icon className="w-6 h-6 text-[#99FF19] opacity-20" />
              </div>
              <Skeleton className="h-4 w-20 bg-muted/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Tabs */}
      <div className="w-full">
        {/* Tab Navigation Skeleton */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['Votes', 'Contributions', 'Claims'].map((tab, index) => (
            <Skeleton key={index} className="h-10 w-full bg-muted/60" />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-6 w-48 bg-muted/60 mb-2" />
                  <Skeleton className="h-4 w-64 bg-muted/60" />
                </div>
              </div>
              
              {/* Content Items */}
              {[1, 2].map((_, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-6 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-muted/60" />
                    <div>
                      <Skeleton className="h-4 w-32 bg-muted/60 mb-2" />
                      <Skeleton className="h-7 w-16 bg-muted/60" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 bg-muted/60 mb-1" />
                    <Skeleton className="h-5 w-24 bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
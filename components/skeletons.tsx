import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const MemeCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-[150px]" />
          {/* Badge skeleton */}
          <Skeleton className="h-5 w-[60px]" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        {/* Votes skeleton */}
        <Skeleton className="h-5 w-[80px]" />
        {/* Button skeleton */}
        <Skeleton className="h-9 w-[100px]" />
      </CardFooter>
    </Card>
  );
};

export const MemeGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <MemeCardSkeleton key={index} />
      ))}
    </div>
  );
};
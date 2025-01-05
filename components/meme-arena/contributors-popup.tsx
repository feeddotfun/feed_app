import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertLamportsToSol } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface Contributor {
  id: string;
  contributor: string;
  amount: number;
  createdAt: string;
}

interface ContributorResponse {
  items: Contributor[];
  total: number;
  totalAmount: number;
}

interface ContributorsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const ContributorsPopup: React.FC<ContributorsPopupProps> = ({ 
  isOpen, 
  onClose,
  sessionId 
}) => {
  const [contributors, setContributors] = useState<ContributorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!isOpen || !sessionId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/meme-arena/contributions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch contributors');
        const data = await response.json();
        setContributors(data);
      } catch (error) {
        console.error('Error fetching contributors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [isOpen, sessionId]);

  const formatAddress = (address: string) => 
    `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Contributors</span>
            {contributors && (
              <span className="text-sm font-normal text-muted-foreground">
                Total: {convertLamportsToSol(contributors.totalAmount)} SOL
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : contributors?.items?.length ? (
            <div className="space-y-4">
              {contributors.items.map((contribution) => (
                <div 
                  key={contribution.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{formatAddress(contribution.contributor)}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    {convertLamportsToSol(contribution.amount)} SOL
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No contributions yet
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
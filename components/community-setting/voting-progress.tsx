import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useCallback } from "react";

interface VotingProgressProps {
  endTime: string;
  startTime: string;
}

export const VotingProgress: React.FC<VotingProgressProps> = ({
  endTime,
  startTime
}) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');

  const calculateProgress = useCallback(() => {
    const start = Date.parse(startTime);
    const end = Date.parse(endTime); 
    const now = Date.now();
    
    if (now >= end) {
      return 100;
    }
    
    const total = end - start;
    const elapsed = now - start;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [startTime, endTime]);

  const getTimeRemaining = useCallback(() => {
    const end = Date.parse(endTime);
    const now = Date.now();
    
    if (end < now) {
      return 'Starting new voting period...';
    }

    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes} minutes remaining`;
  }, [endTime]);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const updateValues = () => {
      setProgress(calculateProgress());
      setTimeRemaining(getTimeRemaining());
    };

    updateValues();
    const interval = setInterval(updateValues, 30000);
    return () => clearInterval(interval);
  }, [calculateProgress, getTimeRemaining, startTime, endTime]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Progress value={progress} className="h-2" />
      </div>
      <div className="text-sm font-medium whitespace-nowrap">
        {timeRemaining}
      </div>
    </div>
  );
};
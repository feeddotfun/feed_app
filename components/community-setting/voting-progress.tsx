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
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const now = Date.now();
      
      if (isNaN(start) || isNaN(end)) {
        return 0;
      }
      
      const total = end - start;
      const elapsed = now - start;
      
      const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
      
      return progress;
    } catch  {
      return 0;
    }
  }, [startTime, endTime]);

  const getTimeRemaining = useCallback(() => {
    try {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      
      if (isNaN(end)) {
        return 'Invalid date';
      }
      
      if (end < now) {
        return 'Voting ended';
      }

      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `Ends in ${days} ${days === 1 ? 'day' : 'days'}`;
      }

      if (hours > 0) {
        return `Ends in ${hours}h ${minutes}m`;
      }

      return `Ends in ${minutes} minutes`;
    } catch {
      return 'Error calculating time';
    }
  }, [endTime]);

  useEffect(() => {
    if (!startTime || !endTime) {
      return;
    }

    const updateValues = () => {
      const newProgress = calculateProgress();
      const newTimeRemaining = getTimeRemaining();
      
      setProgress(newProgress);
      setTimeRemaining(newTimeRemaining);
    };

    // Initial update
    updateValues();

    // Update every minute
    const interval = setInterval(updateValues, 60000);

    return () => clearInterval(interval);
  }, [endTime, startTime, calculateProgress, getTimeRemaining]);

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
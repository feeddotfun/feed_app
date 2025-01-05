import { useState, useEffect, useMemo } from 'react';
import { MemeArenaSessionData } from '@/types';

export const useSessionTimer = (session?: MemeArenaSessionData) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!session) return {
      remainingTime: null,
      contributeEndTime: null, 
      nextSessionTime: null
    };

    const calculateTimeRemaining = (timestamp: string | Date | null | undefined) => {
      if (!timestamp) return null;
      const endTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const remaining = endTime.getTime() - now;
      return remaining > 0 ? Math.floor(remaining / 1000) : null;
    };

    return {
      remainingTime: calculateTimeRemaining(session.votingEndTime),
      contributeEndTime: calculateTimeRemaining(session.contributeEndTime),
      nextSessionTime: calculateTimeRemaining(session.nextSessionStartTime)
    };
  }, [session, now]);
};
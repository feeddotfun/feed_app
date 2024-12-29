import { useState, useEffect } from 'react';
import { MemeArenaSessionData } from '@/types';

export const useSessionTiming = (session?: MemeArenaSessionData) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [nextSessionTime, setNextSessionTime] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();

      if (session.votingEndTime) {
        const remaining = new Date(session.votingEndTime).getTime() - now;
        setRemainingTime(remaining > 0 ? remaining / 1000 : 0);
      }

      if (session.nextSessionStartTime) {
        const next = new Date(session.nextSessionStartTime).getTime() - now;
        setNextSessionTime(next > 0 ? next / 1000 : 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  return { remainingTime, nextSessionTime };
};
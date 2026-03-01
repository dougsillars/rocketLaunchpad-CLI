import { useState, useEffect, useCallback, useRef } from 'react';
import type { Launch } from '../types/launch';
import {
  fetchUpcomingLaunches,
  getCachedLaunches,
  RateLimitError,
} from '../utils/api';

export type LoadingState = 'loading' | 'loaded' | 'error' | 'rate-limited';

interface UseLaunchesResult {
  launches: Launch[];
  state: LoadingState;
  errorMessage: string;
  lastUpdated: Date | null;
  retry: () => void;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_RETRY = 60 * 1000; // 60 seconds

export function useLaunches(): UseLaunchesResult {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [state, setState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadLaunches = useCallback(async () => {
    try {
      setState((prev) => (prev === 'loaded' ? 'loaded' : 'loading'));
      const result = await fetchUpcomingLaunches();
      setLaunches(result.launches);
      setLastUpdated(result.lastUpdated);
      setState('loaded');
      setErrorMessage('');
    } catch (err) {
      if (err instanceof RateLimitError) {
        setState('rate-limited');
        setErrorMessage('Data temporarily unavailable, retrying shortly');
        const cached = getCachedLaunches();
        if (cached) setLaunches(cached);
        setTimeout(loadLaunches, RATE_LIMIT_RETRY);
        return;
      }
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch launch data'
      );
      const cached = getCachedLaunches();
      if (cached) setLaunches(cached);
    }
  }, []);

  useEffect(() => {
    loadLaunches();
    intervalRef.current = setInterval(loadLaunches, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadLaunches]);

  return { launches, state, errorMessage, lastUpdated, retry: loadLaunches };
}

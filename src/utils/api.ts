import type { Launch, LaunchApiResponse } from '../types/launch';

const BASE_URL = 'https://ll.thespacedevs.com/2.2.0';
const PAGE_SIZE = 100;

interface CacheEntry {
  data: Launch[];
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL;
}

function isValidLaunch(item: unknown): item is Launch {
  const l = item as Record<string, unknown>;
  return (
    typeof l === 'object' &&
    l !== null &&
    typeof l.id === 'string' &&
    typeof l.name === 'string' &&
    typeof l.net === 'string' &&
    l.status != null &&
    l.rocket != null &&
    l.launch_service_provider != null &&
    l.pad != null
  );
}

export async function fetchUpcomingLaunches(): Promise<{
  launches: Launch[];
  lastUpdated: Date;
  fromCache: boolean;
}> {
  if (isCacheValid()) {
    return {
      launches: cache!.data,
      lastUpdated: new Date(cache!.timestamp),
      fromCache: true,
    };
  }

  const allLaunches: Launch[] = [];
  let url: string | null = `${BASE_URL}/launch/upcoming/?limit=${PAGE_SIZE}&mode=detailed`;

  while (url) {
    const response = await fetch(url);

    if (response.status === 429) {
      throw new RateLimitError();
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    const data: LaunchApiResponse = await response.json();

    for (const item of data.results) {
      if (isValidLaunch(item)) {
        allLaunches.push(item);
      }
    }

    url = data.next;
  }

  allLaunches.sort(
    (a, b) => new Date(a.net).getTime() - new Date(b.net).getTime()
  );

  cache = { data: allLaunches, timestamp: Date.now() };

  return {
    launches: allLaunches,
    lastUpdated: new Date(),
    fromCache: false,
  };
}

export function getCachedLaunches(): Launch[] | null {
  return cache?.data ?? null;
}

export function clearCache(): void {
  cache = null;
}

export class RateLimitError extends Error {
  constructor() {
    super('API rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, statusText: string) {
    super(`API error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

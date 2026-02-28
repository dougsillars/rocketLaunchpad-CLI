import { API_BASE, CACHE_KEY, CACHE_TTL } from './constants.js';

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export async function fetchLaunches() {
  const cached = getCached();
  const isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL);

  if (isFresh) {
    return { launches: cached.data, fromCache: true, stale: false, timestamp: cached.timestamp };
  }

  try {
    const url = `${API_BASE}?limit=50&format=json&ordering=net`;
    const res = await fetch(url);

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After'), 10) || 60;
      if (cached) {
        return {
          launches: cached.data,
          fromCache: true,
          stale: true,
          timestamp: cached.timestamp,
          retryAfter,
        };
      }
      return {
        launches: [],
        error: `Rate limited. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    if (!res.ok) {
      if (cached) {
        return { launches: cached.data, fromCache: true, stale: true, timestamp: cached.timestamp };
      }
      return { launches: [], error: `API error: ${res.status} ${res.statusText}` };
    }

    const json = await res.json();
    const launches = json.results || [];
    setCache(launches);

    return { launches, fromCache: false, stale: false, timestamp: Date.now() };
  } catch (err) {
    if (cached) {
      return { launches: cached.data, fromCache: true, stale: true, timestamp: cached.timestamp };
    }
    return { launches: [], error: 'Network error. Please check your connection and try again.' };
  }
}

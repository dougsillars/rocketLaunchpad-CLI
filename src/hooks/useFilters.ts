import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Launch } from '../types/launch';

interface FilterState {
  locations: Set<string>;
  providers: Set<string>;
}

function getInitialFilters(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const locations = params.get('locations');
  const providers = params.get('providers');
  return {
    locations: locations ? new Set(locations.split(',')) : new Set(),
    providers: providers ? new Set(providers.split(',')) : new Set(),
  };
}

function syncToUrl(filters: FilterState) {
  const params = new URLSearchParams();
  if (filters.locations.size > 0) {
    params.set('locations', Array.from(filters.locations).join(','));
  }
  if (filters.providers.size > 0) {
    params.set('providers', Array.from(filters.providers).join(','));
  }
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export function useFilters(launches: Launch[]) {
  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  useEffect(() => {
    syncToUrl(filters);
  }, [filters]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    for (const l of launches) {
      if (l.pad?.location?.name) set.add(l.pad.location.name);
    }
    return Array.from(set).sort();
  }, [launches]);

  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    for (const l of launches) {
      if (l.launch_service_provider?.name) set.add(l.launch_service_provider.name);
    }
    return Array.from(set).sort();
  }, [launches]);

  const toggleLocation = useCallback((location: string) => {
    setFilters((prev) => {
      const next = new Set(prev.locations);
      if (next.has(location)) next.delete(location);
      else next.add(location);
      return { ...prev, locations: next };
    });
  }, []);

  const toggleProvider = useCallback((provider: string) => {
    setFilters((prev) => {
      const next = new Set(prev.providers);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return { ...prev, providers: next };
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilters({ locations: new Set(), providers: new Set() });
  }, []);

  const filteredLaunches = useMemo(() => {
    return launches.filter((l) => {
      const matchesLocation =
        filters.locations.size === 0 ||
        filters.locations.has(l.pad?.location?.name);
      const matchesProvider =
        filters.providers.size === 0 ||
        filters.providers.has(l.launch_service_provider?.name);
      return matchesLocation && matchesProvider;
    });
  }, [launches, filters]);

  const activeCount = filters.locations.size + filters.providers.size;
  const hasActiveFilters = activeCount > 0;

  return {
    filteredLaunches,
    availableLocations,
    availableProviders,
    selectedLocations: filters.locations,
    selectedProviders: filters.providers,
    toggleLocation,
    toggleProvider,
    clearAll,
    activeCount,
    hasActiveFilters,
  };
}

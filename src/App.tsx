import './App.css';
import { useLaunches } from './hooks/useLaunches';
import { useFilters } from './hooks/useFilters';
import { LaunchGrid } from './components/LaunchGrid';
import { FilterBar } from './components/FilterBar';

function App() {
  const { launches, state, errorMessage, lastUpdated, retry } = useLaunches();
  const {
    filteredLaunches,
    availableLocations,
    availableProviders,
    selectedLocations,
    selectedProviders,
    toggleLocation,
    toggleProvider,
    clearAll,
    activeCount,
    hasActiveFilters,
  } = useFilters(launches);

  return (
    <div className="app">
      <header style={headerStyles.header}>
        <h1 style={headerStyles.title}>Rocket Launch Tracker</h1>
        <p style={headerStyles.tagline}>
          Upcoming rocket launches from around the world
        </p>
      </header>

      {launches.length > 0 && (
        <FilterBar
          availableLocations={availableLocations}
          availableProviders={availableProviders}
          selectedLocations={selectedLocations}
          selectedProviders={selectedProviders}
          onToggleLocation={toggleLocation}
          onToggleProvider={toggleProvider}
          onClearAll={clearAll}
          activeCount={activeCount}
        />
      )}

      <main style={{ paddingBottom: '2rem' }}>
        <LaunchGrid
          launches={filteredLaunches}
          state={state}
          errorMessage={errorMessage}
          lastUpdated={lastUpdated}
          onRetry={retry}
          onClearFilters={clearAll}
          hasActiveFilters={hasActiveFilters}
        />
      </main>
    </div>
  );
}

const headerStyles: Record<string, React.CSSProperties> = {
  header: {
    textAlign: 'center',
    padding: '2rem 0 1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#e0e0ff',
    marginBottom: '0.25rem',
  },
  tagline: {
    color: '#7a7a9a',
    fontSize: '0.95rem',
  },
};

export default App;

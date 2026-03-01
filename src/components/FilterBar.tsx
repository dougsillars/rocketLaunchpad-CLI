import { useState } from 'react';
import './FilterBar.css';

interface FilterBarProps {
  availableLocations: string[];
  availableProviders: string[];
  selectedLocations: Set<string>;
  selectedProviders: Set<string>;
  onToggleLocation: (location: string) => void;
  onToggleProvider: (provider: string) => void;
  onClearAll: () => void;
  activeCount: number;
}

export function FilterBar({
  availableLocations,
  availableProviders,
  selectedLocations,
  selectedProviders,
  onToggleLocation,
  onToggleProvider,
  onClearAll,
  activeCount,
}: FilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="filter-bar">
      <button
        className="filter-toggle"
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
        <span>{drawerOpen ? '▲' : '▼'}</span>
      </button>

      <div className={`filter-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="filter-bar-inner">
          <div className="filter-group">
            <div className="filter-group-label">Launch Site</div>
            <div className="filter-chips">
              {availableLocations.map((loc) => (
                <button
                  key={loc}
                  className={`filter-chip ${selectedLocations.has(loc) ? 'active' : ''}`}
                  onClick={() => onToggleLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-group-label">Provider</div>
            <div className="filter-chips">
              {availableProviders.map((prov) => (
                <button
                  key={prov}
                  className={`filter-chip ${selectedProviders.has(prov) ? 'active' : ''}`}
                  onClick={() => onToggleProvider(prov)}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            {activeCount > 0 && (
              <>
                <span className="filter-count">{activeCount}</span>
                <button className="filter-clear" onClick={onClearAll}>
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

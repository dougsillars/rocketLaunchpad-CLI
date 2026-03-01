import type { Launch } from '../types/launch';
import type { LoadingState } from '../hooks/useLaunches';
import { LaunchCard } from './LaunchCard';
import { SkeletonCard } from './SkeletonCard';
import './LaunchGrid.css';

interface LaunchGridProps {
  launches: Launch[];
  state: LoadingState;
  errorMessage: string;
  lastUpdated: Date | null;
  onRetry: () => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function LaunchGrid({
  launches,
  state,
  errorMessage,
  lastUpdated,
  onRetry,
  onClearFilters,
  hasActiveFilters,
}: LaunchGridProps) {
  if (state === 'loading' && launches.length === 0) {
    return (
      <div>
        <div className="launch-grid" style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error' && launches.length === 0) {
    return (
      <div style={styles.stateMessage}>
        <p style={styles.errorText}>{errorMessage}</p>
        <button onClick={onRetry} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (state === 'rate-limited') {
    return (
      <div>
        <div style={styles.banner}>
          {errorMessage}
        </div>
        {launches.length > 0 && (
          <div className="launch-grid" style={styles.grid}>
            {launches.map((launch, i) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                showCountdown={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (launches.length === 0 && hasActiveFilters) {
    return (
      <div style={styles.stateMessage}>
        <p style={styles.emptyText}>No launches match your filters</p>
        {onClearFilters && (
          <button onClick={onClearFilters} style={styles.clearButton}>
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  if (launches.length === 0) {
    return (
      <div style={styles.stateMessage}>
        <p style={styles.emptyText}>No upcoming launches scheduled</p>
      </div>
    );
  }

  return (
    <div>
      {state === 'error' && (
        <div style={styles.banner}>
          {errorMessage}{' '}
          <button onClick={onRetry} style={styles.inlineRetry}>
            Retry
          </button>
        </div>
      )}
      {lastUpdated && (
        <p style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      <div className="launch-grid" style={styles.grid}>
        {launches.map((launch, i) => (
          <LaunchCard
            key={launch.id}
            launch={launch}
            showCountdown={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  stateMessage: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  emptyText: {
    color: '#8b8ba7',
    fontSize: '1.1rem',
    marginBottom: '1rem',
  },
  retryButton: {
    padding: '0.6rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  clearButton: {
    padding: '0.6rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#60a5fa',
    border: '1px solid #60a5fa',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  banner: {
    backgroundColor: '#2a1a1a',
    border: '1px solid #4a2a2a',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    color: '#f0a0a0',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  inlineRetry: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 'inherit',
    padding: 0,
  },
  lastUpdated: {
    color: '#6b6b8a',
    fontSize: '0.8rem',
    textAlign: 'right',
    marginBottom: '0.75rem',
  },
};

import { useState, useEffect } from 'react';
import type { Launch } from '../types/launch';
import { formatCountdown, formatDateTime } from '../utils/countdown';

const statusColors: Record<string, string> = {
  Go: '#22c55e',
  TBD: '#eab308',
  TBC: '#f97316',
  Success: '#22c55e',
  Failure: '#ef4444',
  'In Flight': '#3b82f6',
  'Hold': '#eab308',
};

function getStatusColor(abbrev: string): string {
  return statusColors[abbrev] || '#6b7280';
}

interface LaunchCardProps {
  launch: Launch;
  showCountdown?: boolean;
}

export function LaunchCard({ launch, showCountdown }: LaunchCardProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(launch.net));
  const { local, utc } = formatDateTime(launch.net);

  useEffect(() => {
    if (!showCountdown) return;
    const timer = setInterval(() => {
      setCountdown(formatCountdown(launch.net));
    }, 1000);
    return () => clearInterval(timer);
  }, [launch.net, showCountdown]);

  const statusColor = getStatusColor(launch.status.abbrev);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: statusColor + '20',
            color: statusColor,
            borderColor: statusColor + '40',
          }}
        >
          {launch.status.abbrev}
        </span>
        <span style={styles.provider}>
          {launch.launch_service_provider.name}
        </span>
      </div>

      <h3 style={styles.missionName}>
        {launch.mission?.name || launch.name}
      </h3>

      {showCountdown && (
        <div style={styles.countdown}>{countdown}</div>
      )}

      <div style={styles.details}>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Date</span>
          <span style={styles.detailValue}>{local}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>UTC</span>
          <span style={styles.detailValue}>{utc}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Rocket</span>
          <span style={styles.detailValue}>
            {launch.rocket.configuration.name}
          </span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Pad</span>
          <span style={styles.detailValue}>{launch.pad.name}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Location</span>
          <span style={styles.detailValue}>
            {launch.pad.location.name}
          </span>
        </div>
      </div>

      {launch.mission?.description && (
        <p style={styles.description}>
          {launch.mission.description.length > 120
            ? launch.mission.description.slice(0, 120) + '...'
            : launch.mission.description}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #2a2a4a',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    border: '1px solid',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  provider: {
    fontSize: '0.8rem',
    color: '#8b8ba7',
    fontWeight: 500,
  },
  missionName: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#e0e0ff',
    marginBottom: '0.5rem',
    lineHeight: 1.3,
  },
  countdown: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#60a5fa',
    fontFamily: 'monospace',
    marginBottom: '0.75rem',
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    marginBottom: '0.75rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  detailLabel: {
    color: '#6b6b8a',
    fontWeight: 500,
    minWidth: '70px',
  },
  detailValue: {
    color: '#c0c0d8',
    textAlign: 'right' as const,
  },
  description: {
    fontSize: '0.8rem',
    color: '#7a7a9a',
    lineHeight: 1.5,
    borderTop: '1px solid #2a2a4a',
    paddingTop: '0.75rem',
    margin: 0,
  },
};

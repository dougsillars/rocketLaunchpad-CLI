import { CACHE_TTL } from './constants.js';
import { fetchLaunches } from './api.js';
import {
  renderLaunchCard,
  renderLoadingSkeleton,
  renderErrorBanner,
  renderStalenessWarning,
  renderFullError,
  renderEmptyState,
  renderLastUpdated,
} from './components.js';

const grid = document.getElementById('launch-grid');
const bannerContainer = document.getElementById('banner-container');
const statusBar = document.getElementById('status-bar');
const nextLaunchName = document.getElementById('next-launch-name');
const nextLaunchCountdown = document.getElementById('next-launch-countdown');

let allLaunches = [];
let filteredLaunches = [];
let filterState = { locations: new Set(), providers: new Set() };
let countdownInterval = null;

// Show loading skeletons
grid.innerHTML = renderLoadingSkeleton(6);

async function loadData() {
  const result = await fetchLaunches();

  bannerContainer.innerHTML = '';

  if (result.error && result.launches.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(renderFullError(result.error, loadData));
    statusBar.textContent = '';
    return;
  }

  if (result.stale) {
    bannerContainer.appendChild(renderStalenessWarning(result.timestamp));
  }

  if (result.error && result.launches.length > 0) {
    bannerContainer.appendChild(renderErrorBanner(result.error, loadData));
  }

  allLaunches = result.launches;
  statusBar.textContent = result.timestamp ? renderLastUpdated(result.timestamp) : '';

  renderGrid();
  updateNextLaunch();
  startCountdowns();
}

export function applyFilters(launches) {
  return launches.filter(launch => {
    const locationMatch = filterState.locations.size === 0 ||
      [...filterState.locations].some(loc =>
        (launch.pad?.location?.name || '').includes(loc)
      );
    const providerMatch = filterState.providers.size === 0 ||
      filterState.providers.has(launch.launch_service_provider?.name);
    return locationMatch && providerMatch;
  });
}

function renderGrid() {
  filteredLaunches = applyFilters(allLaunches);

  if (filteredLaunches.length === 0 && allLaunches.length > 0) {
    grid.innerHTML = renderEmptyState();
    return;
  }

  grid.innerHTML = filteredLaunches.map(renderLaunchCard).join('');
}

function updateNextLaunch() {
  const now = Date.now();
  const upcoming = allLaunches
    .filter(l => new Date(l.net).getTime() > now && l.status?.abbrev !== 'TBD')
    .sort((a, b) => new Date(a.net) - new Date(b.net));

  if (upcoming.length > 0) {
    nextLaunchName.textContent = upcoming[0].name || 'Unknown Mission';
    nextLaunchName.title = upcoming[0].name || '';
  } else {
    nextLaunchName.textContent = 'No upcoming launches';
    nextLaunchCountdown.textContent = '--';
  }
}

function formatCountdown(diffMs) {
  if (diffMs <= 0) return 'Launched';
  const s = Math.floor(diffMs / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (days > 0) return `${days}d ${hrs}h ${mins}m ${secs}s`;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

function startCountdowns() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = Date.now();

    // Update card countdowns
    document.querySelectorAll('[data-launch-net]').forEach(el => {
      const status = el.dataset.status;
      if (status === 'TBD') return; // TBD shows static text
      const net = new Date(el.dataset.launchNet).getTime();
      el.textContent = formatCountdown(net - now);
    });

    // Update header countdown
    const upcoming = allLaunches
      .filter(l => new Date(l.net).getTime() > now && l.status?.abbrev !== 'TBD')
      .sort((a, b) => new Date(a.net) - new Date(b.net));

    if (upcoming.length > 0) {
      const net = new Date(upcoming[0].net).getTime();
      nextLaunchCountdown.textContent = formatCountdown(net - now);
    }
  }, 1000);
}

// Expose for filters module
export { allLaunches, filterState, renderGrid, startCountdowns, loadData };

// Initial load
loadData();

// Background refresh every 5 minutes
setInterval(loadData, CACHE_TTL);

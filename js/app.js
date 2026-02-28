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
import { startCountdowns, stopCountdowns } from './countdown.js';

const grid = document.getElementById('launch-grid');
const bannerContainer = document.getElementById('banner-container');
const statusBar = document.getElementById('status-bar');
const nextLaunchName = document.getElementById('next-launch-name');
const nextLaunchCountdown = document.getElementById('next-launch-countdown');

let allLaunches = [];
let filterState = { locations: new Set(), providers: new Set() };

// Show loading skeletons
grid.innerHTML = renderLoadingSkeleton(6);

function getNextLaunch() {
  const now = Date.now();
  const upcoming = allLaunches
    .filter(l => new Date(l.net).getTime() > now && l.status?.abbrev !== 'TBD')
    .sort((a, b) => new Date(a.net) - new Date(b.net));
  return upcoming[0] || null;
}

function updateNextLaunchHeader() {
  const next = getNextLaunch();
  if (next) {
    nextLaunchName.textContent = next.name || 'Unknown Mission';
    nextLaunchName.title = next.name || '';
  } else {
    nextLaunchName.textContent = 'No upcoming launches';
    nextLaunchCountdown.textContent = '--';
  }
}

function applyFilters(launches) {
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
  const filtered = applyFilters(allLaunches);

  if (filtered.length === 0 && allLaunches.length > 0) {
    grid.innerHTML = renderEmptyState();
    return;
  }

  grid.innerHTML = filtered.map(renderLaunchCard).join('');
}

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
  updateNextLaunchHeader();
  startCountdowns(getNextLaunch, nextLaunchCountdown);
}

// Expose for filters module
export { allLaunches, filterState, renderGrid, loadData };

// Initial load
loadData();

// Background refresh every 5 minutes
setInterval(loadData, CACHE_TTL);

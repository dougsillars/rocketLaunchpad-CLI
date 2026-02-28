import { STATUS_CLASSES } from './constants.js';

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(str, max) {
  if (!str || str.length <= max) return str || '';
  return str.slice(0, max).trimEnd() + '...';
}

function formatLocalDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

export function renderStatusBadge(status) {
  const abbrev = status?.abbrev || status?.name || 'TBD';
  const cls = STATUS_CLASSES[abbrev] || STATUS_CLASSES[status?.name] || 'status-tbd';
  return `<span class="status-badge ${cls}">${escapeHtml(abbrev)}</span>`;
}

export function renderLaunchCard(launch) {
  const name = escapeHtml(launch.name || 'Unknown Mission');
  const provider = escapeHtml(launch.launch_service_provider?.name || 'Unknown');
  const rocketName = escapeHtml(launch.rocket?.configuration?.name || '');
  const padName = escapeHtml(launch.pad?.name || '');
  const location = escapeHtml(launch.pad?.location?.name || '');
  const description = escapeHtml(truncate(launch.mission?.description, 150));
  const netDate = formatLocalDate(launch.net);
  const statusBadge = renderStatusBadge(launch.status);
  const statusAbbrev = launch.status?.abbrev || '';

  const isTBD = statusAbbrev === 'TBD';
  const countdownAttr = launch.net ? `data-launch-net="${escapeHtml(launch.net)}" data-status="${escapeHtml(statusAbbrev)}"` : '';

  const imageHtml = launch.image
    ? `<img class="card-image" src="${escapeHtml(launch.image)}" alt="${name}" loading="lazy" onerror="this.outerHTML='<div class=\\'card-image-placeholder\\'>&#127756;</div>'">`
    : `<div class="card-image-placeholder">&#127756;</div>`;

  return `
    <article class="launch-card">
      ${imageHtml}
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title">${name}</h3>
          ${statusBadge}
        </div>
        <div class="card-countdown" ${countdownAttr}>
          ${isTBD ? `NET ${netDate || 'TBD'}` : '--d --h --m --s'}
        </div>
        <div class="card-net">${netDate}</div>
        <div class="card-meta">
          ${rocketName ? `<div class="card-meta-row"><span class="card-meta-icon">&#128640;</span> ${rocketName}</div>` : ''}
          <div class="card-meta-row"><span class="card-meta-icon">&#127970;</span> ${provider}</div>
          ${location ? `<div class="card-meta-row"><span class="card-meta-icon">&#128205;</span> ${location}</div>` : ''}
        </div>
        ${description ? `<p class="card-description">${description}</p>` : ''}
      </div>
    </article>
  `;
}

export function renderLoadingSkeleton(count = 6) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-line long"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `;
  }
  return html;
}

export function renderErrorBanner(message, onRetry) {
  const banner = document.createElement('div');
  banner.className = 'banner banner-error';
  banner.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="banner-btn" id="retry-btn">Retry</button>
  `;
  if (onRetry) {
    banner.querySelector('#retry-btn').addEventListener('click', onRetry);
  }
  return banner;
}

export function renderStalenessWarning(timestamp) {
  const ago = getTimeAgo(timestamp);
  const banner = document.createElement('div');
  banner.className = 'banner banner-warning';
  banner.innerHTML = `<span>Showing cached data from ${ago}. Live data temporarily unavailable.</span>`;
  return banner;
}

export function renderFullError(message, onRetry) {
  const container = document.createElement('div');
  container.className = 'full-error';
  container.innerHTML = `
    <div class="full-error-icon">&#128752;</div>
    <h2 class="full-error-title">Unable to Load Launches</h2>
    <p class="full-error-message">${escapeHtml(message)}</p>
    <button class="retry-btn" id="full-retry-btn">Try Again</button>
  `;
  if (onRetry) {
    container.querySelector('#full-retry-btn').addEventListener('click', onRetry);
  }
  return container;
}

export function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">&#128269;</div>
      <h3 class="empty-state-title">No launches match your filters</h3>
      <p class="empty-state-message">Try adjusting or clearing your filters to see more launches.</p>
    </div>
  `;
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return '1 hour ago';
  return `${hrs} hours ago`;
}

export function renderLastUpdated(timestamp) {
  return `Last updated ${getTimeAgo(timestamp)}`;
}

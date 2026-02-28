import { KNOWN_LOCATIONS, KNOWN_PROVIDERS } from './constants.js';

export function createFilterState() {
  return { locations: new Set(), providers: new Set() };
}

export function applyFilters(launches, filterState) {
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

function getUniqueLocations(launches) {
  const locations = new Set();
  for (const launch of launches) {
    const loc = launch.pad?.location?.name;
    if (loc) {
      // Check if this location matches any known location
      const known = KNOWN_LOCATIONS.find(k => loc.includes(k));
      if (known) {
        locations.add(known);
      } else {
        // Extract a short name — take first part before comma
        const short = loc.split(',')[0].trim();
        locations.add(short);
      }
    }
  }
  // Put known locations first (in order), then others sorted
  const knownPresent = KNOWN_LOCATIONS.filter(k => locations.has(k));
  const others = [...locations].filter(l => !KNOWN_LOCATIONS.includes(l)).sort();
  return [...knownPresent, ...others];
}

function getUniqueProviders(launches) {
  const providers = new Set();
  for (const launch of launches) {
    const name = launch.launch_service_provider?.name;
    if (name) providers.add(name);
  }
  // Put known providers first (in order), then others sorted
  const knownPresent = KNOWN_PROVIDERS.filter(p => providers.has(p));
  const others = [...providers].filter(p => !KNOWN_PROVIDERS.includes(p)).sort();
  return [...knownPresent, ...others];
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderFilters(containerEl, filterState, launches, onChange) {
  const locations = getUniqueLocations(launches);
  const providers = getUniqueProviders(launches);

  function renderChipGroup(label, items, activeSet, category) {
    const chips = items.map(item => {
      const pressed = activeSet.has(item);
      return `<button class="filter-chip" aria-pressed="${pressed}" data-category="${category}" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`;
    }).join('');
    return `
      <div class="filter-group">
        <span class="filter-group-label">${label}</span>
        <div class="filter-chips">${chips}</div>
      </div>
    `;
  }

  function renderActiveChips() {
    const chips = [];
    for (const loc of filterState.locations) {
      chips.push(`<button class="active-chip" data-category="locations" data-value="${escapeHtml(loc)}"><span>${escapeHtml(loc)}</span><span class="dismiss">&times;</span></button>`);
    }
    for (const prov of filterState.providers) {
      chips.push(`<button class="active-chip" data-category="providers" data-value="${escapeHtml(prov)}"><span>${escapeHtml(prov)}</span><span class="dismiss">&times;</span></button>`);
    }
    if (chips.length > 0) {
      chips.push(`<button class="clear-all-btn" id="clear-all-filters">Clear All</button>`);
    }
    return chips.join('');
  }

  containerEl.innerHTML = `
    <div class="filter-groups">
      ${renderChipGroup('Launch Location', locations, filterState.locations, 'locations')}
      ${renderChipGroup('Launch Provider', providers, filterState.providers, 'providers')}
    </div>
    <div class="active-filters">${renderActiveChips()}</div>
  `;

  // Chip toggle handlers
  containerEl.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const value = btn.dataset.value;
      const set = filterState[category];
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      renderFilters(containerEl, filterState, launches, onChange);
      onChange();
    });
  });

  // Active chip dismiss handlers
  containerEl.querySelectorAll('.active-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const value = btn.dataset.value;
      filterState[category].delete(value);
      renderFilters(containerEl, filterState, launches, onChange);
      onChange();
    });
  });

  // Clear all handler
  const clearBtn = containerEl.querySelector('#clear-all-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      filterState.locations.clear();
      filterState.providers.clear();
      renderFilters(containerEl, filterState, launches, onChange);
      onChange();
    });
  }
}

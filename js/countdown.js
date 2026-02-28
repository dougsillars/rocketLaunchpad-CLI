let intervalId = null;

export function formatCountdown(diffMs) {
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

export function startCountdowns(getNextLaunch, headerCountdownEl) {
  stopCountdowns();

  intervalId = setInterval(() => {
    const now = Date.now();

    // Update all card countdowns
    document.querySelectorAll('[data-launch-net]').forEach(el => {
      const status = el.dataset.status;
      if (status === 'TBD') return;
      const net = new Date(el.dataset.launchNet).getTime();
      el.textContent = formatCountdown(net - now);
    });

    // Update header "Next Launch" countdown
    const next = getNextLaunch();
    if (next && headerCountdownEl) {
      const net = new Date(next.net).getTime();
      headerCountdownEl.textContent = formatCountdown(net - now);
    }
  }, 1000);
}

export function stopCountdowns() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

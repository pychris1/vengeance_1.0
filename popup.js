/**
 * Vengeance — Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentTab();
  await loadStats();
  await loadSettings();
  bindToggleEvents();
  bindNavEvents();
  loadUpdateStatus();
});

// ─── Current Tab Info ──────────────────────────────────────────────────────────
async function loadCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  try {
    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, '');

    document.getElementById('site-domain').textContent = domain;
    document.getElementById('site-favicon').src =
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    // Get domain risk
    chrome.runtime.sendMessage({ type: 'GET_DOMAIN_RISK', domain }, (risk) => {
      updateRiskPill(risk);
    });
  } catch {
    document.getElementById('site-domain').textContent = 'Unknown';
  }
}

function updateRiskPill(risk) {
  const pill = document.getElementById('risk-pill');
  if (!risk) return;

  const labels = {
    green:   '✓ Safe',
    yellow:  '⚠ AI Partner',
    red:     '✗ AI Scraper',
    unknown: '? Unknown',
  };

  pill.className = `risk-pill ${risk.level || 'unknown'}`;
  pill.textContent = labels[risk.level] || '? Unknown';
  pill.title = risk.reason || '';
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats = {}) => {
    document.getElementById('stat-blocked').textContent  = formatNum(stats.blocked  || 0);
    document.getElementById('stat-trackers').textContent = formatNum(stats.trackers || 0);
    document.getElementById('stat-ai').textContent       = formatNum(stats.aiSites  || 0);
  });
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

// ─── Settings / Toggles ────────────────────────────────────────────────────────
async function loadSettings() {
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings = {}) => {
    setToggle('toggle-blocking', settings.domainBlocking ?? true);
    setToggle('toggle-trackers', settings.trackerRemoval ?? true);
    setToggle('toggle-ua',       settings.uaRotation     ?? true);
    setToggle('toggle-badge',    settings.aiRiskBadge    ?? true);
  });
}

function setToggle(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = value;
}

function bindToggleEvents() {
  const map = {
    'toggle-blocking': 'domainBlocking',
    'toggle-trackers': 'trackerRemoval',
    'toggle-ua':       'uaRotation',
    'toggle-badge':    'aiRiskBadge',
  };

  Object.entries(map).forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener('change', (e) => {
      chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
      }, (settings) => {
        const updated = { ...settings, [key]: e.target.checked };
        chrome.runtime.sendMessage({ type: 'SET_SETTINGS', payload: updated });
      });
    });
  });
}

// ─── Navigation ────────────────────────────────────────────────────────────────
function bindNavEvents() {
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('btn-open-options')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// ─── Update Status ─────────────────────────────────────────────────────────────
async function loadUpdateStatus() {
  const { lastBlocklistUpdate } = await chrome.storage.local.get('lastBlocklistUpdate');
  const el = document.getElementById('update-text');

  if (!lastBlocklistUpdate) {
    el.textContent = 'Lists not yet loaded';
    return;
  }

  const mins = Math.floor((Date.now() - lastBlocklistUpdate) / 60000);
  if (mins < 1)   el.textContent = 'Lists updated just now';
  else if (mins < 60) el.textContent = `Updated ${mins}m ago`;
  else {
    const hrs = Math.floor(mins / 60);
    el.textContent = `Updated ${hrs}h ago`;
  }
}

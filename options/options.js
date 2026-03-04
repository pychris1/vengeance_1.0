/**
 * Vengeance — Options Page Script
 */

const toggleMap = {
  's-blocking': 'domainBlocking',
  's-trackers': 'trackerRemoval',
  's-ua':       'uaRotation',
  's-badge':    'aiRiskBadge',
};

document.addEventListener('DOMContentLoaded', async () => {
  const { settings = {} } = await chrome.storage.local.get('settings');

  Object.entries(toggleMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) {
      el.checked = settings[key] ?? true;
      el.addEventListener('change', () => saveSettings());
    }
  });
});

async function saveSettings() {
  const { settings = {} } = await chrome.storage.local.get('settings');
  const updated = { ...settings };

  Object.entries(toggleMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) updated[key] = el.checked;
  });

  await chrome.storage.local.set({ settings: updated });
  showToast();
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

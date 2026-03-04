/**
 * Vengeance — Settings
 * Default settings and storage helpers
 */

export const defaultSettings = {
  domainBlocking: true,
  trackerRemoval: true,
  uaRotation:     true,
  aiRiskBadge:    true,
};

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return settings || defaultSettings;
}

export async function updateSetting(key, value) {
  const current = await getSettings();
  const updated = { ...current, [key]: value };
  await chrome.storage.local.set({ settings: updated });
  return updated;
}

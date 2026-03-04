/**
 * Vengeance — Background Service Worker
 * Handles: blocklist fetching, UA rotation, settings management
 */

import { fetchAndCacheBlocklists } from './blocklist-manager.js';
import { initUARotation } from './ua-rotation.js';
import { getSettings, defaultSettings } from './settings.js';

// ─── Extension Install / Update ───────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    console.log('[Vengeance] First install — initialising defaults...');
    await chrome.storage.local.set({ settings: defaultSettings });
  }

  // Always fetch fresh blocklists on install or update
  await fetchAndCacheBlocklists();
  await initUARotation();
});

// ─── Browser Launch (startup) ─────────────────────────────────────────────────
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Vengeance] Browser launched — refreshing blocklists...');
  await fetchAndCacheBlocklists();
  await initUARotation();
});

// ─── Message Handler (from popup / content scripts) ───────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {

    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true; // keep channel open for async

    case 'SET_SETTINGS':
      chrome.storage.local.set({ settings: message.payload }).then(() => {
        sendResponse({ success: true });
      });
      return true;

    case 'GET_STATS':
      chrome.storage.local.get('stats').then(({ stats }) => {
        sendResponse(stats || { blocked: 0, trackers: 0, aiSites: 0 });
      });
      return true;

    case 'GET_DOMAIN_RISK':
      getDomainRisk(message.domain).then(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// ─── Domain Risk Lookup ────────────────────────────────────────────────────────
async function getDomainRisk(domain) {
  const { aiRiskDb } = await chrome.storage.local.get('aiRiskDb');
  if (!aiRiskDb) return { level: 'unknown', reason: 'Database not loaded' };

  const entry = aiRiskDb[domain] || aiRiskDb[getRootDomain(domain)];
  return entry || { level: 'green', reason: 'No known AI scraping activity' };
}

function getRootDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}

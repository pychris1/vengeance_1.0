/**
 * Vengeance — Blocklist Manager
 * Fetches JSON blocklists from Cloudflare R2 on browser launch
 * Falls back to cached lists if fetch fails
 */

// ─── R2 Bucket URLs ────────────────────────────────────────────────────────────
// TODO: Replace with your Cloudflare R2 public bucket URLs
const BLOCKLIST_URLS = {
  ads:        'https://YOUR_R2_BUCKET.r2.dev/lists/ads.json',
  trackers:   'https://YOUR_R2_BUCKET.r2.dev/lists/trackers.json',
  aiScrapers: 'https://YOUR_R2_BUCKET.r2.dev/lists/ai-scrapers.json',
  aiRiskDb:   'https://YOUR_R2_BUCKET.r2.dev/lists/ai-risk-db.json',
};

const FETCH_TIMEOUT_MS = 8000;

// ─── Main Fetch Function ───────────────────────────────────────────────────────
export async function fetchAndCacheBlocklists() {
  console.log('[Vengeance] Fetching blocklists from R2...');

  const results = await Promise.allSettled([
    fetchList('ads',        BLOCKLIST_URLS.ads),
    fetchList('trackers',   BLOCKLIST_URLS.trackers),
    fetchList('aiScrapers', BLOCKLIST_URLS.aiScrapers),
    fetchList('aiRiskDb',   BLOCKLIST_URLS.aiRiskDb),
  ]);

  const summary = results.map((r, i) => ({
    list: Object.keys(BLOCKLIST_URLS)[i],
    status: r.status,
  }));

  console.log('[Vengeance] Blocklist fetch summary:', summary);

  // Record last updated timestamp
  await chrome.storage.local.set({
    lastBlocklistUpdate: Date.now(),
  });
}

// ─── Individual List Fetcher ───────────────────────────────────────────────────
async function fetchList(key, url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    await chrome.storage.local.set({ [key]: data });

    console.log(`[Vengeance] ✓ Loaded ${key} (${Array.isArray(data) ? data.length : Object.keys(data).length} entries)`);
    return data;

  } catch (err) {
    console.warn(`[Vengeance] ✗ Failed to fetch ${key}: ${err.message} — using cache`);

    // Fall back to cached version
    const cached = await chrome.storage.local.get(key);
    return cached[key] || [];
  }
}

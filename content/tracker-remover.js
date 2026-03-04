/**
 * Vengeance — Tracker Remover (Content Script)
 * Scans the DOM for tracking pixels, hidden iframes, and beacons
 * Runs at document_idle after page load
 */

(async () => {
  const settings = await getSettings();
  if (!settings.trackerRemoval) return;

  removeTrackingPixels();
  removeHiddenIframes();
  observeDOMChanges();

  // ─── Tracking Pixel Removal ──────────────────────────────────────────────────
  function removeTrackingPixels() {
    const images = document.querySelectorAll('img');
    let removed = 0;

    images.forEach(img => {
      const w = parseInt(img.getAttribute('width') || img.naturalWidth || 1);
      const h = parseInt(img.getAttribute('height') || img.naturalHeight || 1);
      const src = img.src || '';

      const isPixel = (w <= 2 && h <= 2);
      const isTracker = TRACKER_PATTERNS.some(p => p.test(src));

      if (isPixel || isTracker) {
        img.remove();
        removed++;
      }
    });

    if (removed > 0) {
      console.debug(`[Vengeance] Removed ${removed} tracking pixel(s)`);
      incrementStat('trackers', removed);
    }
  }

  // ─── Hidden iFrame Removal ───────────────────────────────────────────────────
  function removeHiddenIframes() {
    const iframes = document.querySelectorAll('iframe');
    let removed = 0;

    iframes.forEach(iframe => {
      const src = iframe.src || '';
      const style = window.getComputedStyle(iframe);
      const isHidden = style.display === 'none' || style.visibility === 'hidden'
        || parseInt(iframe.width) === 0 || parseInt(iframe.height) === 0;
      const isTracker = TRACKER_PATTERNS.some(p => p.test(src));

      if (isHidden && isTracker) {
        iframe.remove();
        removed++;
      }
    });

    if (removed > 0) {
      console.debug(`[Vengeance] Removed ${removed} hidden tracking iframe(s)`);
      incrementStat('trackers', removed);
    }
  }

  // ─── Observe Future DOM Changes ──────────────────────────────────────────────
  function observeDOMChanges() {
    const observer = new MutationObserver(() => {
      removeTrackingPixels();
      removeHiddenIframes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ─── Known Tracker URL Patterns ──────────────────────────────────────────────
  const TRACKER_PATTERNS = [
    /doubleclick\.net/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    /facebook\.com\/tr/i,
    /connect\.facebook\.net/i,
    /analytics\.twitter\.com/i,
    /bat\.bing\.com/i,
    /scorecardresearch\.com/i,
    /quantserve\.com/i,
    /pixel\.wp\.com/i,
    /stats\.wp\.com/i,
    /beacon\.krxd\.net/i,
    /tracking\./i,
    /pixel\./i,
    /beacon\./i,
  ];

  // ─── Settings Helper ─────────────────────────────────────────────────────────
  async function getSettings() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, resolve);
    });
  }

  // ─── Stats Helper ────────────────────────────────────────────────────────────
  function incrementStat(key, amount = 1) {
    chrome.storage.local.get('stats', ({ stats = {} }) => {
      stats[key] = (stats[key] || 0) + amount;
      chrome.storage.local.set({ stats });
    });
  }
})();

/**
 * Vengeance — UA Rotation
 * Picks a random realistic User-Agent per browser session
 * Uses declarativeNetRequest to modify the User-Agent header
 */

// ─── UA Pool ───────────────────────────────────────────────────────────────────
const UA_POOL = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',

  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',

  // Firefox on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:121.0) Gecko/20100101 Firefox/121.0',

  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',

  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const UA_RULE_ID = 1000; // Unique rule ID for UA header modification

// ─── Init ──────────────────────────────────────────────────────────────────────
export async function initUARotation() {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings?.uaRotation) {
    console.log('[Vengeance] UA Rotation disabled — skipping');
    await removeUARule();
    return;
  }

  // Check if we already have a session UA set
  const { sessionUA } = await chrome.storage.session.get('sessionUA');

  if (sessionUA) {
    console.log('[Vengeance] Session UA already set:', sessionUA.substring(0, 40) + '...');
    return; // Keep same UA for this session
  }

  // Pick a new random UA for this session
  const ua = UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
  await chrome.storage.session.set({ sessionUA: ua });

  await applyUARule(ua);
  console.log('[Vengeance] ✓ Session UA set:', ua.substring(0, 40) + '...');
}

// ─── Apply UA via declarativeNetRequest ───────────────────────────────────────
async function applyUARule(ua) {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [UA_RULE_ID],
    addRules: [
      {
        id: UA_RULE_ID,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'User-Agent',
              operation: 'set',
              value: ua,
            },
          ],
        },
        condition: {
          urlFilter: '*',
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script'],
        },
      },
    ],
  });
}

async function removeUARule() {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [UA_RULE_ID],
  });
}

/**
 * Vengeance — AI Risk Badge Injector (Content Script)
 * Injects a small risk badge into the page based on domain risk level
 */

(async () => {
  const settings = await getSettings();
  if (!settings.aiRiskBadge) return;

  const domain = window.location.hostname;

  chrome.runtime.sendMessage(
    { type: 'GET_DOMAIN_RISK', domain },
    (risk) => {
      if (!risk || risk.level === 'green') return; // Only show badge for yellow/red
      injectBadge(risk);
    }
  );

  // ─── Badge Injection ─────────────────────────────────────────────────────────
  function injectBadge({ level, reason }) {
    if (document.getElementById('vengeance-badge')) return;

    const colors = {
      yellow: { bg: '#FFF3CD', border: '#E6A817', text: '#7D5A00', dot: '#E6A817' },
      red:    { bg: '#FFE5E5', border: '#CC3333', text: '#7A0000', dot: '#CC3333' },
      unknown:{ bg: '#F0F0F0', border: '#999999', text: '#444444', dot: '#999999' },
    };

    const labels = {
      yellow: 'AI Partner Site',
      red:    'AI Scraper Detected',
      unknown:'Unknown Risk',
    };

    const c = colors[level] || colors.unknown;
    const label = labels[level] || 'Unknown';

    const badge = document.createElement('div');
    badge.id = 'vengeance-badge';
    badge.title = reason || '';
    badge.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px 6px 8px;
      background: ${c.bg};
      border: 1px solid ${c.border};
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: ${c.text};
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      transition: opacity 0.2s ease;
      user-select: none;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 7px; height: 7px;
      border-radius: 50%;
      background: ${c.dot};
      flex-shrink: 0;
    `;

    const text = document.createElement('span');
    text.textContent = `Vengeance · ${label}`;

    const close = document.createElement('span');
    close.textContent = '×';
    close.style.cssText = `
      margin-left: 4px;
      font-size: 14px;
      opacity: 0.5;
      line-height: 1;
    `;
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      badge.remove();
    });

    badge.appendChild(dot);
    badge.appendChild(text);
    badge.appendChild(close);
    document.body.appendChild(badge);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      badge.style.opacity = '0';
      setTimeout(() => badge.remove(), 300);
    }, 6000);
  }

  // ─── Settings Helper ─────────────────────────────────────────────────────────
  async function getSettings() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, resolve);
    });
  }
})();

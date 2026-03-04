# 🛡️ Vengeance

> Ad blocking, tracker removal, and AI data poisoning protection for the general public.

---

## Project Status
`Phase 1 Complete` — Scaffold, popup UI, service worker, content scripts

---

## Features
| Feature | Status |
|---|---|
| Domain Blocking | 🔲 Phase 2 |
| Tracker Removal | ✅ Scaffold ready |
| UA Rotation | ✅ Scaffold ready |
| AI Risk Badge | ✅ Scaffold ready |

---

## File Structure
```
vengeance/
├── manifest.json
├── background/
│   ├── service-worker.js       ← Main background engine
│   ├── blocklist-manager.js    ← Fetches from Cloudflare R2
│   ├── ua-rotation.js          ← Per-session UA rotation
│   ├── settings.js             ← Settings helpers
│   └── rules/
│       ├── ads.json            ← Populated in Phase 2
│       ├── trackers.json       ← Populated in Phase 2
│       └── ai-scrapers.json    ← Populated in Phase 2
├── content/
│   ├── tracker-remover.js      ← DOM-level tracker removal
│   └── badge-injector.js       ← AI Risk Badge UI
├── popup/
│   ├── popup.html              ← Extension popup UI
│   └── popup.js
├── options/
│   ├── options.html            ← Full settings page
│   └── options.js
└── assets/
    └── icons/                  ← Add icon16.png, icon48.png, icon128.png
```

---

## Setup

### Load in Chrome (Developer Mode)
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `vengeance/` folder

### Configure Cloudflare R2
1. Create a free [Cloudflare](https://cloudflare.com) account
2. Create an R2 bucket
3. Upload your blocklist JSONs (`ads.json`, `trackers.json`, `ai-scrapers.json`, `ai-risk-db.json`)
4. Enable public access on the bucket
5. Replace `YOUR_R2_BUCKET` URLs in `background/blocklist-manager.js`

### Configure Supabase (Phase 5)
1. Create a free [Supabase](https://supabase.com) project
2. Create a `domains` table: `domain`, `risk_level`, `reason`, `last_updated`
3. Add your Supabase URL + anon key to the badge injector

---

## Tech Stack
- Vanilla JavaScript (no framework, no build step)
- Chrome Manifest V3
- `declarativeNetRequest` for blocking
- `chrome.storage.local` + `chrome.storage.session`
- Cloudflare R2 (blocklist hosting)
- Supabase (AI Risk DB — Phase 5)

---

## Roadmap
- [ ] Phase 2 — Blocking engine + populated blocklists
- [ ] Phase 3 — Tracker removal (content script complete)
- [ ] Phase 4 — UA rotation (complete)
- [ ] Phase 5 — AI Risk Badge + Supabase integration
- [ ] Phase 6 — Polish, onboarding, Chrome Web Store
- [ ] Phase 7 — Pro version foundation

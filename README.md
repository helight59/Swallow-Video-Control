# Swallow Video Control

Chrome extension (Manifest V3) that rewinds/fast-forwards HTML5 video by **±10 seconds** using:

- **WebHID Consumer Control buttons**
    - `0x00B4` (Rewind) → `-10s`
    - `0x00B3` (Fast Forward / MFFD) → `+10s`
- **Optional keyboard hotkeys** (fully customizable)

✅ Works **without an open popup** (WebHID listener runs in an offscreen document).  
✅ Single-target tab selection (no “spraying” across multiple tabs).  
✅ Hold-to-repeat: first step immediately, then repeat with a fixed delay/interval.  
✅ Does **NOT** intercept Play/Pause/Next/Prev and does not use Media Session.

---

## Target tab selection (single-target)

On first press (Rewind/Fast Forward, HID or hotkey):

1. If the active tab has a **playing** `<video>` → target = active tab
2. Else if `lastActivePlayingTab` exists and is **playing** → target = that tab
3. Else if nothing is playing but the active tab has a `<video>` (paused) → target = active tab
4. Otherwise: ignore the event

While holding the button, the target **does not change**, even if you switch tabs.

**Playing video** is detected as:
- `<video>` exists
- `!paused`
- `!ended`
- `readyState >= 3`

---

## Build (TypeScript → JavaScript)

### Requirements
- Node.js 18+ (recommended)
- npm

### Install
```bash
npm i
```

### Build
```bash
npm run build
```

Output is created in the `dist/` folder.

---

## Install in Chrome (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## Setup (HID + Hotkeys)

Open the extension popup and click:
- **Connect HID** (opens Settings), or
- **or set any hotkeys** (also opens Settings)

### Connect a HID device (WebHID)
1. Open **Settings**
2. Click **Connect HID**
3. Choose your keyboard/remote (the device where Rewind/Fast Forward buttons are configured)
4. Done: the extension keeps listening in the background  
   (You can disconnect anytime with **Disconnect**)

### Set keyboard hotkeys
In **Settings → Keyboard hotkeys**:
- Click **Set** for **Rewind** and/or **Forward**
- Press a key combo:
    - Modifiers supported: **Ctrl**, **Shift**, **Alt**, **Meta** (Win/Cmd)
    - **Menu** key is supported (shown as `Menu`, also known as the Context Menu key)
- Click **Clear** to remove a hotkey

Notes:
- Hotkeys won’t trigger while typing in inputs/textareas/selects or contenteditable fields.

---

## Testing

### Quick test without real HID (simulate events)
Open the extension's Service Worker console:

`chrome://extensions` → extension → **Service worker** → Inspect

Run:
```js
chrome.runtime.sendMessage({ type: 'HID_USAGE', usageId: 0x00B4 });
setTimeout(() => chrome.runtime.sendMessage({ type: 'HID_USAGE', usageId: 0x0000 }), 600);
```

---

## Privacy

- No data is sent anywhere.
- No browsing history, URLs, or page content is collected.
- The extension keeps only minimal in-memory state (e.g. last playing tab id).

---

## Permissions rationale

- `tabs` — determine the active tab and send messages to the correct tab.
- `host_permissions: <all_urls>` — run a content script to detect/control `<video>` elements on pages.
- `offscreen` — keep a persistent WebHID listener outside the popup (MV3 service workers may be suspended).
- `storage` — store your hotkey settings.

---

## Troubleshooting

- Content scripts do not run on `chrome://...` pages or the Chrome Web Store.
- If hold-to-repeat doesn't work, check Service Worker errors and ensure the device sends press/hold/release reports.
- Some HID devices use different report layouts; if usageId looks wrong, the report parser may need adjustment.

---

## License
MIT

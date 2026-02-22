# Privacy Policy — Swallow Video Control

**Effective date:** 2026-02-22

Swallow Video Control (“the Extension”) is a Chrome extension that enables ±10-second seeking in HTML5 video players using WebHID Consumer Control buttons (Rewind/Fast Forward) and optional user-configured keyboard hotkeys.

This Privacy Policy explains what data the Extension collects now and what it may collect in the future, and how that data is used.

---

## 1) Summary (plain language)

- **Right now:** the Extension **does not collect or transmit** browsing history, location, or any other personal data to the developer or third parties.
- The Extension runs locally to detect an HTML5 `<video>` element and adjust its `currentTime` when you press Rewind/Fast Forward on a HID device you connect, or when you use your configured keyboard hotkeys.
- The Extension stores your **hotkey settings** locally using Chrome extension storage (and may sync them via your Chrome Sync settings).
- **In the future (optional):** we may add **opt‑in** anonymous usage analytics to improve compatibility and prioritise translations. If introduced, it will be clearly disclosed, disabled by default, and limited to the minimum necessary data.

---

## 2) Data we collect **currently**

### 2.1 Data we do **not** collect
The Extension currently does **not** collect, store, or transmit:
- browsing history (visited URLs, search queries, page titles, timestamps);
- location data (GPS, precise location, IP address used for geolocation);
- identifiers (name, email address, account IDs);
- authentication, financial, health, or communication data;
- page content (text, images, form data).

The Extension also does not use third‑party analytics SDKs.

### 2.2 Hotkey settings (stored locally)
If you configure keyboard hotkeys in the Extension settings, the Extension stores only:
- the selected key code (e.g., `KeyK`, `ArrowLeft`, `ContextMenu`), and
- modifier flags (Ctrl/Shift/Alt/Meta).

This data is used only to detect your chosen shortcuts and trigger ±10-second seeking.

Storage details:
- Hotkeys are stored using Chrome extension storage (e.g., `chrome.storage`).
- If you have Chrome Sync enabled, Chrome may sync these settings across your devices as part of your Google account sync. The Extension itself does not send this data to any developer-controlled server.

---

## 3) Data we may collect **in the future (opt‑in only)**

If we introduce optional telemetry/analytics, it will be **disabled by default** and enabled only if you explicitly opt in. Any such change will be reflected in an updated Privacy Policy and clear in‑product disclosure.

If introduced, the Extension may collect the following categories:

### 3.1 Location (coarse / non-precise)
Purpose: understand regional demand to prioritise translations and compatibility.

Potential data:
- **coarse region** such as **country** (and optionally language/locale).
- We will **not** collect GPS coordinates.
- We will **not** collect precise location.

How it may be derived:
- From non-precise signals such as browser locale and/or coarse geolocation methods.
- If IP-based geolocation is ever used, we would store only the resulting **country-level** information, not the IP address itself.

### 3.2 Browsing history (limited, minimised)
Purpose: understand which sites have video playback issues and prioritise fixes.

Potential data (minimised):
- **site domain only** (e.g., `youtube.com`), without full URLs, paths, query parameters, or page titles.
- Optional coarse counters such as “seek used” events per domain.

We will **not** collect:
- full URLs (including paths or query strings),
- search queries,
- page content,
- keystrokes, form inputs, or mouse movements.

---

## 4) How the Extension works (local processing)

To perform seeking, the Extension:
- listens for HID button events from a device you explicitly connect via WebHID;
- listens for your configured keyboard hotkeys (if enabled);
- checks for HTML5 `<video>` elements on the target tab to determine playback status;
- updates `video.currentTime` by ±10 seconds.

This processing happens **locally on your device**.

---

## 5) Storage and retention

- **Current version:** minimal runtime state is kept **in memory** (e.g., the last active playing tab id). It is cleared when the extension is reloaded or Chrome is closed.
- **Hotkey settings:** stored until you change them or remove the extension. If Chrome Sync is enabled, synced copies follow your Chrome Sync settings.
- **If future telemetry is enabled:** collected analytics would be retained only as long as necessary to improve the Extension, then deleted or aggregated. We would document the exact retention period in an updated policy.

---

## 6) Data sharing

- **Current version:** the Extension does not share user data with the developer or third parties. The only stored data is hotkey configuration saved in Chrome extension storage.
- **If future telemetry is enabled:** we will not sell personal data. Any sharing (for example, hosting providers used to receive telemetry) would be limited to what is necessary to operate the service and would be described in an updated policy.

---

## 7) Security

We aim to minimise data access and follow reasonable security practices:
- data minimisation (collect the least possible),
- no collection of browsing history or location in the current version,
- opt‑in and clear disclosure for any future telemetry features.

---

## 8) Your choices and controls

- You can install/uninstall the Extension at any time via Chrome settings.
- You can set, change, or clear hotkeys in the Extension settings page.
- If optional telemetry is introduced in the future, you will be able to keep it **disabled** or turn it **off** at any time.

---

## 9) Changes to this policy

If we change what data the Extension collects or how it is used, we will:
- update this Privacy Policy,
- provide clear disclosure (and require opt‑in where applicable).

---

## 10) Contact

If you have questions about this Privacy Policy, contact: **helight59@gmail.com**

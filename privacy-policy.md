# Privacy Policy — Swallow Video Control

**Effective date:** 2026-02-22

Swallow Video Control (“the Extension”) is a Chrome extension that enables ±10-second seeking in HTML5 video players using WebHID Consumer Control buttons (Rewind/Fast Forward).

This Privacy Policy explains what data the Extension collects now and what it may collect in the future, and how that data is used.

---

## 1) Summary (plain language)

- **Right now:** the Extension **does not collect or transmit** browsing history, location, or any other personal data.
- The Extension runs locally to detect an HTML5 `<video>` element and adjust its `currentTime` when you press Rewind/Fast Forward on a HID device you connect.
- **In the future (optional):** we may add **opt‑in** anonymous usage analytics to improve compatibility and prioritise translations. If introduced, it will be clearly disclosed, disabled by default, and limited to the minimum necessary data.

---

## 2) Data we collect **currently**

**None.**

The Extension currently does **not** collect, store, or transmit:
- browsing history (visited URLs, search queries, page titles, timestamps);
- location data (GPS, precise location, IP address used for geolocation);
- identifiers (name, email address, account IDs);
- authentication, financial, health, or communication data;
- page content (text, images, form data).

The Extension also does not use third‑party analytics SDKs.

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
- checks for HTML5 `<video>` elements on the target tab to determine playback status;
- updates `video.currentTime` by ±10 seconds.

This processing happens **locally on your device**.

---

## 5) Storage and retention

- **Current version:** only minimal runtime state is kept **in memory** (e.g., the last active playing tab id). It is cleared when the extension is reloaded or Chrome is closed.
- **If future telemetry is enabled:** collected analytics would be retained only as long as necessary to improve the Extension, then deleted or aggregated. We would document the exact retention period in an updated policy.

---

## 6) Data sharing

- **Current version:** no data is shared because no user data is collected.
- **If future telemetry is enabled:** we will not sell personal data. Any sharing (for example, hosting providers used to receive telemetry) would be limited to what is necessary to operate the service and would be described in an updated policy.

---

## 7) Security

We aim to minimise data access and follow reasonable security practices:
- data minimisation (collect the least possible),
- no collection in the current version,
- opt‑in and clear disclosure for any future telemetry features.

---

## 8) Your choices and controls

- You can install/uninstall the Extension at any time via Chrome settings.
- If optional telemetry is introduced in the future, you will be able to keep it **disabled** or turn it **off** at any time.

---

## 9) Changes to this policy

If we change what data the Extension collects or how it is used, we will:
- update this Privacy Policy,
- provide clear disclosure (and require opt‑in where applicable).

---

## 10) Contact

If you have questions about this Privacy Policy, contact: **helight59@gmail.com**

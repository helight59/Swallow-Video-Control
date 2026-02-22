(() => {
  const SETTINGS_KEY = 'settings';

  const hidStatusEl = document.getElementById('hidStatus');
  const btnConnect = document.getElementById('connect');
  const btnDisconnect = document.getElementById('disconnect');

  const rewindVal = document.getElementById('rewindVal');
  const forwardVal = document.getElementById('forwardVal');

  const btnSetRewind = document.getElementById('setRewind');
  const btnClearRewind = document.getElementById('clearRewind');
  const btnSetForward = document.getElementById('setForward');
  const btnClearForward = document.getElementById('clearForward');

  const captureEl = document.getElementById('capture');

  if (!(hidStatusEl instanceof HTMLDivElement)
    || !(btnConnect instanceof HTMLButtonElement)
    || !(btnDisconnect instanceof HTMLButtonElement)
    || !(rewindVal instanceof HTMLDivElement)
    || !(forwardVal instanceof HTMLDivElement)
    || !(btnSetRewind instanceof HTMLButtonElement)
    || !(btnClearRewind instanceof HTMLButtonElement)
    || !(btnSetForward instanceof HTMLButtonElement)
    || !(btnClearForward instanceof HTMLButtonElement)
    || !(captureEl instanceof HTMLDivElement)
  ) {
    throw new Error('settings.html DOM missing expected elements');
  }

  const formatCode = (code: string): string => {
    if (code === 'ContextMenu') {
      return 'Menu';
    }
    if (code.startsWith('Key') && code.length === 4) {
      return code.slice(3);
    }
    if (code.startsWith('Digit') && code.length === 6) {
      return code.slice(5);
    }
    return code;
  };

  const shortcutToText = (s: Swallow.Shortcut | null): string => {
    if (!s) {
      return '-';
    }
    const parts: string[] = [];
    if (s.ctrl) parts.push('Ctrl');
    if (s.shift) parts.push('Shift');
    if (s.alt) parts.push('Alt');
    if (s.meta) parts.push('Meta');
    parts.push(formatCode(s.code));
    return parts.join(' + ');
  };

  const isModifierOnly = (code: string): boolean => {
    return code.startsWith('Shift')
      || code.startsWith('Control')
      || code.startsWith('Alt')
      || code.startsWith('Meta');
  };

  const defaultSettings = (): Swallow.Settings => ({ rewind: null, forward: null });

  const loadSettings = async (): Promise<Swallow.Settings> => {
    const r = await chrome.storage.sync.get(SETTINGS_KEY);
    const s = r[SETTINGS_KEY] as Swallow.Settings | undefined;
    if (!s || typeof s !== 'object') {
      return defaultSettings();
    }
    return { rewind: s.rewind ?? null, forward: s.forward ?? null };
  };

  const saveSettings = async (s: Swallow.Settings): Promise<void> => {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: s });
  };

  const refreshHid = async (): Promise<void> => {
    const r = await chrome.runtime.sendMessage<Swallow.MsgPopupGetState, { ok: boolean; state?: { hidStatus: Swallow.HidStatus } }>({ type: 'POPUP_GET_STATE' });
    if (r?.ok && r.state) {
      const hs = r.state.hidStatus;
      hidStatusEl.textContent = `HID: ${hs.connected ? 'Connected' : 'Not connected'}${hs.productName ? ` (${hs.productName})` : ''}`;
      return;
    }
    hidStatusEl.textContent = 'HID: connected';
  };

  const renderSettings = async (): Promise<void> => {
    const s = await loadSettings();
    rewindVal.textContent = shortcutToText(s.rewind);
    forwardVal.textContent = shortcutToText(s.forward);
  };

  let captureMode: Swallow.HeldAction | null = null;

  const startCapture = (mode: Swallow.HeldAction): void => {
    captureMode = mode;
    captureEl.textContent = `Press a key combination for ${mode === 'rewind' ? 'Rewind' : 'Forward'}...`;
    captureEl.style.fontWeight = '600';
  };

  const stopCapture = (): void => {
    captureMode = null;
    captureEl.textContent = '';
    captureEl.style.fontWeight = '';
  };

  const buildShortcut = (e: KeyboardEvent): Swallow.Shortcut | null => {
    if (isModifierOnly(e.code)) return null;
    return { code: e.code, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey };
  };

  const onCaptureKeyDown = async (e: KeyboardEvent): Promise<void> => {
    if (!captureMode) return;

    e.preventDefault();
    e.stopPropagation();

    const sc = buildShortcut(e);
    if (!sc) {
      captureEl.textContent = 'Modifiers only are not allowed. Press another key.';
      return;
    }

    const s = await loadSettings();
    if (captureMode === 'rewind') s.rewind = sc;
    else s.forward = sc;

    await saveSettings(s);
    await renderSettings();
    stopCapture();
  };

  btnSetRewind.addEventListener('click', () => { startCapture('rewind'); });
  btnSetForward.addEventListener('click', () => { startCapture('forward'); });

  btnClearRewind.addEventListener('click', async () => {
    const s = await loadSettings();
    s.rewind = null;
    await saveSettings(s);
    await renderSettings();
  });

  btnClearForward.addEventListener('click', async () => {
    const s = await loadSettings();
    s.forward = null;
    await saveSettings(s);
    await renderSettings();
  });

  btnConnect.addEventListener('click', async () => {
    try {
      const devices = await navigator.hid.requestDevice({ filters: [] });
      const d = devices[0];
      if (!d) return;

      const hint: Swallow.ConnectHint = {
        productName: d.productName ?? null,
        vendorId: d.vendorId ?? null,
        productId: d.productId ?? null,
      };

      await chrome.runtime.sendMessage<Swallow.MsgConnectGranted>({ type: 'CONNECT_GRANTED', hint });
    } catch {
    }
  });

  btnDisconnect.addEventListener('click', async () => {
    await chrome.runtime.sendMessage<Swallow.MsgPopupDisconnect>({ type: 'POPUP_DISCONNECT' });
  });

  chrome.runtime.onMessage.addListener((msg: Swallow.MsgHidStatusChanged) => {
    if (msg?.type === 'HID_STATUS_CHANGED') {
      void refreshHid();
    }
  });

  window.addEventListener('keydown', (e) => { void onCaptureKeyDown(e); }, true);

  void refreshHid();
  void renderSettings();
})();
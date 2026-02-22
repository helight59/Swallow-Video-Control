(() => {
  type PopupState = {
    lastActivePlayingTabId: number | null;
    heldAction: Swallow.HeldAction | null;
    heldTargetTabId: number | null;
    repeatFailCount: number;
    hidStatus: Swallow.HidStatus;
  };

  const el = document.getElementById('state');
  const btnConnect = document.getElementById('connect');
  const btnHotkeys = document.getElementById('hotkeys');
  const btnDisconnect = document.getElementById('disconnect');

  if (!(el instanceof HTMLDivElement)
    || !(btnConnect instanceof HTMLButtonElement)
    || !(btnHotkeys instanceof HTMLButtonElement)
    || !(btnDisconnect instanceof HTMLButtonElement)
  ) {
    throw new Error('popup.html DOM missing expected elements');
  }

  const fmtUsage = (n: number | null): string => {
    if (n == null) {
      return '-';
    }
    return `0x${n.toString(16).padStart(4, '0')}`;
  };

  const render = (state: PopupState): void => {
    const s = state.hidStatus;
    el.textContent =
      `Status:
  Connected: ${String(Boolean(s.connected))}
  Listening: ${String(Boolean(s.listening))}
  Device: ${s.productName ?? '-'}
  Last usage: ${fmtUsage(s.lastUsageId)}

Targeting:
  lastActivePlayingTabId: ${state.lastActivePlayingTabId ?? '-'}
  heldAction: ${state.heldAction ?? '-'}
  heldTargetTabId: ${state.heldTargetTabId ?? '-'}
  repeatFailCount: ${state.repeatFailCount}
`;
  };

  const refresh = async (): Promise<void> => {
    const r = await chrome.runtime.sendMessage<Swallow.MsgPopupGetState, { ok: boolean; state?: PopupState }>({ type: 'POPUP_GET_STATE' });
    if (r?.ok && r.state) {
      render(r.state);
      return;
    }
    el.textContent = 'Failed to read state.';
  };

  const openSettings = async (): Promise<void> => {
    await chrome.runtime.openOptionsPage();
    window.close();
  };

  btnConnect.addEventListener('click', () => { void openSettings(); });
  btnHotkeys.addEventListener('click', () => { void openSettings(); });

  btnDisconnect.addEventListener('click', async () => {
    await chrome.runtime.sendMessage<Swallow.MsgPopupDisconnect>({ type: 'POPUP_DISCONNECT' });
  });

  chrome.runtime.onMessage.addListener((msg: Swallow.MsgHidStatusChanged) => {
    if (msg?.type === 'HID_STATUS_CHANGED') {
      void refresh();
    }
  });

  void refresh();
})();
const SEEK_STEP_SECONDS = 10;

const REPEAT_INITIAL_DELAY_MS = 250;
const REPEAT_INTERVAL_MS = 100;

const FAIL_STOP_THRESHOLD = 2;

const OFFSCREEN_URL = 'offscreen.html';

type PopupGetStateResponse = {
  ok: true;
  state: {
    lastActivePlayingTabId: number | null;
    heldAction: Swallow.HeldAction | null;
    heldTargetTabId: number | null;
    repeatFailCount: number;
    hidStatus: Swallow.HidStatus;
  };
};

type BgIncoming =
  | Swallow.MsgConnectGranted
  | Swallow.MsgOffscreenStatus
  | Swallow.MsgHidUsage
  | Swallow.MsgKbPress
  | Swallow.MsgKbRelease
  | Swallow.MsgPopupGetState
  | Swallow.MsgPopupDisconnect;

let lastActivePlayingTabId: number | null = null;

let heldAction: Swallow.HeldAction | null = null;
let heldTargetTabId: number | null = null;
let repeatFailCount = 0;

let repeatStartTimeoutId: number | null = null;
let repeatIntervalId: number | null = null;

let hidStatus: Swallow.HidStatus = {
  connected: false,
  productName: null,
  listening: false,
  lastUsageId: null,
};

const ensureOffscreen = async (): Promise<void> => {
  const api = chrome.offscreen as unknown as { hasDocument?: () => Promise<boolean>; createDocument: typeof chrome.offscreen.createDocument };
  if (api.hasDocument) {
    const has = await api.hasDocument();
    if (has) {
      return;
    }
  }

  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: ['DOM_SCRAPING'],
      justification: 'Need a persistent DOM context for WebHID inputreport listeners.',
    });
  } catch {
  }
};

const stopRepeat = (): void => {
  if (repeatStartTimeoutId != null) {
    clearTimeout(repeatStartTimeoutId);
    repeatStartTimeoutId = null;
  }
  if (repeatIntervalId != null) {
    clearInterval(repeatIntervalId);
    repeatIntervalId = null;
  }
};

const resetHeldState = (): void => {
  stopRepeat();
  heldAction = null;
  heldTargetTabId = null;
  repeatFailCount = 0;
};

const queryStatus = (tabId: number): Promise<{ ok: boolean; data?: Swallow.QueryStatusResponse; error?: string }> => {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage<Swallow.ContentQueryStatus, Swallow.QueryStatusResponse>(
      tabId,
      { type: 'QUERY_STATUS' },
      (res) => {
        const err = chrome.runtime.lastError?.message;
        if (err) {
          resolve({ ok: false, error: err });
          return;
        }
        resolve({ ok: true, data: res });
      },
    );
  });
};

const sendSeek = (tabId: number, deltaSeconds: number): Promise<{ ok: boolean; data?: Swallow.SeekResponse; error?: string }> => {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage<Swallow.ContentSeek, Swallow.SeekResponse>(
      tabId,
      { type: 'SEEK', deltaSeconds },
      (res) => {
        const err = chrome.runtime.lastError?.message;
        if (err) {
          resolve({ ok: false, error: err });
          return;
        }
        resolve({ ok: true, data: res });
      },
    );
  });
};

const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] ?? null;
};

const pickTargetOnFirstPress = async (): Promise<number | null> => {
  const active = await getActiveTab();
  if (active?.id == null) {
    return null;
  }

  const activeStatus = await queryStatus(active.id);
  if (activeStatus.ok && activeStatus.data?.isPlaying === true) {
    return active.id;
  }

  if (lastActivePlayingTabId != null) {
    const st = await queryStatus(lastActivePlayingTabId);
    if (st.ok && st.data?.isPlaying === true) {
      return lastActivePlayingTabId;
    }
  }

  if (activeStatus.ok && activeStatus.data?.hasVideo === true) {
    return active.id;
  }

  return null;
};

const startRepeatLoop = async (): Promise<void> => {
  stopRepeat();

  repeatStartTimeoutId = setTimeout(() => {
    repeatStartTimeoutId = null;

    repeatIntervalId = setInterval(async () => {
      if (heldAction == null || heldTargetTabId == null) {
        resetHeldState();
        return;
      }

      const delta = heldAction === 'rewind' ? -SEEK_STEP_SECONDS : SEEK_STEP_SECONDS;
      const r = await sendSeek(heldTargetTabId, delta);

      if (!r.ok || r.data?.ok !== true) {
        repeatFailCount += 1;
        if (repeatFailCount >= FAIL_STOP_THRESHOLD) {
          resetHeldState();
        }
        return;
      }

      repeatFailCount = 0;
    }, REPEAT_INTERVAL_MS);
  }, REPEAT_INITIAL_DELAY_MS);
};

const doFirstStepAndHold = async (action: Swallow.HeldAction): Promise<void> => {
  if (heldTargetTabId == null) {
    return;
  }

  const delta = action === 'rewind' ? -SEEK_STEP_SECONDS : SEEK_STEP_SECONDS;

  const r = await sendSeek(heldTargetTabId, delta);
  if (!r.ok || r.data?.ok !== true) {
    repeatFailCount += 1;
    if (repeatFailCount >= FAIL_STOP_THRESHOLD) {
      resetHeldState();
    }
    return;
  }

  repeatFailCount = 0;
  await startRepeatLoop();
};

const handleActionPress = async (action: Swallow.HeldAction): Promise<void> => {
  if (heldAction != null && heldAction === action) {
    return;
  }

  if (heldAction != null && heldTargetTabId != null && heldAction !== action) {
    stopRepeat();
    heldAction = action;
    await doFirstStepAndHold(action);
    return;
  }

  const targetTabId = await pickTargetOnFirstPress();
  if (targetTabId == null) {
    return;
  }

  heldTargetTabId = targetTabId;
  heldAction = action;
  repeatFailCount = 0;

  await doFirstStepAndHold(action);
};

const handleHidPress = async (usageId: number): Promise<void> => {
  const action: Swallow.HeldAction = usageId === 0x00B4 ? 'rewind' : 'forward';
  await handleActionPress(action);
};

const handleRelease = (): void => {
  resetHeldState();
};

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const st = await queryStatus(tabId);
  if (st.ok && st.data?.isPlaying === true) {
    lastActivePlayingTabId = tabId;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (lastActivePlayingTabId === tabId) {
    lastActivePlayingTabId = null;
  }
  if (heldTargetTabId === tabId) {
    resetHeldState();
  }
});

chrome.runtime.onMessage.addListener((msg: BgIncoming, _sender, sendResponse) => {
  (async (): Promise<void> => {
    if (msg.type === 'CONNECT_GRANTED') {
      await ensureOffscreen();
      chrome.runtime.sendMessage<Swallow.MsgOffscreenStart>({ type: 'OFFSCREEN_START', hint: msg.hint ?? null });
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'OFFSCREEN_STATUS') {
      hidStatus = { ...hidStatus, ...msg.status };

      if (msg.status.connected === false) {
        resetHeldState();
      }

      chrome.runtime.sendMessage<Swallow.MsgHidStatusChanged>({
        type: 'HID_STATUS_CHANGED',
        hidStatus,
      });

      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'HID_USAGE') {
      const usageId = msg.usageId >>> 0;
      hidStatus.lastUsageId = usageId;

      if (usageId === 0x0000) {
        handleRelease();
        sendResponse({ ok: true });
        return;
      }

      if (usageId === 0x00B3 || usageId === 0x00B4) {
        await handleHidPress(usageId);
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'KB_PRESS') {
      await handleActionPress(msg.action);
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'KB_RELEASE') {
      handleRelease();
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === 'POPUP_GET_STATE') {
      const payload: PopupGetStateResponse = {
        ok: true,
        state: {
          lastActivePlayingTabId,
          heldAction,
          heldTargetTabId,
          repeatFailCount,
          hidStatus,
        },
      };
      sendResponse(payload);
      return;
    }

    if (msg.type === 'POPUP_DISCONNECT') {
      await ensureOffscreen();
      chrome.runtime.sendMessage<Swallow.MsgOffscreenStop>({ type: 'OFFSCREEN_STOP' });
      resetHeldState();
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: 'Unknown message' });
  })();

  return true;
});

ensureOffscreen();
(() => {
  type ContentIncoming = Swallow.ContentQueryStatus | Swallow.ContentSeek;

  const SETTINGS_KEY = 'settings';

  const hasFiniteDuration = (v: HTMLVideoElement): boolean => Number.isFinite(v.duration) && v.duration > 0;

  const isPlayingVideo = (v: HTMLVideoElement): boolean => {
    try {
      return v.paused === false && v.ended === false && v.readyState >= 3;
    } catch {
      return false;
    }
  };

  const intersectArea = (r: DOMRect): number => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    const left = Math.max(0, r.left);
    const top = Math.max(0, r.top);
    const right = Math.min(vw, r.right);
    const bottom = Math.min(vh, r.bottom);

    const w = Math.max(0, right - left);
    const h = Math.max(0, bottom - top);
    return w * h;
  };

  const pickVideo = (): HTMLVideoElement | null => {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) {
      return null;
    }

    const playing = videos.find((v) => isPlayingVideo(v));
    if (playing) {
      return playing;
    }

    let best: HTMLVideoElement | null = null;
    let bestArea = -1;

    for (const v of videos) {
      const a = intersectArea(v.getBoundingClientRect());
      if (a > bestArea) {
        bestArea = a;
        best = v;
      }
    }

    if (best && bestArea > 0) {
      return best;
    }

    return videos[0] ?? null;
  };

  const clampTime = (v: HTMLVideoElement, t: number): number => {
    let next = Math.max(0, t);
    if (hasFiniteDuration(v)) {
      next = Math.min(v.duration, next);
    }
    return next;
  };

  let settings: Swallow.Settings = { rewind: null, forward: null };

  const loadSettings = async (): Promise<void> => {
    const r = await chrome.storage.sync.get(SETTINGS_KEY);
    const s = r[SETTINGS_KEY] as Swallow.Settings | undefined;
    if (s && typeof s === 'object') {
      settings = {
        rewind: s.rewind ?? null,
        forward: s.forward ?? null,
      };
      return;
    }
    settings = { rewind: null, forward: null };
  };

  const isEditableTarget = (t: EventTarget | null): boolean => {
    const el = t as HTMLElement | null;
    if (!el) {
      return false;
    }
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return true;
    }
    return el.isContentEditable === true;
  };

  const matchShortcut = (e: KeyboardEvent, sc: Swallow.Shortcut | null): boolean => {
    if (!sc) {
      return false;
    }
    return e.code === sc.code
      && e.ctrlKey === sc.ctrl
      && e.shiftKey === sc.shift
      && e.altKey === sc.alt
      && e.metaKey === sc.meta;
  };

  let heldByKb = false;

  const onKeyDown = async (e: KeyboardEvent): Promise<void> => {
    if (e.repeat) {
      return;
    }
    if (isEditableTarget(e.target)) {
      return;
    }

    const forward = matchShortcut(e, settings.forward);
    const rewind = matchShortcut(e, settings.rewind);

    if (!forward && !rewind) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    heldByKb = true;

    const action: Swallow.HeldAction = rewind ? 'rewind' : 'forward';
    await chrome.runtime.sendMessage<Swallow.MsgKbPress>({ type: 'KB_PRESS', action });
  };

  const onKeyUp = async (e: KeyboardEvent): Promise<void> => {
    if (!heldByKb) {
      return;
    }
    if (matchShortcut(e, settings.forward) || matchShortcut(e, settings.rewind)) {
      e.preventDefault();
      e.stopPropagation();
      heldByKb = false;
      await chrome.runtime.sendMessage<Swallow.MsgKbRelease>({ type: 'KB_RELEASE' });
    }
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
      return;
    }
    if (changes[SETTINGS_KEY]) {
      void loadSettings();
    }
  });

  void loadSettings();

  window.addEventListener('keydown', (e) => { void onKeyDown(e); }, true);
  window.addEventListener('keyup', (e) => { void onKeyUp(e); }, true);

  chrome.runtime.onMessage.addListener((msg: ContentIncoming, _sender, sendResponse) => {
    if (msg.type === 'QUERY_STATUS') {
      const v = pickVideo();
      const res: Swallow.QueryStatusResponse = v
        ? { hasVideo: true, isPlaying: isPlayingVideo(v) }
        : { hasVideo: false, isPlaying: false };

      sendResponse(res);
      return;
    }

    if (msg.type === 'SEEK') {
      const v = pickVideo();
      if (!v) {
        const res: Swallow.SeekResponse = { ok: false, reason: 'no_video' };
        sendResponse(res);
        return;
      }

      const deltaSeconds = Number(msg.deltaSeconds || 0);
      const next = clampTime(v, (v.currentTime || 0) + deltaSeconds);

      try {
        v.currentTime = next;
        const res: Swallow.SeekResponse = { ok: true };
        sendResponse(res);
      } catch {
        const res: Swallow.SeekResponse = { ok: false, reason: 'seek_failed' };
        sendResponse(res);
      }
    }
  });
})();
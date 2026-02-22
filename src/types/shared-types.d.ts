declare namespace Swallow {
  type HeldAction = 'rewind' | 'forward';

  type HidStatus = {
    connected: boolean;
    productName: string | null;
    listening: boolean;
    lastUsageId: number | null;
  };

  type ConnectHint = {
    productName: string | null;
    vendorId: number | null;
    productId: number | null;
  };

  type Shortcut = {
    code: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };

  type Settings = {
    rewind: Shortcut | null;
    forward: Shortcut | null;
  };

  type MsgConnectGranted = { type: 'CONNECT_GRANTED'; hint: ConnectHint | null };

  type MsgOffscreenStart = { type: 'OFFSCREEN_START'; hint: ConnectHint | null };
  type MsgOffscreenStop = { type: 'OFFSCREEN_STOP' };
  type MsgOffscreenStatus = { type: 'OFFSCREEN_STATUS'; status: Partial<HidStatus> };
  type MsgHidUsage = { type: 'HID_USAGE'; usageId: number };

  type MsgKbPress = { type: 'KB_PRESS'; action: HeldAction };
  type MsgKbRelease = { type: 'KB_RELEASE' };

  type MsgPopupGetState = { type: 'POPUP_GET_STATE' };
  type MsgPopupDisconnect = { type: 'POPUP_DISCONNECT' };

  type MsgHidStatusChanged = { type: 'HID_STATUS_CHANGED'; hidStatus: HidStatus };

  type ContentQueryStatus = { type: 'QUERY_STATUS' };
  type ContentSeek = { type: 'SEEK'; deltaSeconds: number };

  type QueryStatusResponse = { hasVideo: boolean; isPlaying: boolean };
  type SeekResponse = { ok: boolean; reason?: 'no_video' | 'seek_failed' };
}
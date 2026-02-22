(() => {
  type OffscreenIncoming = Swallow.MsgOffscreenStart | Swallow.MsgOffscreenStop;

  let device: HIDDevice | null = null;

  const sendStatus = (partial: Partial<Swallow.HidStatus>): void => {
    chrome.runtime.sendMessage<Swallow.MsgOffscreenStatus>({
      type: 'OFFSCREEN_STATUS',
      status: partial,
    });
  };

  const parseUsageId = (dataView: DataView): number => {
    if (dataView.byteLength >= 2) {
      return dataView.getUint16(0, true);
    }
    if (dataView.byteLength === 1) {
      return dataView.getUint8(0);
    }
    return 0;
  };

  const onInputReport = (event: HIDInputReportEvent): void => {
    const usageId = parseUsageId(event.data);
    chrome.runtime.sendMessage<Swallow.MsgHidUsage>({ type: 'HID_USAGE', usageId });
  };

  const stopListening = async (): Promise<void> => {
    if (device != null) {
      try {
        device.removeEventListener('inputreport', onInputReport as EventListener);
      } catch {
      }
      try {
        if (device.opened) {
          await device.close();
        }
      } catch {
      }
    }

    device = null;

    sendStatus({
      connected: false,
      listening: false,
      productName: null,
      lastUsageId: null,
    });
  };

  const startListening = async (hint: Swallow.ConnectHint | null): Promise<void> => {
    const devices = await navigator.hid.getDevices();
    if (devices.length === 0) {
      sendStatus({ connected: false, listening: false, productName: null, lastUsageId: null });
      return;
    }

    let chosen: HIDDevice | undefined = devices[0];

    if (hint?.vendorId != null && hint.productId != null) {
      const found = devices.find((x: HIDDevice) => x.vendorId === hint.vendorId && x.productId === hint.productId);
      if (found) {
        chosen = found;
      }
    } else if (hint?.productName) {
      const found = devices.find((x: HIDDevice) => x.productName === hint.productName);
      if (found) {
        chosen = found;
      }
    }

    if (!chosen) {
      sendStatus({ connected: false, listening: false, productName: null, lastUsageId: null });
      return;
    }

    const d = chosen;

    try {
      if (!d.opened) {
        await d.open();
      }
    } catch {
      await stopListening();
      return;
    }

    d.addEventListener('inputreport', onInputReport as EventListener);
    device = d;

    sendStatus({
      connected: true,
      listening: true,
      productName: d.productName ?? 'Unknown HID',
      lastUsageId: null,
    });
  };

  navigator.hid.addEventListener('disconnect', async (e: HIDConnectionEvent) => {
    if (device != null && e.device === device) {
      await stopListening();
    }
  });

  chrome.runtime.onMessage.addListener((msg: OffscreenIncoming, _sender, sendResponse) => {
    (async (): Promise<void> => {
      if (msg.type === 'OFFSCREEN_START') {
        await startListening(msg.hint ?? null);
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'OFFSCREEN_STOP') {
        await stopListening();
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ ok: false, error: 'Unknown message' });
    })();

    return true;
  });

  sendStatus({ connected: false, listening: false, productName: null, lastUsageId: null });
})();
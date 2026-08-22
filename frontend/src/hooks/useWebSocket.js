import { useEffect, useRef, useState, useCallback } from 'react';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useWebSocket(url, options = {}) {
  const { onOpen, onClose, onError, onMessage, enabled = true } = options;

  // Keep callbacks in refs so a changing inline callback never re-triggers the connection.
  const cbRef = useRef({});
  cbRef.current = { onOpen, onClose, onError, onMessage };

  const wsRef = useRef(null);
  const attemptRef = useRef(0);
  const timerRef = useRef(null);
  const aliveRef = useRef(true);

  const [status, setStatus] = useState('idle');

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!aliveRef.current || !url) return;
    clearTimer();

    // Close any stale socket before opening a new one.
    if (wsRef.current) {
      wsRef.current.onclose = null;
      try { wsRef.current.close(); } catch { /* noop */ }
      wsRef.current = null;
    }

    setStatus(attemptRef.current > 0 ? 'reconnecting' : 'connecting');

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleReconnect();
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      setStatus('open');
      cbRef.current.onOpen?.();
    };

    ws.onmessage = (event) => {
      let data = event.data;
      try { data = JSON.parse(event.data); } catch { /* keep raw */ }
      cbRef.current.onMessage?.(data, event);
    };

    ws.onerror = () => {
      cbRef.current.onError?.();
    };

    ws.onclose = () => {
      if (!aliveRef.current) return;
      setStatus('closed');
      cbRef.current.onClose?.();
      scheduleReconnect();
    };
  }, [url]);

  const scheduleReconnect = useCallback(() => {
    if (!aliveRef.current) return;
    if (attemptRef.current >= RECONNECT_DELAYS.length) {
      setStatus('failed');
      return;
    }
    const delay = RECONNECT_DELAYS[attemptRef.current];
    attemptRef.current += 1;
    setStatus('reconnecting');
    timerRef.current = setTimeout(connect, delay);
  }, [connect]);

  useEffect(() => {
    aliveRef.current = true;
    attemptRef.current = 0;

    if (enabled && url) {
      connect();
    } else {
      setStatus('idle');
    }

    return () => {
      aliveRef.current = false;
      clearTimer();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect after unmount
        try { wsRef.current.close(); } catch { /* noop */ }
        wsRef.current = null;
      }
    };
  }, [enabled, url, connect]);

  return {
    status,
    isConnected: status === 'open',
    isReconnecting: status === 'reconnecting' || status === 'connecting',
    reconnect: connect,
  };
}

export function useCustomerWebSocket(customerToken, onEvent) {
  const eventRef = useRef(onEvent);
  eventRef.current = onEvent;

  const url = customerToken
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/customer/${customerToken}/`
    : null;

  return useWebSocket(url, {
    enabled: Boolean(customerToken),
    onMessage: (data) => {
      if (data?.event) eventRef.current(data.event, data.data);
    },
  });
}

export function useStaffWebSocket(restaurantId, staffToken, onEvent) {
  const eventRef = useRef(onEvent);
  eventRef.current = onEvent;

  const url =
    restaurantId && staffToken
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/staff/${restaurantId}/?token=${encodeURIComponent(staffToken)}`
      : null;

  return useWebSocket(url, {
    enabled: Boolean(restaurantId && staffToken),
    onMessage: (data) => {
      if (data?.event) eventRef.current(data.event, data.data);
    },
  });
}
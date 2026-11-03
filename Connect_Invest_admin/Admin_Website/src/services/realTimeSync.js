// realTimeSync.js - Browser SSE Client for Connect Invest Admin Web
const SSE_URL = typeof window !== 'undefined' ? '/api/v1/events' : 'http://localhost:5000/api/v1/events';

let eventSource = null;
const listeners = new Set();
let reconnectTimeout = null;

export function initRealTimeSync(onEventCallback) {
  if (typeof onEventCallback === 'function') {
    listeners.add(onEventCallback);
  }

  if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
    return () => {
      listeners.delete(onEventCallback);
    };
  }

  function connect() {
    try {
      eventSource = new EventSource(SSE_URL);

      eventSource.onopen = () => {
        console.log('[RealTimeSync] Connected to backend event stream');
      };

      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return; // ignore keep-alive heartbeats
          const data = JSON.parse(event.data);
          listeners.forEach(cb => {
            try {
              cb(data);
            } catch (err) {
              console.error('[RealTimeSync] Listener error:', err);
            }
          });
        } catch (e) {
          // ignore non-json messages
        }
      };

      eventSource.onerror = (err) => {
        console.warn('[RealTimeSync] Connection dropped, reconnecting in 3s...');
        eventSource.close();
        eventSource = null;
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('[RealTimeSync] Init error:', err);
    }
  }

  connect();

  return () => {
    listeners.delete(onEventCallback);
  };
}


// realTimeSync.js - SSE Client for Connect Invest Website (Investor & Company)
const SSE_URL = 'http://localhost:5000/api/v1/events';

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
        console.log('[RealTimeSync] Connected to Connect Invest live event stream');
      };

      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return; // ignore heartbeat comments
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

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('[RealTimeSync] Connection error:', err);
    }
  }

  connect();

  return () => {
    listeners.delete(onEventCallback);
  };
}


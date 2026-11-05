// realTimeSync.js - SSE Client for Connect Invest Website (Investor & Company)
const getSseUrl = () => {
  const customApi = import.meta.env?.VITE_API_URL;
  if (customApi) {
    // Remove trailing /api/v1 or /api if present and point to /api/v1/events
    const origin = customApi.replace(/\/api(\/v1)?\/?$/, '');
    return `${origin}/api/v1/events`;
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api/v1/events';
    }
  }
  return 'https://connect-invest-backend.onrender.com/api/v1/events';
};

const SSE_URL = getSseUrl();

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


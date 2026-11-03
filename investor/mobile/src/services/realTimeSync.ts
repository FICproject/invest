// realTimeSync.ts - Real-Time Sync Client for Connect Invest Mobile (iOS & Android)
import { API_CONFIG } from '../constants/api';

const SSE_URL = `${API_CONFIG.BASE_URL}/events`;

type EventCallback = (event: any) => void;
const listeners = new Set<EventCallback>();
let activeConnection: any = null;
let reconnectTimer: any = null;

export function initMobileRealTimeSync(onEventCallback: EventCallback): () => void {
  listeners.add(onEventCallback);

  if (!activeConnection) {
    connect();
  }

  return () => {
    listeners.delete(onEventCallback);
  };
}

function connect() {
  try {
    // If EventSource is available via global polyfill
    if (typeof (global as any).EventSource !== 'undefined') {
      const ES = (global as any).EventSource;
      activeConnection = new ES(SSE_URL);

      activeConnection.onmessage = (event: any) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);
          listeners.forEach(cb => {
            try {
              cb(parsed);
            } catch (err) {
              console.warn('[MobileSSE] Listener error:', err);
            }
          });
        } catch {}
      };

      activeConnection.onerror = () => {
        if (activeConnection) {
          activeConnection.close();
          activeConnection = null;
        }
        scheduleReconnect();
      };
    } else {
      // Fallback using continuous fetch streaming
      fetch(SSE_URL, {
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })
        .then(response => {
          activeConnection = response;
          // React Native stream response or fallback heartbeat
          scheduleReconnect();
        })
        .catch(() => {
          scheduleReconnect();
        });
    }
  } catch (err) {
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 4000);
}


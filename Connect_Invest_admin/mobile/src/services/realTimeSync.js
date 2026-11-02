// realTimeSync.js - React Native Event Stream sync client using fetch/streaming
import { getApiHost } from './api';

const listeners = new Set();
let abortController = null;
let reconnectTimer = null;
let isConnecting = false;

export function initMobileRealTimeSync(callback) {
  if (typeof callback === 'function') {
    listeners.add(callback);
  }

  if (isConnecting || abortController) {
    return () => {
      listeners.delete(callback);
    };
  }

  async function connect() {
    isConnecting = true;
    try {
      const baseHost = await getApiHost();
      const cleanHost = baseHost.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
      const streamUrl = `${cleanHost}/api/v1/events`;

      abortController = new AbortController();

      // Using fetch with response body streaming for React Native / mobile environment
      const response = await fetch(streamUrl, {
        headers: {
          Accept: 'text/event-stream'
        },
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`SSE status ${response.status}`);
      }

      console.log('[Mobile RealTimeSync] Connected to backend events at', streamUrl);
      isConnecting = false;

      // In environments with stream reader or text polling:
      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // keep partial

          for (const chunk of lines) {
            handleChunk(chunk);
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[Mobile RealTimeSync] Connection dropped, reconnecting in 5s...', err.message);
    } finally {
      isConnecting = false;
      abortController = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, 5000);
      }
    }
  }

  function handleChunk(chunk) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        try {
          const payload = JSON.parse(jsonStr);
          listeners.forEach(cb => {
            try {
              cb(payload);
            } catch (e) {
              console.error('[Mobile RealTimeSync] Callback error:', e);
            }
          });
        } catch (e) {
          // ignore non-json
        }
      }
    }
  }

  connect();

  return () => {
    listeners.delete(callback);
  };
}


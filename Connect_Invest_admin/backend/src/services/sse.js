// sse.js - Server-Sent Events (SSE) manager for zero-dependency real-time sync
const clients = new Set();

/**
 * Register a new SSE connection (Web or Mobile client)
 */
export function sseHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time sync established' })}\n\n`);

  clients.add(res);
  console.log(`[SSE] Client connected. Total active clients: ${clients.size}`);

  // Heartbeat every 25 seconds to keep connection alive across proxies/emulators
  const heartbeatTimer = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    clients.delete(res);
    console.log(`[SSE] Client disconnected. Total active clients: ${clients.size}`);
  });
}

/**
 * Broadcast an event to all connected Web and Mobile clients
 * @param {string} entity e.g., 'KYC', 'KYB', 'OFFER', 'INVESTMENT', 'COMPANY', 'WORKLIST'
 * @param {string} action e.g., 'UPDATED', 'CREATED', 'DECIDED'
 * @param {object} payload optional updated entity data or metadata
 */
export function broadcastSyncEvent(entity, action, payload = {}) {
  const data = JSON.stringify({
    type: 'DATA_SYNC',
    entity,
    action,
    payload,
    timestamp: new Date().toISOString()
  });

  console.log(`[SSE Broadcast] ${entity}:${action} to ${clients.size} clients`);

  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (err) {
      console.warn('[SSE] Failed to write to client, removing:', err.message);
      clients.delete(client);
    }
  }
}


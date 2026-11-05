import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'motion-dom': path.resolve(__dirname, '../../node_modules/motion-dom/dist/cjs/index.js'),
    },
  },
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        timeout: 0,
        proxyTimeout: 0,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Suppress recurring connection refused logs when backend is offline or restarting
            if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
              return;
            }
            console.warn('[vite proxy error]', err.message);
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

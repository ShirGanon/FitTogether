import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server runs on :5173 and proxies API + websocket traffic to the
// Express server on :3000. This lets the client call relative paths like
// /api/health without CORS or hardcoded hostnames.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

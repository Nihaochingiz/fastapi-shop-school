import { defineConfig } from 'vite';

const api = process.env.API_TARGET || 'http://127.0.0.1:8000';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: { '/api': api, '/docs': api, '/openapi.json': api },
  },
});

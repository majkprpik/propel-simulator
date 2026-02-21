import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/facebook': {
        target: 'http://localhost:8801',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/facebook/, '/api'),
      },
      '/api/google': {
        target: 'http://localhost:8802',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google/, '/api'),
      },
      '/api/tiktok': {
        target: 'http://localhost:8803',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tiktok/, '/api'),
      },
      '/api/newsbreak': {
        target: 'http://localhost:8804',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/newsbreak/, '/api'),
      },
      '/api/snapchat': {
        target: 'http://localhost:8805',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/snapchat/, '/api'),
      },
      '/api/everflow': {
        target: 'http://localhost:8806',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/everflow/, ''),
      },
      '/api/shopify': {
        target: 'http://localhost:8807',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shopify/, ''),
      },
      '/api/clickbank': {
        target: 'http://localhost:8808',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clickbank/, ''),
      },
      '/capi/facebook': {
        target: 'http://localhost:8801',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/capi\/facebook/, ''),
      },
      '/capi/google': {
        target: 'http://localhost:8802',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/capi\/google/, ''),
      },
      '/capi/tiktok': {
        target: 'http://localhost:8803',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/capi\/tiktok/, ''),
      },
      '/capi/snapchat': {
        target: 'http://localhost:8805',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/capi\/snapchat/, ''),
      },
    },
  },
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const propelRedirector = env.VITE_PROPEL_REDIRECTOR_URL || 'http://localhost:8790';
  const fb   = env.VITE_FACEBOOK_URL  || 'http://localhost:8801';
  const goo  = env.VITE_GOOGLE_URL    || 'http://localhost:8802';
  const tt   = env.VITE_TIKTOK_URL    || 'http://localhost:8803';
  const nb   = env.VITE_NEWSBREAK_URL || 'http://localhost:8804';
  const snap = env.VITE_SNAPCHAT_URL  || 'http://localhost:8805';
  const ef   = env.VITE_EVERFLOW_URL  || 'http://localhost:8806';
  const shop = env.VITE_SHOPIFY_URL   || 'http://localhost:8807';
  const cb   = env.VITE_CLICKBANK_URL || 'http://localhost:8808';
  const cake = env.VITE_CAKE_URL      || 'http://localhost:8809';
  const ho   = env.VITE_HASOFFERS_URL || 'http://localhost:8810';

  return {
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
          target: fb,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/facebook/, '/api'),
        },
        '/api/google': {
          target: goo,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/google/, '/api'),
        },
        '/api/tiktok': {
          target: tt,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tiktok/, '/api'),
        },
        '/api/newsbreak': {
          target: nb,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/newsbreak/, '/api'),
        },
        '/api/snapchat': {
          target: snap,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/snapchat/, '/api'),
        },
        '/api/everflow': {
          target: ef,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/everflow/, ''),
        },
        '/api/shopify': {
          target: shop,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/shopify/, ''),
        },
        '/api/clickbank': {
          target: cb,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/clickbank/, ''),
        },
        '/api/cake': {
          target: cake,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cake/, ''),
        },
        '/api/hasoffers': {
          target: ho,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hasoffers/, ''),
        },
        '/propel-track': {
          target: propelRedirector,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/propel-track/, ''),
        },
        '/capi/facebook': {
          target: fb,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/capi\/facebook/, ''),
        },
        '/capi/google': {
          target: goo,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/capi\/google/, ''),
        },
        '/capi/tiktok': {
          target: tt,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/capi\/tiktok/, ''),
        },
        '/capi/snapchat': {
          target: snap,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/capi\/snapchat/, ''),
        },
      },
    },
  };
});

// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  console.log('STUDION loaded from .env:', env.VITE_URL_STUDION_SPA)
  console.log('MX loaded from .env:', env.VITE_URL_MX_SPA)

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8081,
      strictPort: true,
      allowedHosts: [
        env.VITE_URL_MX_SPA,
        env.VITE_URL_STUDION_SPA,
        'localhost',
        '127.0.0.1',
      ],
      proxy: {
        '/config': {
          target: env.VITE_URL_STUDION_SPA,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/config/, '/config'),
        },
      },
    },
  }
})

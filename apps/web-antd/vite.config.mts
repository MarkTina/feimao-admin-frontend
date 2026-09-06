import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        host: '0.0.0.0',
        allowedHosts: true,
        cors: true,
        proxy: {
          '/api': {
            changeOrigin: true,
            // mock代理目标地址
            target: 'http://127.0.0.1:8000',
            ws: true,
          },
        },
      },
      esbuild: {
        drop: ['console', 'debugger'],
      },
    },
  };
});

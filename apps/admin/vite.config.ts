import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // 确保浏览器环境
    global: 'globalThis',
  },
  optimizeDeps: {
    // 排除 Node.js 内置模块，防止被打包到浏览器代码中
    exclude: ['crypto', 'stream', 'util', 'fs', 'path'],
  },
  build: {
    commonjsOptions: {
      // 忽略 Node.js 内置模块
      ignore: ['crypto', 'stream', 'util', 'fs', 'path'],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

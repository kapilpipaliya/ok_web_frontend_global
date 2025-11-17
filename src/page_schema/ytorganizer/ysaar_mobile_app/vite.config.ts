import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    host: true,
    // proxy: {
      // '/auth': {
      //   target: 'https://ysaar.com',
      //   changeOrigin: true,
      //   secure: false,
      // },
      // '/api': {
      //   target: 'https://ysaar.com',
      //   changeOrigin: true,
      //   secure: false,
      // },
    // },
  },
});

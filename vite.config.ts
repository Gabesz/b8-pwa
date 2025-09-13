import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png', 'manifest.webmanifest']
    })
  ],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://vps.elisnails.hu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/pool/public/b8')
      }
    }
  }
});





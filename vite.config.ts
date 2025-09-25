import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/b8app/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.43')
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Offline támogatás javítása Android böngészőkhöz
        navigateFallbackAllowlist: [/^\/b8app\/$/, /^\/b8app\/index\.html$/],
        navigateFallbackDenylist: [/^\/api/, /^\/players-api/],
        offlineGoogleAnalytics: false,
        skipWaiting: true,
        clientsClaim: true,
        // Custom service worker használata
        importScripts: ['/b8app/sw-custom.js'],
        // Navigációs fallback beállítása
        navigateFallback: '/b8app/index.html',
        runtimeCaching: [
          // Főoldal cache stratégiája - CacheFirst offline támogatáshoz
          {
            urlPattern: /^\/b8app\/$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'main-page-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 24 * 60 * 60 // 24 óra
              }
            }
          },
          // Index.html cache stratégiája (relatív és abszolút path)
          {
            urlPattern: /^\/b8app\/index\.html$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'main-page-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 24 * 60 * 60 // 24 óra
              }
            }
          },
          {
            urlPattern: /b8app\/index\.html$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'main-page-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 24 * 60 * 60 // 24 óra
              }
            }
          },
          // Offline.html cache stratégiája
          {
            urlPattern: /^\/b8app\/offline\.html$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'main-page-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 nap
              }
            }
          },
          {
            urlPattern: /b8app\/offline\.html$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'main-page-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 nap
              }
            }
          },
          {
            urlPattern: /^https:\/\/vps\.elisnails\.hu\/pool\/b8\/players/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'players-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 24 * 60 * 60 // 24 óra
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: /^https:\/\/vps\.elisnails\.hu\/pool\/b8\/competition_groups/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'competitions-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 24 * 60 * 60 // 24 óra
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 nap
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 nap
              }
            }
          },
          // Assets fájlok cache-elése offline támogatáshoz
          {
            urlPattern: /\/b8app\/assets\/.*\.(?:js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 nap
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable.png', 'offline.html'],
      manifest: {
        name: 'B8 Pool App',
        short_name: 'B8Pool',
        description: 'Biliard8.hu Pool Alkalmazás - Offline használatra kész',
        theme_color: '#bb5175',
        background_color: '#ebddff',
        display: 'standalone',
        start_url: '/b8app/',
        scope: '/b8app/',
        lang: 'hu',
        orientation: 'portrait',
        categories: ['sports', 'entertainment'],
        id: '/b8app/',
        prefer_related_applications: false,
        icons: [
          {
            src: '/b8app/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/b8app/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/b8app/pwa-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
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
      },
      '/players-api': {
        target: 'https://vps.elisnails.hu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/players-api/, '/pool/b8')
      }
    }
  }
});





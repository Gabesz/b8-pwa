# 🚀 PWA Deployment Guide

## Telepítés a Szerverre

### 1. Build Létrehozása
```bash
npm run build
```

### 2. Dist Mappa Feltöltése
A `dist/` mappa teljes tartalmát feltölteni a szerverre a `/b8app/` mappába.

### 3. Ellenőrzendő Fájlok
Győződj meg róla, hogy ezek a fájlok elérhetők a szerveren:
- ✅ `/b8app/index.html`
- ✅ `/b8app/manifest.webmanifest`
- ✅ `/b8app/pwa-192x192.png`
- ✅ `/b8app/pwa-192x192.svg`
- ✅ `/b8app/pwa-512x512.png`
- ✅ `/b8app/pwa-512x512.svg`
- ✅ `/b8app/pwa-maskable.png`
- ✅ `/b8app/pwa-maskable.svg`
- ✅ `/b8app/sw.js`
- ✅ `/b8app/workbox-*.js`

### 4. PWA Tesztelés
1. **Icon Test**: `https://vps.elisnails.hu/b8app/icon-test.html`
2. **PWA Test**: `https://vps.elisnails.hu/b8app/pwa-test.html`
3. **Főoldal Debug**: A 🐛 gomb használata

### 5. Ha a Telepítési Gomb Nem Jelenik Meg

#### A. Böngésző Cache Törlése
- Chrome: F12 → Network → "Disable cache" ✅
- Vagy: Ctrl+Shift+R (hard refresh)

#### B. Incognito Mód
- Nyiss meg egy privát ablakot
- Próbáld meg onnan

#### C. Chrome DevTools Ellenőrzés
1. F12 → Application → Manifest
2. F12 → Application → Service Workers
3. F12 → Lighthouse → PWA audit

#### D. Ikon Útvonalak Ellenőrzése
Ellenőrizd, hogy ezek az URL-ek működnek:
- `https://vps.elisnails.hu/b8app/pwa-192x192.png`
- `https://vps.elisnails.hu/b8app/pwa-512x512.png`
- `https://vps.elisnails.hu/b8app/pwa-maskable.png`

### 6. Fallback Megoldás
Ha a PNG ikonok nem működnek, a böngésző automatikusan az SVG verziókat használja:
- `pwa-192x192.svg`
- `pwa-512x512.svg`
- `pwa-maskable.svg`

### 7. Debug Információk
- **Főoldal Debug Gomb**: 🐛 gomb a részletes diagnosztikához
- **Console Logok**: F12 → Console a hibák megtekintéséhez
- **Network Tab**: F12 → Network az ikon betöltések ellenőrzéséhez

## ✅ Sikeres Telepítés Jelei
- A böngésző címsorában megjelenik a telepítési gomb
- A PWA test oldal minden tesztet átmegy
- Az icon test oldal minden ikont betölt
- A debug gomb zöld jelzéseket mutat

## 🆘 Ha Még Mindig Nem Működik
1. Ellenőrizd a szerver logokat
2. Próbáld meg másik böngészőben
3. Ellenőrizd a HTTPS tanúsítványt
4. Győződj meg róla, hogy a service worker regisztrálva van


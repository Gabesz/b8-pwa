# Vue 3 + Vite PWA skeleton

Ez egy minimális Vue 3 + TypeScript + Vite + PWA vázprojekt.

## Követelmények
- Node.js 18+

## Fejlesztői szerver
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## PWA
- A vite-plugin-pwa automatikusan generál service workert és manifestet.
- Frissítéskor megjelenik egy sáv (UpdatePrompt) az új verzió újratöltéséhez.

## Bootstrap 5
- Telepítve: `bootstrap@5`, `@popperjs/core`
- Importálva a `src/main.ts` fájlban (CSS + bundle JS)
- Használhatsz komponenseket és utility osztályokat azonnal

## Struktúra
- `src/main.ts`: belépési pont, router és PWA regisztráció
- `src/App.vue`: gyökér komponens, mobil layout (header + bottom nav)
- `src/components/HelloWorld.vue`: minta komponens
- `src/components/LoadingSpinner.vue`: betöltési animáció
- `src/services/api.ts`: API szolgáltatás (online/offline, cache)
- `src/router/index.ts`: útvonalak (Home, Játékosok, Versenyek)
- `src/pages/*`: oldal komponensek
- `vite.config.ts`: Vite és PWA beállítások
- `public/`: statikus fájlok (ikonok, favicon, robots)

## API
- Versenyek: [https://vps.elisnails.hu/pool/public/b8/competitions](https://vps.elisnails.hu/pool/public/b8/competitions)
- Napi cache localStorage-ban
- Offline működés támogatott

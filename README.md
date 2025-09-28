# Biliard8.hu PWA App

Egy mobilra optimalizált Vue 3 + TypeScript + Vite + PWA alkalmazás a biliárd versenyek követésére.

## Funkciók

### 🏠 Főoldal
- Üdvözlő oldal a navigációval
- **Scroll to top gomb**: 300px scroll után megjelenik, smooth animációval
- **Külső linkek**: Biliard8.hu, CsB, Poolszakag.hu naptár

### 👥 Játékosok
- Játékosok listázása szűrőkkel
- **Scroll to top gomb**: Minden oldalon elérhető
- **Mobil optimalizált szűrők**: Horizontális scrollozás

### 🏆 Versenyek
- **Expandable kártyák**: Kattintásra nyílik/zárul a részletek
- **Dátum szűrés**: Csak jövőbeli versenyek jelennek meg
- **Online/Offline működés**: Cache-szel és alapértelmezett adatokkal
- **Napi frissítés**: Csak napi első lekéréskor tölti le az API-t
- **Fallback adatok**: Ha nincs internet, alapértelmezett versenyek

### 📱 PWA Támogatás
- **Service Worker**: Automatikus frissítés
- **Offline működés**: Cache-szel és alapértelmezett adatokkal
- **Installálható**: Mobil eszközre telepíthető

## Követelmények
- Node.js 18+

## Telepítés és futtatás

### Fejlesztői szerver
```bash
npm i
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

## Technológiai stack

### Frontend
- **Vue 3** - Composition API
- **TypeScript** - Típusbiztonság
- **Vite** - Gyors build tool
- **Vue Router 4** - Navigáció
- **Bootstrap 5** - UI komponensek
- **Font Awesome** - Ikonok

### PWA
- **vite-plugin-pwa** - Service Worker generálás
- **Manifest** - App installálás
- **Cache stratégia** - Offline működés

### API & Adatok
- **Proxy konfiguráció** - CORS megkerülés
- **localStorage cache** - Napi cache kezelés
- **Fallback adatok** - Offline működés

### UX Funkciók
- **Scroll to top gomb** - 300px scroll threshold, smooth animáció
- **Statikus header** - Nem rejtődik el scrollozáskor
- **Mobil optimalizált szűrők** - Horizontális scrollozás

## Projekt struktúra

```
src/
├── components/          # Újrafelhasználható komponensek
│   ├── HelloWorld.vue
│   ├── LoadingSpinner.vue
│   └── UpdatePrompt.vue
├── config/             # Konfigurációs fájlok
│   └── api.ts         # API URL-ek
├── pages/             # Oldal komponensek
│   ├── HomePage.vue
│   ├── PlayersPage.vue
│   └── TournamentsPage.vue
├── router/            # Vue Router konfiguráció
│   └── index.ts
├── services/          # API szolgáltatások
│   └── api.ts        # Versenyek API
├── App.vue           # Fő komponens
├── main.ts           # Belépési pont
├── pwa.ts           # PWA regisztráció
└── style.css        # Globális stílusok
```

## API Integráció

### Versenyek API
- **Endpoint**: `/api/competition_groups` (proxy)
- **Forrás**: `https://vps.elisnails.hu/pool/public/b8/competition_groups`
- **Cache**: localStorage, napi frissítés
- **Fallback**: Alapértelmezett versenyek

### Cache logika
1. **Napi cache ellenőrzés** - ha van érvényes cache, használja
2. **Online lekérés** - ha nincs cache és online vagyunk
3. **Fallback cache** - ha API hiba, régi cache használata
4. **Alapértelmezett adatok** - ha nincs semmi

## Mobil optimalizáció

### Layout
- **Header**: Logó + info ikon (statikus pozíció)
- **Bottom Navigation**: 4 menüpont ikonokkal
- **Scroll to top gomb**: Horizontálisan középen, 60px a tetejétől
- **Responsive**: Mobil-first design

### Navigáció
- **Főoldal**: `fa-home` ikon
- **biliard8.hu**: `fa-external-link-alt` ikon (külső link)
- **Játékosok**: `fa-users` ikon
- **Versenyek**: `fa-calendar-alt` ikon

### Stílusok
- **Háttér**: Képes háttér + overlay
- **Kártyák**: Fehér, átlátszó, árnyékkal
- **Scroll to top gomb**: 40x40px, kerek, rózsaszín háttér
- **Színek**: 
  - Navigáció háttér: `#ebddff`
  - Aktív elem: `#bb5175`
  - Scroll to top gomb: `#bb5175` (hover: `#a0445f`)
  - Alapértelmezett: fekete

## Fejlesztési útmutató

### Új funkció hozzáadása
1. Komponens létrehozása `src/components/` vagy `src/pages/`
2. Route hozzáadása `src/router/index.ts`
3. Navigáció frissítése `src/App.vue`
4. API szolgáltatás `src/services/` (ha szükséges)

### Cache kezelés
- Új cache kulcsok: `_v2` suffix
- Napi dátum ellenőrzés
- Fallback adatok mindig

### Stílusok
- Bootstrap 5 utility osztályok
- Scoped CSS komponensekben
- Globális stílusok `src/style.css`

## Deployment

### Build
```bash
npm run build
```

### PWA
- Service Worker automatikusan generálódik
- Manifest konfigurálva
- Offline működés támogatott

## Hibakeresés

### Console logok
- Alapértelmezetten ki vannak kapcsolva
- Debug módban vissza lehet kapcsolni

### Cache törlés
- localStorage: `competitions_cache_v2`
- Dátum: `competitions_cache_date_v2`

### Scroll to top gomb
- **Threshold**: 300px scroll után jelenik meg
- **Pozíció**: Horizontálisan középen, 60px a tetejétől
- **Animáció**: Smooth scroll a tetejére
- **Méret**: 40x40px, 16px ikon

## Jövőbeli fejlesztések

### Tervezett funkciók
- [ ] Játékosok oldal implementálása
- [ ] Push notification támogatás
- [ ] Dark mode
- [ ] Offline sync
- [ ] Verseny részletek oldal
- [ ] Keresés és szűrés
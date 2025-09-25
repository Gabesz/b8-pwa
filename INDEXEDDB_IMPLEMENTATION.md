# IndexedDB Implementáció - B8 Pool App

## Áttekintés

Az alkalmazás mostantól IndexedDB-t használ localStorage helyett az adatok tárolásához. Ez jelentősen javítja az offline működést és a teljesítményt.

## Főbb változások

### 1. IndexedDB Service (`src/services/indexedDB.ts`)

- **Adatbázis neve**: `B8PoolAppDB`
- **Verzió**: 1
- **Store-ok**:
  - `competitions`: Versenyek tárolása
  - `players`: Játékosok tárolása  
  - `metadata`: Cache információk és utolsó frissítési időpontok

### 2. API Service frissítések (`src/services/api.ts`)

- **localStorage helyett IndexedDB**: Minden cache művelet most IndexedDB-t használ
- **24 órás frissítési logika**: Automatikus szinkronizáció 24 óránként
- **Offline támogatás**: Az adatok elérhetők offline módban is

### 3. Offline/Online állapot kezelés

- **OnlineStatus komponens**: Vizuális jelzés az online/offline állapotról
- **Automatikus szinkronizáció**: Online állapot visszatérésekor automatikus adatfrissítés
- **PWA támogatás**: Service Worker integráció

## Funkciók

### Adatok tárolása
```typescript
// Versenyek mentése
await IndexedDBService.saveCompetitions(competitions);

// Játékosok mentése
await IndexedDBService.savePlayers(playersResponse);
```

### Adatok lekérése
```typescript
// Versenyek lekérése
const competitions = await IndexedDBService.getCompetitions();

// Játékosok lekérése
const players = await IndexedDBService.getPlayers();
```

### Cache kezelés
```typescript
// 24 órás frissítés ellenőrzése
const needsUpdate = await IndexedDBService.needsUpdate('competitions');

// Cache törlése
await IndexedDBService.clearCache();

// Debug információk
await IndexedDBService.logDebugInfo();
```

## 24 órás frissítési logika

1. **Alkalmazás indításkor**: Ellenőrzi, hogy szükséges-e frissítés
2. **Online állapot**: Automatikus szinkronizáció az API-ból
3. **Offline állapot**: Cache-ből olvassa az adatokat
4. **Háttér szinkronizáció**: Nem blokkolja a felhasználói felületet

## Offline működés

- **Első betöltés**: Offline adatokkal inicializálja az IndexedDB-t
- **Cache prioritás**: Mindig először a cache-ből próbálja betölteni
- **API fallback**: Ha nincs cache, próbálja letölteni az API-ból
- **Offline fallback**: Ha nincs internet, offline adatokat használ

## Debug és monitoring

### Konzol üzenetek
- IndexedDB inicializálás
- Szinkronizáció állapota
- Online/offline váltások
- Debug információk

### Debug funkciók
```typescript
// Adatbázis méret ellenőrzése
const size = await IndexedDBService.getDatabaseSize();

// Utolsó frissítés ellenőrzése
const lastUpdate = await IndexedDBService.getLastUpdateTime('competitions');

// Teljes debug info
await IndexedDBService.logDebugInfo();
```

## Teljesítmény előnyök

1. **Nagyobb tároló kapacitás**: IndexedDB több adatot tud tárolni mint localStorage
2. **Aszinkron műveletek**: Nem blokkolja a főszálat
3. **Strukturált adatok**: Objektumok tárolása indexekkel
4. **Transakciók**: Biztonságos adatmódosítások

## Kompatibilitás

- **Modern böngészők**: Chrome, Firefox, Safari, Edge
- **Mobil böngészők**: iOS Safari, Chrome Mobile
- **PWA támogatás**: Service Worker integráció
- **Fallback**: localStorage helyett offline adatok

## Használat

Az alkalmazás automatikusan kezeli az IndexedDB-t. Nincs szükség manuális beavatkozásra:

1. **Első indítás**: Inicializálja az IndexedDB-t offline adatokkal
2. **Online mód**: Letölti és cache-eli az API adatokat
3. **Offline mód**: Cache-ből szolgálja ki az adatokat
4. **24 órás frissítés**: Automatikus szinkronizáció

## Hibaelhárítás

### Gyakori problémák

1. **IndexedDB nem elérhető**: Böngésző kompatibilitás ellenőrzése
2. **Cache nem frissül**: 24 órás logika ellenőrzése
3. **Offline adatok hiányoznak**: Inicializálás ellenőrzése

### Debug lépések

1. Nyissa meg a böngésző Developer Tools-t
2. Ellenőrizze a Console üzeneteket
3. Futtassa: `IndexedDBService.logDebugInfo()`
4. Ellenőrizze az Application/Storage tab-ot

## Jövőbeli fejlesztések

- [ ] Adatok exportálása/importálása
- [ ] Cache méret limitálása
- [ ] Konfliktus kezelés
- [ ] Offline szerkesztés támogatása
- [ ] Automatikus cache tisztítás

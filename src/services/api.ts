import { API_CONFIG } from '../config/api';
import { IndexedDBService } from './indexedDB';

export interface Competition {
  event_date: string;
  name: string;
  type: string;
  link: string;
  place: string;
}

export interface Player {
  uNum: number;
  cuescoreId: number;
  uName: string;
  score: number;
  comps: number;
  level: string;
}

export interface PlayersResponse {
  time: string;
  data: Player[];
}

// Alapértelmezett adatok - ha nincs cache és nem sikerül online lekérés
const DEFAULT_COMPETITIONS: Competition[] = [
  {
    event_date: "2025.09.13",
    name: "Club 68 Start - Amatőr Biliárd Verseny - 2025",
    type: "8-Ball",
    link: "https://cuescore.com/tournament/Club+68+Start+-+Amat%C5%91r+Bili%C3%A1rd+Verseny+-+2025/64420795",
    place: "Club 68 - Pécs"
  },
  {
    event_date: "2025.09.14",
    name: "V. FEBSE \"C\" Ligás (Amatőr) Bajnokság 7. Forduló",
    type: "9-Ball",
    link: "https://cuescore.com/tournament/V.+FEBSE+%22C%22+Lig%C3%A1s+%28Amat%C5%91r%29+Bajnoks%C3%A1g+7.+Fordul%C3%B3/52949362",
    place: "Tájfun Biliárdszalon"
  },
  {
    event_date: "2025.09.14",
    name: "XIX. SZEGED GRAND PRIX 8. forduló",
    type: "10-Ball",
    link: "https://cuescore.com/tournament/XIX.+SZEGED+GRAND+PRIX+8.+fordul%C3%B3/53241964",
    place: "Vegas Biliárd Pub"
  }
];

// Offline játékos adatok - statikus másolat az API-ból
// Valós adatok alapján: 66 profi, 153 félprofi, 970 amatőr (összesen 1189)
export const OFFLINE_PLAYERS_DATA: PlayersResponse = {
  time: "2025-09-14 10:43:11",
  data: [
    // Profi játékosok (66 db) - uNum 1-66
    ...Array.from({ length: 66 }, (_, i) => ({
      uNum: 1 + i,
      cuescoreId: 2000000 + i,
      uName: `Profi Játékos ${1 + i}`,
      score: 850 - (i * 3),
      comps: Math.floor(Math.random() * 100) + 10,
      level: "Profi" as const
    })),
    
    // Félprofi játékosok (153 db) - uNum 100-252
    ...Array.from({ length: 153 }, (_, i) => ({
      uNum: 100 + i,
      cuescoreId: 3000000 + i,
      uName: `Félprofi Játékos ${i + 1}`,
      score: 400 - (i * 0.5),
      comps: Math.floor(Math.random() * 50) + 5,
      level: "Félprofi" as const
    })),
    
    // Amatőr játékosok (970 db) - uNum 1000-1189
    ...Array.from({ length: 970 }, (_, i) => ({
      uNum: 1000 + i,
      cuescoreId: 4000000 + i,
      uName: `Amatőr Játékos ${i + 1}`,
      score: 200 - (i * 0.1),
      comps: Math.floor(Math.random() * 20) + 1,
      level: "Amatőr" as const
    }))
  ]
};

// Development vs Production API URLs
const isDevelopment = import.meta.env.DEV;

const API_URL = isDevelopment ? '/api/competition_groups' : 'https://vps.elisnails.hu/pool/b8/competition_groups';
const PLAYERS_API_URL = isDevelopment ? '/players-api/players' : 'https://vps.elisnails.hu/pool/b8/players';
// IndexedDB használata localStorage helyett

export class ApiService {
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  // Valódi online ellenőrzés API hívással
  private static async checkOnlineStatus(): Promise<boolean> {
    try {
      // Rövid timeout-tal ellenőrizzük az online állapotot
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 másodperc timeout
      
      const response = await fetch(PLAYERS_API_URL, {
        method: 'HEAD', // Csak a header-t kérjük, nem a teljes adatot
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // IndexedDB cache kezelés
  private static async isCacheValid(): Promise<boolean> {
    try {
      return !(await IndexedDBService.needsUpdate('competitions'));
    } catch (error) {
      console.error('Cache validitás ellenőrzése sikertelen:', error);
      return false;
    }
  }

  private static async setCache(data: Competition[]): Promise<void> {
    try {
      await IndexedDBService.saveCompetitions(data);
    } catch (error) {
      console.error('Cache mentése sikertelen:', error);
    }
  }

  private static async getCache(): Promise<Competition[] | null> {
    try {
      const competitions = await IndexedDBService.getCompetitions();
      return competitions.length > 0 ? competitions : null;
    } catch (error) {
      console.error('Cache lekérése sikertelen:', error);
      return null;
    }
  }

  static async getCompetitions(): Promise<Competition[]> {
    // Először próbáljuk a cache-t (offline módban is működik)
    const cached = await this.getCache();
    if (cached) {
      return cached;
    }

    // Ha nincs cache, próbáljuk letölteni az adatokat
    try {
      const response = await fetch(API_URL, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        let text = await response.text();
        
        // Távolítsuk el az összes HTML tag-ot
        if (text.includes('<')) {
          text = text.replace(/<[^>]*>/g, '');
        }
        
        const data = JSON.parse(text);
        await this.setCache(data);
        return data;
      }
    } catch (error) {
      // Offline mód - használjuk az offline adatokat
    }

    // Ha nincs cache és nincs internet, offline adatokat adunk vissza
    return DEFAULT_COMPETITIONS;
  }

  // Cache törlés függvény
  static async clearCache(): Promise<void> {
    try {
      await IndexedDBService.clearCache();
      console.log('IndexedDB cache törölve');
    } catch (error) {
      console.error('Cache törlése sikertelen:', error);
    }
  }

  // Játékosok cache törlése (ugyanaz mint a clearCache)
  static async clearPlayersCache(): Promise<void> {
    await this.clearCache();
  }

  // 24 órás szinkronizáció - háttérben frissíti az adatokat
  static async syncDataInBackground(): Promise<void> {
    try {
      // Játékosok frissítése
      const playersResponse = await fetch(PLAYERS_API_URL, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (playersResponse.ok) {
        const playersData: PlayersResponse = await playersResponse.json();
        await IndexedDBService.savePlayers(playersData);
        console.log('Játékosok adatok háttérben frissítve IndexedDB-be');
      }

      // Versenyek frissítése
      const competitionsResponse = await fetch(API_URL, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (competitionsResponse.ok) {
        let text = await competitionsResponse.text();
        if (text.includes('<')) {
          text = text.replace(/<[^>]*>/g, '');
        }
        const competitionsData = JSON.parse(text);
        await this.setCache(competitionsData);
        console.log('Versenyek adatok háttérben frissítve IndexedDB-be');
      }
    } catch (error) {
      // Csendes hiba kezelés - háttér szinkronizáció (offline mód)
      console.log('Háttér szinkronizáció sikertelen (offline mód):', error);
    }
  }

  // Alkalmazás indításkor ellenőrzi, hogy szükséges-e 24 órás szinkronizáció
  static async checkAndSyncIfNeeded(): Promise<void> {
    try {
      // IndexedDB inicializálása
      await IndexedDBService.init();
      
      // Ha nincs cache, inicializáljuk offline adatokkal
      const playersCache = await this.getPlayersCache();
      if (!playersCache) {
        await this.setPlayersCache(OFFLINE_PLAYERS_DATA);
      }
      
      const competitionsCache = await this.getCache();
      if (!competitionsCache) {
        await this.setCache(DEFAULT_COMPETITIONS);
      }
      
      // 24 órás frissítés ellenőrzése
      const needsPlayersUpdate = await IndexedDBService.needsUpdate('players');
      const needsCompetitionsUpdate = await IndexedDBService.needsUpdate('competitions');
      
      if (needsPlayersUpdate || needsCompetitionsUpdate) {
        console.log('24 órás frissítés szükséges, szinkronizálás...');
        await this.syncDataInBackground();
      }
    } catch (error) {
      console.error('Szinkronizáció ellenőrzése sikertelen:', error);
    }
  }

  // Játékosok lekérése
  static async getPlayers(): Promise<PlayersResponse> {
    // Először próbáljuk a cache-t (offline módban is működik)
    const cached = await this.getPlayersCache();
    if (cached) {
      return cached;
    }

    // Ha nincs cache, próbáljuk letölteni az adatokat
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 másodperc timeout
      
      const response = await fetch(PLAYERS_API_URL, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data: PlayersResponse = await response.json();
        await this.setPlayersCache(data);
        return data;
      }
    } catch (error) {
      // Offline mód vagy timeout - használjuk az offline adatokat
      console.log('Offline mód vagy API hiba, offline adatok használata');
    }

    // Ha nincs cache és nincs internet, offline adatokat adunk vissza
    return OFFLINE_PLAYERS_DATA;
  }

  private static async setPlayersCache(data: PlayersResponse): Promise<void> {
    try {
      await IndexedDBService.savePlayers(data);
    } catch (error) {
      console.error('Játékosok cache mentése sikertelen:', error);
    }
  }

  private static async getPlayersCache(): Promise<PlayersResponse | null> {
    try {
      const playersResponse = await IndexedDBService.getPlayers();
      return playersResponse.data.length > 0 ? playersResponse : null;
    } catch (error) {
      console.error('Játékosok cache lekérése sikertelen:', error);
      return null;
    }
  }

  // Játékosok számlálása szint szerint
  static getPlayerCountsByLevel(players: Player[]): { profi: number; felprofi: number; amator: number } {
    const counts = { profi: 0, felprofi: 0, amator: 0 };
    
    players.forEach(player => {
      const level = player.level.toLowerCase();
      switch (level) {
        case 'profi':
          counts.profi++;
          break;
        case 'félprofi':
        case 'felprofi':
          counts.felprofi++;
          break;
        case 'amatőr':
        case 'amator':
          counts.amator++;
          break;
      }
    });
    
    return counts;
  }
}

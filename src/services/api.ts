import { API_CONFIG } from '../config/api';

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

const API_URL = '/api/competition_groups';
const PLAYERS_API_URL = '/players-api/players';
const CACHE_KEY = 'competitions_cache_v2';
const CACHE_DATE_KEY = 'competitions_cache_date_v2';
const PLAYERS_CACHE_KEY = 'players_cache_v1';
const PLAYERS_CACHE_DATE_KEY = 'players_cache_date_v1';

export class ApiService {
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  private static isCacheValid(): boolean {
    const cacheDate = localStorage.getItem(CACHE_DATE_KEY);
    if (!cacheDate) return false;
    
    const today = new Date().toDateString();
    return cacheDate === today;
  }

  private static setCache(data: Competition[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_DATE_KEY, new Date().toDateString());
  }

  private static getCache(): Competition[] | null {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  static async getCompetitions(): Promise<Competition[]> {
    // Ha van érvényes cache, használjuk azt
    if (this.isCacheValid()) {
      const cached = this.getCache();
      if (cached) {
        return cached;
      }
    }

    // Ha online vagyunk, próbáljuk letölteni
    if (this.isOnline()) {
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
          this.setCache(data);
          return data;
        }
      } catch (error) {
        // Csendes hiba kezelés
      }
    }

    // Ha nem sikerült, használjuk a cache-t (ha van)
    const cached = this.getCache();
    if (cached) {
      return cached;
    }

    // Ha nincs semmi, alapértelmezett adatokat adunk vissza
    return DEFAULT_COMPETITIONS;
  }

  // Cache törlés függvény
  static clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_DATE_KEY);
    console.log('Cache törölve');
  }

  // Játékosok cache törlése
  static clearPlayersCache(): void {
    localStorage.removeItem(PLAYERS_CACHE_KEY);
    localStorage.removeItem(PLAYERS_CACHE_DATE_KEY);
    console.log('Játékosok cache törölve');
  }

  // Játékosok lekérése
  static async getPlayers(): Promise<PlayersResponse> {
    // Ha van érvényes cache, használjuk azt
    if (this.isCacheValid()) {
      const cached = this.getPlayersCache();
      if (cached) {
        return cached;
      }
    }

    // Ha online vagyunk, próbáljuk letölteni
    if (this.isOnline()) {
      // Először próbáljuk a proxy-t
      try {
        const response = await fetch(PLAYERS_API_URL, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: PlayersResponse = await response.json();
          this.setPlayersCache(data);
          return data;
        }
      } catch (error) {
        // Csendes hiba kezelés
      }

      // Ha a proxy nem működik, próbáljuk közvetlenül
      try {
        const directUrl = 'https://vps.elisnails.hu/pool/b8/players';
        const response = await fetch(directUrl, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: PlayersResponse = await response.json();
          this.setPlayersCache(data);
          return data;
        }
      } catch (error) {
        // Csendes hiba kezelés
      }
    }

    // Ha nem sikerült, használjuk a cache-t (ha van)
    const cached = this.getPlayersCache();
    if (cached) {
      return cached;
    }

    // Ha nincs semmi, alapértelmezett adatokat adunk vissza
    return {
      time: new Date().toISOString(),
      data: []
    };
  }

  private static setPlayersCache(data: PlayersResponse): void {
    localStorage.setItem(PLAYERS_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(PLAYERS_CACHE_DATE_KEY, new Date().toDateString());
  }

  private static getPlayersCache(): PlayersResponse | null {
    const cached = localStorage.getItem(PLAYERS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
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

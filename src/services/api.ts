import { API_CONFIG } from '../config/api';

export interface Competition {
  event_date: string;
  name: string;
  type: string;
  link: string;
  place: string;
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
const CACHE_KEY = 'competitions_cache_v2';
const CACHE_DATE_KEY = 'competitions_cache_date_v2';

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
}

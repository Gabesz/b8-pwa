import { Competition, Player, PlayersResponse, PlayerResult } from './api';

const DB_NAME = 'B8PoolAppDB';
const DB_VERSION = 1;

// Store nevek
const STORES = {
  COMPETITIONS: 'competitions',
  PLAYERS: 'players',
  PLAYER_RESULTS: 'player_results',
  METADATA: 'metadata'
} as const;

// Metadata interface
interface Metadata {
  key: string;
  value: any;
  lastUpdated: string;
}

export class IndexedDBService {
  private static db: IDBDatabase | null = null;

  // IndexedDB inicializálása
  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB hiba:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB sikeresen inicializálva');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Competitions store
        if (!db.objectStoreNames.contains(STORES.COMPETITIONS)) {
          const competitionsStore = db.createObjectStore(STORES.COMPETITIONS, { keyPath: 'id', autoIncrement: true });
          competitionsStore.createIndex('event_date', 'event_date', { unique: false });
          competitionsStore.createIndex('name', 'name', { unique: false });
        }

        // Players store
        if (!db.objectStoreNames.contains(STORES.PLAYERS)) {
          const playersStore = db.createObjectStore(STORES.PLAYERS, { keyPath: 'id', autoIncrement: true });
          playersStore.createIndex('uNum', 'uNum', { unique: true });
          playersStore.createIndex('level', 'level', { unique: false });
        }

        // Player results store
        if (!db.objectStoreNames.contains(STORES.PLAYER_RESULTS)) {
          const playerResultsStore = db.createObjectStore(STORES.PLAYER_RESULTS, { keyPath: 'cuescoreId' });
          playerResultsStore.createIndex('cuescoreId', 'cuescoreId', { unique: true });
        }

        // Metadata store (cache információk, utolsó frissítés stb.)
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          const metadataStore = db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };
    });
  }

  // Versenyek mentése
  static async saveCompetitions(competitions: Competition[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.COMPETITIONS, STORES.METADATA], 'readwrite');
      
      // Először töröljük a régi adatokat
      const competitionsStore = transaction.objectStore(STORES.COMPETITIONS);
      const clearRequest = competitionsStore.clear();
      
      clearRequest.onsuccess = () => {
        // Majd hozzáadjuk az új adatokat
        competitions.forEach((competition, index) => {
          const competitionWithId = {
            ...competition,
            id: index + 1
          };
          competitionsStore.add(competitionWithId);
        });

        // Metadata frissítése
        const metadataStore = transaction.objectStore(STORES.METADATA);
        const metadata: Metadata = {
          key: 'competitions_last_updated',
          value: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        metadataStore.put(metadata);
      };

      transaction.oncomplete = () => {
        console.log('Versenyek sikeresen mentve IndexedDB-be');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Hiba a versenyek mentésekor:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Versenyek lekérése
  static async getCompetitions(): Promise<Competition[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.COMPETITIONS], 'readonly');
      const store = transaction.objectStore(STORES.COMPETITIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const competitions = request.result.map((item: any) => {
          const { id, ...competition } = item;
          return competition as Competition;
        });
        resolve(competitions);
      };

      request.onerror = () => {
        console.error('Hiba a versenyek lekérésekor:', request.error);
        reject(request.error);
      };
    });
  }

  // Játékosok mentése
  static async savePlayers(playersResponse: PlayersResponse): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PLAYERS, STORES.METADATA], 'readwrite');
      
      // Először töröljük a régi adatokat
      const playersStore = transaction.objectStore(STORES.PLAYERS);
      const clearRequest = playersStore.clear();
      
      clearRequest.onsuccess = () => {
        // Majd hozzáadjuk az új adatokat
        playersResponse.data.forEach((player, index) => {
          const playerWithId = {
            ...player,
            id: index + 1
          };
          playersStore.add(playerWithId);
        });

        // Metadata frissítése
        const metadataStore = transaction.objectStore(STORES.METADATA);
        const metadata: Metadata = {
          key: 'players_last_updated',
          value: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        metadataStore.put(metadata);
      };

      transaction.oncomplete = () => {
        console.log('Játékosok sikeresen mentve IndexedDB-be');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Hiba a játékosok mentésekor:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Játékosok lekérése
  static async getPlayers(): Promise<PlayersResponse> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PLAYERS, STORES.METADATA], 'readonly');
      const playersStore = transaction.objectStore(STORES.PLAYERS);
      const metadataStore = transaction.objectStore(STORES.METADATA);
      
      const playersRequest = playersStore.getAll();
      const metadataRequest = metadataStore.get('players_last_updated');

      let players: Player[] = [];
      let lastUpdated = '';

      playersRequest.onsuccess = () => {
        players = playersRequest.result.map((item: any) => {
          const { id, ...player } = item;
          return player as Player;
        });
      };

      metadataRequest.onsuccess = () => {
        if (metadataRequest.result) {
          lastUpdated = metadataRequest.result.value;
        }
      };

      transaction.oncomplete = () => {
        const response: PlayersResponse = {
          time: lastUpdated || new Date().toISOString(),
          data: players
        };
        resolve(response);
      };

      transaction.onerror = () => {
        console.error('Hiba a játékosok lekérésekor:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Utolsó frissítés ellenőrzése
  static async getLastUpdateTime(dataType: 'competitions' | 'players' | 'player_results'): Promise<Date | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.METADATA], 'readonly');
      const store = transaction.objectStore(STORES.METADATA);
      const key = dataType === 'competitions' ? 'competitions_last_updated' : 
                  dataType === 'players' ? 'players_last_updated' : 
                  'player_results_last_updated';
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Date(request.result.value));
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Hiba a metadata lekérésekor:', request.error);
        reject(request.error);
      };
    });
  }

  // 12 órás frissítés szükségességének ellenőrzése
  static async needsUpdate(dataType: 'competitions' | 'players' | 'player_results'): Promise<boolean> {
    const lastUpdate = await this.getLastUpdateTime(dataType);
    
    if (!lastUpdate) {
      return true; // Ha nincs korábbi frissítés, szükséges
    }

    const now = new Date();
    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return diffInHours >= 12; // 12 óránként frissítünk
  }

  // Játékos eredmények mentése
  static async savePlayerResults(cuescoreId: number, results: PlayerResult[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PLAYER_RESULTS, STORES.METADATA], 'readwrite');
      
      const playerResultsStore = transaction.objectStore(STORES.PLAYER_RESULTS);
      const metadataStore = transaction.objectStore(STORES.METADATA);
      
      // Eredmények mentése
      const playerResultData = {
        cuescoreId,
        results,
        lastUpdated: new Date().toISOString()
      };
      playerResultsStore.put(playerResultData);

      // Metadata frissítése
      const metadata: Metadata = {
        key: `player_results_${cuescoreId}_last_updated`,
        value: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      metadataStore.put(metadata);

      transaction.oncomplete = () => {
        console.log(`Játékos ${cuescoreId} eredményei sikeresen mentve IndexedDB-be`);
        resolve();
      };

      transaction.onerror = () => {
        console.error('Hiba a játékos eredmények mentésekor:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Játékos eredmények lekérése
  static async getPlayerResults(cuescoreId: number): Promise<PlayerResult[] | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PLAYER_RESULTS], 'readonly');
      const store = transaction.objectStore(STORES.PLAYER_RESULTS);
      const request = store.get(cuescoreId);

      request.onsuccess = () => {
        if (request.result && request.result.results) {
          resolve(request.result.results);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Hiba a játékos eredmények lekérésekor:', request.error);
        reject(request.error);
      };
    });
  }

  // Játékos eredmények frissítésének ellenőrzése
  static async needsPlayerResultsUpdate(cuescoreId: number): Promise<boolean> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.METADATA], 'readonly');
      const store = transaction.objectStore(STORES.METADATA);
      const key = `player_results_${cuescoreId}_last_updated`;
      const request = store.get(key);

      request.onsuccess = () => {
        if (!request.result) {
          resolve(true); // Ha nincs korábbi frissítés, szükséges
          return;
        }

        const lastUpdate = new Date(request.result.value);
        const now = new Date();
        const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        resolve(diffInHours >= 12); // 12 óránként frissítünk
      };

      request.onerror = () => {
        console.error('Hiba a játékos eredmények metadata lekérésekor:', request.error);
        reject(request.error);
      };
    });
  }

  // Cache törlése
  static async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.COMPETITIONS, STORES.PLAYERS, STORES.PLAYER_RESULTS, STORES.METADATA], 'readwrite');
      
      const competitionsStore = transaction.objectStore(STORES.COMPETITIONS);
      const playersStore = transaction.objectStore(STORES.PLAYERS);
      const playerResultsStore = transaction.objectStore(STORES.PLAYER_RESULTS);
      const metadataStore = transaction.objectStore(STORES.METADATA);

      competitionsStore.clear();
      playersStore.clear();
      playerResultsStore.clear();
      metadataStore.clear();

      transaction.oncomplete = () => {
        console.log('IndexedDB cache törölve');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Hiba a cache törlésekor:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Adatbázis méretének lekérése (debug célokra)
  static async getDatabaseSize(): Promise<{ competitions: number; players: number }> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.COMPETITIONS, STORES.PLAYERS], 'readonly');
      
      const competitionsCount = transaction.objectStore(STORES.COMPETITIONS).count();
      const playersCount = transaction.objectStore(STORES.PLAYERS).count();

      let competitions = 0;
      let players = 0;

      competitionsCount.onsuccess = () => {
        competitions = competitionsCount.result;
      };

      playersCount.onsuccess = () => {
        players = playersCount.result;
      };

      transaction.oncomplete = () => {
        resolve({ competitions, players });
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  // Debug információk kiírása a konzolra
  static async logDebugInfo(): Promise<void> {
    try {
      const size = await this.getDatabaseSize();
      const competitionsLastUpdate = await this.getLastUpdateTime('competitions');
      const playersLastUpdate = await this.getLastUpdateTime('players');
      
      console.log('=== IndexedDB Debug Info ===');
      console.log('Versenyek száma:', size.competitions);
      console.log('Játékosok száma:', size.players);
      console.log('Versenyek utolsó frissítése:', competitionsLastUpdate);
      console.log('Játékosok utolsó frissítése:', playersLastUpdate);
      console.log('============================');
    } catch (error) {
      console.error('Debug info lekérése sikertelen:', error);
    }
  }
}

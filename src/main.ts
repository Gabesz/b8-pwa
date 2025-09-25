import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { setupPWA } from './pwa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { router } from './router';
import { IndexedDBService } from './services/indexedDB';
import { ApiService } from './services/api';

setupPWA();

// IndexedDB inicializálása és szinkronizáció ellenőrzése
async function initializeApp() {
  try {
    // IndexedDB inicializálása
    await IndexedDBService.init();
    console.log('IndexedDB sikeresen inicializálva');
    
    // 24 órás szinkronizáció ellenőrzése
    await ApiService.checkAndSyncIfNeeded();
    console.log('Szinkronizáció ellenőrzése befejezve');
    
    // Debug információk kiírása
    await IndexedDBService.logDebugInfo();
    
    // Extra debug: játékosok száma ellenőrzése
    try {
      const { ApiService } = await import('./services/api');
      const playersResponse = await ApiService.getPlayers();
      console.log('Main.ts - Játékosok száma:', playersResponse.data.length);
      const counts = ApiService.getPlayerCountsByLevel(playersResponse.data);
      console.log('Main.ts - Játékosok száma szint szerint:', counts);
    } catch (error) {
      console.error('Main.ts - Játékosok betöltése sikertelen:', error);
    }
  } catch (error) {
    console.error('Alkalmazás inicializálása sikertelen:', error);
  }
  
  // Vue alkalmazás indítása
  createApp(App).use(router).mount('#app');
}

// Alkalmazás indítása
initializeApp();



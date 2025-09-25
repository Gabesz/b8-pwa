// Vite PWA registration helper
import { registerSW } from 'virtual:pwa-register';

export const setupPWA = () => {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('Új verzió elérhető, frissítés szükséges');
    },
    onOfflineReady() {
      console.log('Alkalmazás offline használatra kész');
      // Offline kész állapotban cache-eljük a főoldalt
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_MAIN_PAGE'
        });
      }
    },
    onRegistered(registration) {
      console.log('Service Worker regisztrálva:', registration);
      // Service worker regisztráció után cache-eljük a főoldalt
      if (registration.active) {
        registration.active.postMessage({
          type: 'CACHE_MAIN_PAGE'
        });
      }
    },
    onRegisterError(error) {
      console.error('Service Worker regisztráció hiba:', error);
    }
  });

  // Online/offline állapot kezelése
  window.addEventListener('online', async () => {
    console.log('Online állapot - szinkronizáció indítása');
    // Háttér szinkronizáció indítása
    try {
      const { ApiService } = await import('./services/api');
      await ApiService.syncDataInBackground();
      console.log('Online szinkronizáció befejezve');
    } catch (error) {
      console.error('Online szinkronizáció sikertelen:', error);
    }
  });

  window.addEventListener('offline', () => {
    console.log('Offline állapot - cache használata');
  });

  return updateSW;
};





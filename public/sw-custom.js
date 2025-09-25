// Custom Service Worker logika offline támogatáshoz
const getBasePath = () => {
  // A service worker scope-ból határozzuk meg a base path-et
  const scope = self.registration.scope;
  const basePath = scope.replace(self.location.origin, '');
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
};

// Debug funkció
const logCacheStatus = async () => {
  try {
    const cacheNames = await caches.keys();
    console.log('Elérhető cache-ek:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`Cache "${cacheName}" tartalma:`, keys.map(req => req.url));
    }
  } catch (error) {
    console.error('Cache debug hiba:', error);
  }
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_MAIN_PAGE') {
    // Cache-eljük a főoldalt
    const basePath = getBasePath();
    caches.open('main-page-cache').then(cache => {
      cache.add(basePath + '/').catch(err => console.log('Főoldal cache-elése sikertelen:', err));
    });
  }
});

// Fetch esemény kezelése offline támogatáshoz
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const basePath = getBasePath();
  
  // Ellenőrizzük, hogy a request URL támogatott-e a cache API számára
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:' ||
      url.protocol === 'ms-browser-extension:') {
    // Bővítmény URL-eket nem kezeljük
    return;
  }
  
  // Ha a kérés a főoldalra megy vagy navigációs kérés
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('/') || 
      event.request.url.endsWith('/index.html') ||
      event.request.url.includes('index.html') ||
      // Assets fájlok kezelése (JS, CSS)
      url.pathname.includes('/assets/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    
    event.respondWith(
      caches.match(event.request).then(response => {
        // Ha van cache-ben, használjuk azt
        if (response) {
          console.log('Cache-ből betöltés:', event.request.url);
          return response;
        }
        
        // Ha nincs cache-ben, próbáljuk meg a hálózatról
        return fetch(event.request).then(networkResponse => {
          // Ha a hálózat elérhető, cache-eljük és adjuk vissza
          if (networkResponse.ok && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open('main-page-cache').then(cache => {
              // Biztonságos cache-elés - csak GET kéréseket és támogatott protokollokat
              if (event.request.url.startsWith('http') || event.request.url.startsWith('https')) {
                cache.put(event.request, responseClone).catch(err => {
                  console.log('Cache-elés sikertelen:', event.request.url, err);
                });
              }
            });
          }
          return networkResponse;
        }).catch(() => {
          // Ha a hálózat sem elérhető, próbáljuk meg az index.html-t cache-ből
          console.log('Offline mód - index.html betöltése cache-ből');
          const basePath = getBasePath();
          
          return caches.match(basePath + '/index.html').then(indexResponse => {
            if (indexResponse) {
              console.log('Index.html cache-ből betöltve');
              return indexResponse;
            }
            // Ha nincs index.html sem cache-ben, próbáljuk meg az offline.html-t
            return caches.match(basePath + '/offline.html').then(offlineResponse => {
              if (offlineResponse) {
                console.log('Offline.html cache-ből betöltve');
                return offlineResponse;
              }
              // Ha nincs semmi cache-ben, próbáljuk meg a precache-ből
              console.log('Precache-ből betöltés próbálása');
              return caches.match(event.request).then(precacheResponse => {
                if (precacheResponse) {
                  console.log('Precache-ből betöltve:', event.request.url);
                  return precacheResponse;
                }
                
                // Ha még mindig nincs, adjunk vissza egy egyszerű HTML-t
                console.log('Fallback HTML generálása');
                return new Response(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>Offline - B8 Pool App</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                      .container { max-width: 400px; margin: 0 auto; }
                      .btn { background: rgba(255, 255, 255, 0.2); color: white; padding: 10px 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 25px; cursor: pointer; }
                      .btn:hover { background: rgba(255, 255, 255, 0.3); }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>📱 Offline mód</h1>
                      <p>Az alkalmazás offline módban működik.</p>
                      <button class="btn" onclick="window.location.reload()">Újratöltés</button>
                    </div>
                  </body>
                  </html>
                `, {
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            });
          });
        });
      })
    );
  }
});

// Install esemény - cache-eljük a fontos fájlokat
self.addEventListener('install', (event) => {
  console.log('Service Worker installálás...');
  event.waitUntil(
    caches.open('main-page-cache').then(cache => {
      console.log('Cache megnyitva, fájlok hozzáadása...');
      const basePath = getBasePath();
      
      const filesToCache = [
        basePath + '/',
        basePath + '/index.html',
        basePath + '/offline.html',
        basePath + '/pwa-192x192.png',
        basePath + '/pwa-512x512.png',
        basePath + '/manifest.webmanifest'
      ];
      
      console.log('Cache-elendő fájlok:', filesToCache);
      
      return cache.addAll(filesToCache).then(() => {
        console.log('Fontos fájlok cache-elve');
        // Azonnal aktiváljuk a service worker-t
        return self.skipWaiting();
      }).catch(error => {
        console.log('Néhány fájl cache-elése sikertelen:', error);
        // Még akkor is aktiváljuk, ha néhány fájl nem sikerült
        return self.skipWaiting();
      });
    })
  );
});

// Activate esemény - régi cache-ek törlése
self.addEventListener('activate', (event) => {
  console.log('Service Worker aktiválás...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('Cache-ek:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== 'main-page-cache' && 
              cacheName !== 'players-cache' && 
              cacheName !== 'competitions-cache' &&
              cacheName !== 'images-cache' &&
              cacheName !== 'static-resources-cache') {
            console.log('Régi cache törlése:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker aktiválva, clients claim...');
      // Debug: cache állapot kiírása
      logCacheStatus();
      // Azonnal átvesszük a kontrollt
      return self.clients.claim();
    })
  );
});

<template>
  <div class="homepage-container">
    <!-- 1 soros navigáció - fix gomb + scrollozható gombok -->
    <div 
      class="single-row-navigation"
      :class="{ 'animate-in': showMenu }"
    >
      <!-- Fix gomb balra -->
      <a @click="navigateToPlayersPage" class="menu-item fixed-item">Játékos ranglista</a>
      
      <!-- Scrollozható gombok jobbra -->
      <div 
        class="scrollable-row"
        ref="scrollableRow"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDrag"
        @touchmove="drag"
        @touchend="endDrag"
      >
        <div 
          class="scrollable-content"
          ref="scrollableContent"
          :style="{ transform: `translateX(${scrollOffset}px)` }"
        >
          <a href="https://cuescore.com/" target="_blank" class="menu-item">CueScore.com</a>
          <a href="https://biliard8.hu/" target="_blank" class="menu-item">Biliard8.hu</a>
          <a href="https://poolszakag.hu/group" target="_blank" class="menu-item">CsB</a>
          <a href="https://poolszakag.hu/fixture" target="_blank" class="menu-item">Verseny naptár</a>
          <a href="#" class="menu-item">LIVE stream-ek</a>
          <a href="#" class="menu-item">Eredmények</a>
          <a href="#" class="menu-item">Statisztikák</a>
          <a href="#" class="menu-item">Hírek</a>
        </div>
      </div>
    </div>

    <div 
      class="skill-level-box profi-box"
      :class="{ 'animate-in': showProfi }"
      @click="navigateToPlayers('profi')"
    >
      <div class="box-content">
        <div class="star-icon">
          <i class="fas fa-star"></i>
        </div>
        <div class="box-text">
          <div class="box-title">PROFI</div>
          <div class="box-subtitle">ranglista ({{ profiCount }})</div>
        </div>
      </div>
    </div>

    <div 
      class="skill-level-box felprofi-box"
      :class="{ 'animate-in': showFelprofi }"
      @click="navigateToPlayers('félprofi')"
    >
      <div class="box-content">
        <div class="star-icon">
          <i class="fas fa-star-half-alt"></i>
        </div>
        <div class="box-text">
          <div class="box-title">FÉLPROFI</div>
          <div class="box-subtitle">ranglista ({{ felprofiCount }})</div>
        </div>
      </div>
    </div>

    <div 
      class="skill-level-box amator-box"
      :class="{ 'animate-in': showAmator }"
      @click="navigateToPlayers('amatőr')"
    >
      <div class="box-content">
        <div class="star-icon">
          <i class="far fa-star"></i>
        </div>
        <div class="box-text">
          <div class="box-title">AMATŐR</div>
          <div class="box-subtitle">ranglista ({{ amatorCount }})</div>
        </div>
      </div>
    </div>

    <!-- PWA telepítési gomb -->
    <div v-if="showInstallButton" class="install-prompt">
      <div class="install-content">
        <div class="install-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="install-text">
          <h3>Telepítsd az alkalmazást!</h3>
          <p>Kattints a gombra a telepítéshez</p>
        </div>
        <button 
          @click="installPWA" 
          class="btn btn-primary install-btn"
          :disabled="isInstalling"
        >
          <i class="fas fa-download" :class="{ 'fa-spin': isInstalling }"></i>
          {{ isInstalling ? 'Telepítés...' : 'Telepítés' }}
        </button>
        <button 
          @click="debugPWA" 
          class="btn btn-outline-secondary debug-btn"
          title="Debug PWA állapot"
        >
          <i class="fas fa-bug"></i>
        </button>
        <button 
          @click="dismissInstallPrompt" 
          class="btn btn-link dismiss-btn"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Verzió szám és cache törlés gomb -->
    <div class="version-info">
      <small class="text-muted">v{{ appVersion }}</small>
      <div v-if="isOnline" class="cache-controls">
        <button 
          @click="clearAllCacheAndReload" 
          class="btn btn-sm btn-outline-secondary cache-btn"
          :disabled="isClearingCache"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isClearingCache }"></i>
          {{ isClearingCache ? 'Törlés...' : 'Cache törlés' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService, type Player, OFFLINE_PLAYERS_DATA } from '../services/api'

const router = useRouter()

// Navigációs függvények a kártyákhoz
const navigateToPlayers = (category: string) => {
  router.push({
    path: '/jatekosok',
    query: { category: category }
  })
}

// Navigáció a Játékosok oldalra (kategória nélkül)
const navigateToPlayersPage = () => {
  router.push({
    path: '/jatekosok'
  })
}

// App verzió szám
declare const __APP_VERSION__: string;
const appVersion = ref(__APP_VERSION__);

const showMenu = ref(false)
const showProfi = ref(false)
const showFelprofi = ref(false)
const showAmator = ref(false)

// Online állapot és cache törlés
const isOnline = ref(navigator.onLine)
const isClearingCache = ref(false)

// PWA telepítési állapot
const showInstallButton = ref(false)
const isInstalling = ref(false)
const deferredPrompt = ref<any>(null)

// Játékosok számlálása - 0-ról indulunk, majd frissül a valódi adatokkal
const profiCount = ref(0)
const felprofiCount = ref(0)
const amatorCount = ref(0)

// Drag & drop változók
const scrollOffset = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startScrollOffset = ref(0)
const scrollableRow = ref<HTMLElement>()
const scrollableContent = ref<HTMLElement>()

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  startX.value = clientX
  startScrollOffset.value = scrollOffset.value
  
  // Prevencija a default viselkedés ellen
  e.preventDefault()
}

const drag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const deltaX = clientX - startX.value
  const newOffset = startScrollOffset.value + deltaX
  
  // Számítsuk ki a scrollozható terület szélességét
  if (scrollableRow.value && scrollableContent.value) {
    const containerWidth = scrollableRow.value.offsetWidth
    const contentWidth = scrollableContent.value.scrollWidth
    const maxScroll = Math.max(0, contentWidth - containerWidth)
    
    // Korlátozzuk a scrollozást
    scrollOffset.value = Math.max(-maxScroll, Math.min(0, newOffset))
  }
  
  e.preventDefault()
}

const endDrag = () => {
  isDragging.value = false
}

// Játékosok adatainak lekérése
const loadPlayerData = async () => {
  try {
    console.log('Játékosok betöltése...')
    const playersResponse = await ApiService.getPlayers()
    console.log('Játékosok válasz:', playersResponse)
    console.log('Játékosok száma:', playersResponse.data.length)
    
    const counts = ApiService.getPlayerCountsByLevel(playersResponse.data)
    console.log('Játékosok száma szint szerint:', counts)
    
    profiCount.value = counts.profi
    felprofiCount.value = counts.felprofi
    amatorCount.value = counts.amator
    
    console.log('Frissített számlálók:', { profi: profiCount.value, felprofi: felprofiCount.value, amator: amatorCount.value })
  } catch (error) {
    // Ha hiba van, használjuk az offline adatokat
    console.error('Nem sikerült betölteni a játékos adatokat:', error)
    console.log('Offline adatok használata...')
    
    const counts = ApiService.getPlayerCountsByLevel(OFFLINE_PLAYERS_DATA.data)
    console.log('Offline játékosok száma szint szerint:', counts)
    
    profiCount.value = counts.profi
    felprofiCount.value = counts.felprofi
    amatorCount.value = counts.amator
    
    console.log('Offline számlálók:', { profi: profiCount.value, felprofi: felprofiCount.value, amator: amatorCount.value })
  }
  
  // Animációk indítása azonnal
  startAnimations()
}

// Animációk indítása
const startAnimations = () => {
  // Menü sáv azonnal indul
  setTimeout(() => {
    showMenu.value = true
  }, 100)
  
  // PROFI doboz 175ms után
  setTimeout(() => {
    showProfi.value = true
  }, 175)
  
  // FÉLPROFI doboz 250ms után
  setTimeout(() => {
    showFelprofi.value = true
  }, 250)
  
  // AMATŐR doboz 325ms után
  setTimeout(() => {
    showAmator.value = true
  }, 325)
}

// Cache törlés és újratöltés (debug célokra)
const clearCacheAndReload = async () => {
  try {
    console.log('Cache törlése...')
    await ApiService.clearCache()
    console.log('Cache törölve, újratöltés...')
    await loadPlayerData()
  } catch (error) {
    console.error('Cache törlése sikertelen:', error)
  }
}

// Teljes cache törlés és újratöltés (játékosok és versenyek)
const clearAllCacheAndReload = async () => {
  if (!isOnline.value) {
    alert('Cache törlés csak online állapotban lehetséges!')
    return
  }

  isClearingCache.value = true
  
  try {
    console.log('Teljes cache törlése...')
    
    // IndexedDB cache törlése
    await ApiService.clearCache()
    
    // Játékosok újratöltése
    console.log('Játékosok újratöltése...')
    await loadPlayerData()
    
    // Versenyek újratöltése (ha a versenyek oldalon vagyunk)
    if (window.location.pathname === '/versenyek') {
      console.log('Versenyek újratöltése...')
      // Versenyek oldal újratöltése
      window.location.reload()
    }
    
    console.log('Cache törlés és újratöltés befejezve')
    alert('Cache törölve és adatok újratöltve!')
    
  } catch (error) {
    console.error('Cache törlése sikertelen:', error)
    alert('Hiba történt a cache törlése során!')
  } finally {
    isClearingCache.value = false
  }
}

// PWA telepítési függvények
const installPWA = async () => {
  console.log('PWA telepítés indítása...')
  
  isInstalling.value = true
  
  try {
    // Ha van deferred prompt, használjuk azt
    if (deferredPrompt.value) {
      console.log('Deferred prompt használata')
      // Mutassuk meg a telepítési promptot
      deferredPrompt.value.prompt()
      
      // Várjuk meg a felhasználó válaszát
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA telepítés elfogadva')
        showInstallButton.value = false
      } else {
        console.log('PWA telepítés elutasítva')
      }
      
      // Töröljük a deferred promptot
      deferredPrompt.value = null
    } else {
      // Ha nincs deferred prompt, próbáljuk meg a böngésző specifikus módszereket
      console.log('Nincs deferred prompt - böngésző specifikus telepítés')
      await tryBrowserSpecificInstall()
    }
    
  } catch (error) {
    console.error('PWA telepítés hiba:', error)
    // Ha minden más sikertelen, mutassunk útmutatást
    showManualInstallInstructions()
  } finally {
    isInstalling.value = false
  }
}

// Böngésző specifikus telepítési módszerek
const tryBrowserSpecificInstall = async () => {
  const userAgent = navigator.userAgent.toLowerCase()
  
  // Chrome/Edge
  if (userAgent.includes('chrome') || userAgent.includes('edg')) {
    console.log('Chrome/Edge telepítési módszer')
    // Chrome-ban próbáljuk meg a címsor telepítési gombját aktiválni
    // Ez általában automatikusan megjelenik, ha a PWA telepíthető
    alert('Chrome/Edge: Kérjük, kattintson a címsor jobb oldalán lévő "Telepítés" gombra, vagy használja a menüt (⋮) → "Telepítsd az alkalmazást"')
  }
  // Firefox
  else if (userAgent.includes('firefox')) {
    console.log('Firefox telepítési módszer')
    alert('Firefox: Kérjük, használja a menüt (☰) → "Telepítsd az alkalmazást" vagy kattintson a címsorban lévő telepítés ikonra')
  }
  // Safari
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    console.log('Safari telepítési módszer')
    alert('Safari: Kérjük, kattintson a "Megosztás" gombra, majd válassza a "Hozzáadás a kezdőképernyőhöz" opciót')
  }
  // Mobil böngészők
  else if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    console.log('Mobil böngésző telepítési módszer')
    alert('Mobil: Kérjük, használja a böngésző menüjét a "Telepítsd az alkalmazást" vagy "Hozzáadás a kezdőképernyőhöz" opcióval')
  }
  // Egyéb böngészők
  else {
    console.log('Egyéb böngésző telepítési módszer')
    alert('Kérjük, keresse meg a böngésző menüjében a "Telepítsd az alkalmazást" vagy hasonló opciót')
  }
}

const showManualInstallInstructions = () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  
  let instructions = ''
  
  if (isChrome) {
    instructions = `
🔧 Chrome PWA Telepítési Útmutatás:

Ha nem jelenik meg a telepítési gomb a címsorban:

1. Ellenőrizd a Chrome DevTools-ban:
   - F12 → Application → Manifest
   - Ellenőrizd, hogy betöltődik-e a manifest

2. Chrome címsor telepítési gomb:
   - Nézd meg a címsor jobb oldalán
   - Ha nincs, próbáld: Menü (⋮) → "Telepítsd az alkalmazást"

3. Chrome kritériumok ellenőrzése:
   - HTTPS vagy localhost szükséges
   - Service Worker regisztrálva kell legyen
   - Manifest fájl elérhető kell legyen
   - Ikonok megfelelő méretben

4. Ha még mindig nem működik:
   - Próbáld meg incognito módban
   - Töröld a böngésző cache-t
   - Indítsd újra a Chrome-ot
    `
  } else {
    instructions = `
📱 PWA Telepítési Útmutatás:

Chrome/Edge:
1. Kattints a címsor jobb oldalán lévő "Telepítés" gombra
2. Vagy: Menü (⋮) → "Telepítsd az alkalmazást"

Firefox:
1. Menü (☰) → "Telepítsd az alkalmazást"
2. Vagy: Címsorban lévő telepítés ikon

Safari (iOS):
1. Kattints a "Megosztás" gombra
2. Válaszd a "Hozzáadás a kezdőképernyőhöz" opciót

Android Chrome:
1. Menü (⋮) → "Telepítsd az alkalmazást"
2. Vagy: Címsorban lévő telepítés ikon
    `
  }
  
  alert(instructions)
}

const dismissInstallPrompt = () => {
  showInstallButton.value = false
  // Tároljuk el, hogy a felhasználó elutasította
  localStorage.setItem('pwa-install-dismissed', 'true')
}

const debugPWA = () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  
  const debugInfo = `
🔍 PWA Debug Információ:

Böngésző: ${navigator.userAgent}
URL: ${location.href}
Protokoll: ${location.protocol}
Hostname: ${location.hostname}
Chrome: ${isChrome ? '✅' : '❌'}

PWA Támogatás:
- Service Worker: ${'serviceWorker' in navigator ? '✅' : '❌'}
- HTTPS/Localhost: ${(location.protocol === 'https:' || location.hostname === 'localhost') ? '✅' : '❌'}
- Manifest: ${document.querySelector('link[rel="manifest"]') ? '✅' : '❌'}
- Deferred Prompt: ${deferredPrompt.value ? '✅' : '❌'}

Telepítési Állapot:
- Standalone mód: ${window.matchMedia('(display-mode: standalone)').matches ? '✅' : '❌'}
- iOS Standalone: ${(navigator as any).standalone === true ? '✅' : '❌'}
- Elutasítva: ${localStorage.getItem('pwa-install-dismissed') === 'true' ? '✅' : '❌'}

Gomb Állapot:
- Megjelenítve: ${showInstallButton.value ? '✅' : '❌'}
- Telepítés folyamatban: ${isInstalling.value ? '✅' : '❌'}

Chrome DevTools ellenőrzés:
1. F12 → Application → Manifest
2. F12 → Application → Service Workers
3. F12 → Lighthouse → PWA audit
  `
  
  console.log(debugInfo)
  alert(debugInfo)
}

const checkPWAInstallability = () => {
  console.log('PWA telepítés ellenőrzése...')
  
  // Ellenőrizzük, hogy már telepítve van-e
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true) {
    console.log('PWA már telepítve van')
    return
  }
  
  // Ellenőrizzük, hogy elutasította-e korábban
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed === 'true') {
    console.log('PWA telepítés korábban elutasítva')
    return
  }
  
  // Ellenőrizzük a böngésző támogatását
  console.log('Service Worker támogatás:', 'serviceWorker' in navigator)
  console.log('HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost')
  console.log('Manifest:', document.querySelector('link[rel="manifest"]') !== null)
  
  // Chrome-specifikus ellenőrzések
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  console.log('Chrome böngésző:', isChrome)
  
  // Ellenőrizzük a PWA kritériumokat
  const hasServiceWorker = 'serviceWorker' in navigator
  const hasHTTPS = location.protocol === 'https:' || location.hostname === 'localhost'
  const hasManifest = document.querySelector('link[rel="manifest"]') !== null
  
  console.log('PWA kritériumok:', {
    hasServiceWorker,
    hasHTTPS,
    hasManifest,
    isChrome
  })
  
  // Minden böngésző esetén megjelenítjük a telepítési gombot, ha a PWA telepíthető
  if (hasServiceWorker && hasHTTPS) {
    console.log('PWA telepítés támogatott - gomb megjelenítése')
    showInstallButton.value = true
  } else {
    console.log('PWA telepítés nem támogatott - hiányzó kritériumok')
    // Még mindig megjelenítjük a gombot fejlesztői módban
    if (import.meta.env.DEV) {
      console.log('Fejlesztői mód - gomb megjelenítése')
      showInstallButton.value = true
    }
  }
}

onMounted(() => {
  // Játékos adatok betöltése
  loadPlayerData()
  
  // Online/offline állapot figyelése
  const handleOnline = () => {
    isOnline.value = true
    console.log('Online állapot')
  }
  
  const handleOffline = () => {
    isOnline.value = false
    console.log('Offline állapot')
  }
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // PWA telepítési event listener-ek
  const handleBeforeInstallPrompt = (e: Event) => {
    console.log('PWA telepítési prompt elérhető')
    e.preventDefault()
    deferredPrompt.value = e
    checkPWAInstallability()
  }
  
  const handleAppInstalled = () => {
    console.log('PWA telepítve')
    showInstallButton.value = false
    deferredPrompt.value = null
  }
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // PWA telepítés ellenőrzése
  checkPWAInstallability()
  
  // Fejlesztői módban mindig mutassuk a telepítési gombot
  if (import.meta.env.DEV) {
    console.log('Fejlesztői mód - telepítési gomb megjelenítése')
    showInstallButton.value = true
  }
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })
  
  // Debug: cache törlés gomb hozzáadása a konzolhoz (csak fejlesztéshez)
  if (import.meta.env.DEV) {
    ;(window as any).clearCacheAndReload = clearCacheAndReload
    console.log('Debug: Futtassa a clearCacheAndReload() függvényt a konzolban a cache törléséhez')
  }
})
</script>

<style scoped>
.homepage-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: hidden;
}

.single-row-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.single-row-navigation.animate-in {
  transform: translateX(-20px);
  opacity: 1;
  animation: bounceBack 0.3s ease-out 0.8s forwards;
}

.scrollable-row {
  flex: 1;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.scrollable-row:active {
  cursor: grabbing;
}

.scrollable-content {
  display: flex;
  gap: 12px;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

.menu-item {
  background-color: transparent;
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.menu-item.fixed-item {
  background-color: #bb5175;
  color: white;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.menu-item.fixed-item:hover {
  background-color: #a0445f;
}

.skill-level-box {
  border-radius: 12px;
  padding: 20px;
  min-height: 104px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.6s ease-out 0.2s;
  cursor: pointer;
}

.skill-level-box.animate-in {
  transform: translateX(-20px);
  opacity: 1;
  animation: bounceBack 0.3s ease-out 0.8s forwards;
}


@keyframes bounceBack {
  0% {
    transform: translateX(-20px);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

.box-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.star-icon {
  font-size: 48px;
  color: white;
  min-width: 60px;
  display: flex;
  justify-content: center;
}

.box-text {
  flex: 1;
  color: white;
}

.box-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.box-subtitle {
  font-size: 18px;
  opacity: 0.9;
}


/* Színek a dobozokhoz */
.profi-box {
  background-color: #457974; /* Felső doboz */
}

.felprofi-box {
  background-color: #ccbb25; /* Középső doboz */
}

.amator-box {
  background-color: #bb5175; /* Alsó doboz */
}

.version-info {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
}

.cache-controls {
  margin-top: 8px;
}

.cache-btn {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.cache-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.cache-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* PWA telepítési gomb stílusai */
.install-prompt {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

.install-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.install-icon {
  font-size: 24px;
  color: #bb5175;
  min-width: 40px;
  text-align: center;
}

.install-text {
  flex: 1;
}

.install-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.install-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.install-btn {
  background: #bb5175;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.install-btn:hover {
  background: #a0445f;
  transform: translateY(-1px);
}

.install-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.debug-btn {
  background: none;
  border: 1px solid #6c757d;
  color: #6c757d;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
}

.debug-btn:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-1px);
}

.dismiss-btn {
  background: none;
  border: none;
  color: #999;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobil optimalizáció */
@media (max-width: 768px) {
  .homepage-container {
    padding: 16px;
    gap: 12px;
  }
  
  .single-row-navigation {
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .scrollable-content {
    gap: 8px;
  }
  
  .menu-item {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .skill-level-box {
    padding: 16px;
    min-height: 91px;
  }
  
  .box-title {
    font-size: 20px;
  }
  
  .box-subtitle {
    font-size: 16px;
  }
  
  .star-icon {
    font-size: 40px;
  }
  
  .install-prompt {
    bottom: 70px;
    left: 16px;
    right: 16px;
  }
  
  .install-content {
    padding: 12px;
    gap: 10px;
  }
  
  .install-icon {
    font-size: 20px;
    min-width: 32px;
  }
  
  .install-text h3 {
    font-size: 14px;
  }
  
  .install-text p {
    font-size: 12px;
  }
  
  .install-btn {
    padding: 6px 12px;
    font-size: 12px;
    min-width: 80px;
  }
}
</style>





<template>
  <div class="app-root d-flex flex-column min-vh-100">
    <header class="navbar bg-white border-bottom px-3 py-2">
      <div class="d-flex align-items-center gap-2 flex-grow-1">
        <span class="fw-bold text-primary">Biliard8.hu</span>
        <button
          type="button"
          class="btn btn-link text-secondary p-0 ms-2"
          aria-label="Információ"
          @click="openInfo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469L6.684 9.5c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533z"/>
            <circle cx="8" cy="4.5" r="1"/>
          </svg>
        </button>
      </div>
      
      <!-- Online/Offline status indicator és verzió -->
      <div class="d-flex align-items-center gap-2">
        <div 
          class="status-indicator"
          :class="{ 'online': isOnline, 'offline': !isOnline }"
          :title="isOnline ? 'Online' : 'Offline'"
        >
          <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
        </div>
        <span class="version-text">v{{ version }}</span>
      </div>
    </header>

    <main class="flex-grow-1 container py-3">
      <router-view :key="$route.fullPath" />
    </main>

    <nav class="mobile-nav navbar border-top fixed-bottom" style="background-color: #ebddff;">
      <div class="container d-flex justify-content-between px-2 py-1">
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/">
          <i class="fas fa-home nav-ico"></i>
          <span class="small nav-text">Főoldal</span>
        </RouterLink>
        <a class="btn btn-link d-flex flex-column align-items-center nav-item external-link" href="https://biliard8.hu" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-external-link-alt nav-ico"></i>
          <span class="small nav-text">biliard8.hu</span>
        </a>
        <RouterLink 
          class="btn btn-link d-flex flex-column align-items-center nav-item" 
          :class="{ 'router-link-active': isPlayersActive }"
          to="/jatekosok"
        >
          <i class="fas fa-users nav-ico"></i>
          <span class="small nav-text">Játékosok</span>
        </RouterLink>
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/versenyek">
          <i class="fas fa-calendar-alt nav-ico"></i>
          <span class="small nav-text">Versenyek</span>
        </RouterLink>
      </div>
    </nav>

    <UpdatePrompt />
    <OnlineStatus />
    <OfflineFallback />
    
    <!-- Scroll to top gomb -->
    <button 
      v-if="showScrollToTop"
      @click="scrollToTop"
      class="scroll-to-top-btn"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import UpdatePrompt from './components/UpdatePrompt.vue';
import OnlineStatus from './components/OnlineStatus.vue';
import OfflineFallback from './components/OfflineFallback.vue';
import { RouterLink, useRoute } from 'vue-router';
import { computed, ref, onMounted, onUnmounted } from 'vue';

const route = useRoute();

// Dev mode ellenőrzés
const isDev = import.meta.env.DEV;

// Online/Offline status
const isOnline = ref(navigator.onLine);

// Verzió szám
const version = ref('0.1.79');

// Scroll to top gomb
const showScrollToTop = ref(false)

const scrollToTop = () => {
  // Smooth scroll animáció a tetejére
  document.body.scrollTo({ top: 0, behavior: 'smooth' })
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scroll to top gomb scroll handler
const handleScroll = (event) => {
  // A body elem scroll pozícióját használjuk
  const currentScrollY = document.body.scrollTop || document.documentElement.scrollTop || window.scrollY
  
  // Scroll to top gomb megjelenítése
  showScrollToTop.value = currentScrollY > 300
}

onMounted(() => {
  // Minden lehetséges scroll elemre listener
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('scroll', handleScroll)
  document.documentElement.addEventListener('scroll', handleScroll)
  document.body.addEventListener('scroll', handleScroll)
  
  // Main container scroll
  const mainContainer = document.querySelector('main.container')
  if (mainContainer) {
    mainContainer.addEventListener('scroll', handleScroll)
  }
  
  // Players page scroll
  const playersPage = document.querySelector('.players-page')
  if (playersPage) {
    playersPage.addEventListener('scroll', handleScroll)
  }
  
  // Online/Offline event listeners
  window.addEventListener('online', () => {
    isOnline.value = true;
  });
  
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('online', () => {});
  window.removeEventListener('offline', () => {});
})

// Custom active state for players navigation
const isPlayersActive = computed(() => {
  return route.path === '/jatekosok' || route.path.startsWith('/jatekosok/');
});

function openInfo() {
  alert('Információ hamarosan...');
}

function testClick() {
  console.log('HEADER CLICK TESZT - App.vue működik!')
  
  // Teszt header toggle
  console.log('TESZT HEADER TOGGLE')
  console.log('isHeaderVisible régi értéke:', isHeaderVisible.value)
  isHeaderVisible.value = !isHeaderVisible.value
  console.log('isHeaderVisible új értéke:', isHeaderVisible.value)
  
  // DOM teszt
  const header = document.querySelector('header')
  if (header) {
    console.log('Header elem megtalálva')
    console.log('Header classList:', header.classList.toString())
    if (isHeaderVisible.value) {
      header.classList.remove('header-hidden')
      console.log('header-hidden osztály eltávolítva')
    } else {
      header.classList.add('header-hidden')
      console.log('header-hidden osztály hozzáadva')
    }
    console.log('Header classList utána:', header.classList.toString())
  } else {
    console.log('Header elem nem található')
  }
}

// Scroll event listener hozzáadása
onMounted(() => {
  console.log('App.vue mounted - Scroll event listener hozzáadva')
  
  // Egyszerűbb scroll logika
  const simpleScroll = () => {
    const scrollY = window.scrollY
    console.log('SCROLL Y:', scrollY)
    
    if (scrollY > 100) {
      if (isHeaderVisible.value) {
        console.log('Header elrejtése - scroll Y > 100')
        isHeaderVisible.value = false
      }
    } else {
      if (!isHeaderVisible.value) {
        console.log('Header megjelenítése - scroll Y < 100')
        isHeaderVisible.value = true
      }
    }
  }
  
  // Különböző scroll event listener-ek
  window.addEventListener('scroll', simpleScroll)
  document.addEventListener('scroll', simpleScroll)
  
  // Tesztelés - egyszerű scroll esemény
  const testScroll = () => {
    console.log('TESZT SCROLL EVENT FUT!')
  }
  
  window.addEventListener('scroll', testScroll)
  document.addEventListener('scroll', testScroll)
  
  // Players list scroll esemény
  const playersListScroll = () => {
    console.log('PLAYERS LIST SCROLL EVENT FUT!')
    
    // Header viselkedés a players list scroll-ra
    const playersList = document.querySelector('.players-list')
    if (playersList) {
      const scrollTop = playersList.scrollTop
      console.log('Players list scroll top:', scrollTop)
      
      // Egyszerű teszt - minden scroll eseménynél váltogatjuk
      console.log('Scroll esemény - header toggle')
      isHeaderVisible.value = !isHeaderVisible.value
      console.log('isHeaderVisible új értéke:', isHeaderVisible.value)
      
      // DOM teszt is
      const header = document.querySelector('header')
      if (header) {
        if (isHeaderVisible.value) {
          header.classList.remove('header-hidden')
          console.log('header-hidden osztály eltávolítva')
        } else {
          header.classList.add('header-hidden')
          console.log('header-hidden osztály hozzáadva')
        }
      }
    }
  }
  
  // Egyszerűbb scroll logika - minden scroll eseménynél
  const simpleScrollTest = () => {
    console.log('EGYSZERŰ SCROLL TESZT FUT!')
    isHeaderVisible.value = !isHeaderVisible.value
    console.log('isHeaderVisible új értéke:', isHeaderVisible.value)
    
    const header = document.querySelector('header')
    if (header) {
      if (isHeaderVisible.value) {
        header.classList.remove('header-hidden')
        console.log('header-hidden osztály eltávolítva')
      } else {
        header.classList.add('header-hidden')
        console.log('header-hidden osztály hozzáadva')
      }
    }
  }
  
  // Egyszerű teszt - header click-re váltogatás
  const testHeaderToggle = () => {
    console.log('TESZT HEADER TOGGLE')
    isHeaderVisible.value = !isHeaderVisible.value
    console.log('isHeaderVisible új értéke:', isHeaderVisible.value)
  }
  
})

</script>

<style scoped>
.app-root { background: transparent; }
.mobile-nav { height: 48px; }
main.container { padding-bottom: 64px; }
.nav-item { 
  color: #000000; 
  text-decoration: none !important;
}
.nav-item.router-link-active, .nav-item:hover { 
  color: #bb5175; 
  text-decoration: none !important;
}
.nav-item.external-link.router-link-active { 
  color: #000000 !important; 
}
.nav-ico { 
  font-size: 17px; 
  margin-bottom: 1px; 
}

.nav-text {
  font-size: 11px;
  line-height: 1.2;
}

/* Scroll to top gomb */
.scroll-to-top-btn {
  position: fixed !important;
  bottom: 60px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: #bb5175 !important;
  color: white !important;
  border: none !important;
  cursor: pointer !important;
  z-index: 9999 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.scroll-to-top-btn:hover {
  background: #a0445f;
  transform: translateX(-50%) scale(1.1);
}

.scroll-to-top-btn i {
  font-size: 16px;
}

/* Header statikus */
header {
  position: static;
}

/* Tartalom margin eltávolítva - header statikus */
main.container {
  margin-top: 0;
}

/* Online/Offline status indicator */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background: #28a745;
  color: white;
}

.status-indicator.offline {
  background: #dc3545;
  color: white;
}

.status-indicator i {
  font-size: 14px;
}

.version-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
}

</style>



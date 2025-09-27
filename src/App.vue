<template>
  <div class="app-root d-flex flex-column min-vh-100">
    <header class="navbar bg-white border-bottom sticky-top px-3 py-2">
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
    </header>

    <main class="flex-grow-1 container py-3">
      <router-view />
    </main>

    <nav class="mobile-nav navbar border-top fixed-bottom" style="background-color: #ebddff;">
      <div class="container d-flex justify-content-between px-3 py-1">
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/">
          <i class="fas fa-home nav-ico"></i>
          <span class="small">Főoldal</span>
        </RouterLink>
        <a class="btn btn-link d-flex flex-column align-items-center nav-item external-link" href="https://biliard8.hu" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-external-link-alt nav-ico"></i>
          <span class="small">biliard8.hu</span>
        </a>
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/jatekosok">
          <i class="fas fa-users nav-ico"></i>
          <span class="small">Játékosok</span>
        </RouterLink>
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/versenyek">
          <i class="fas fa-calendar-alt nav-ico"></i>
          <span class="small">Versenyek</span>
        </RouterLink>
      </div>
    </nav>

    <UpdatePrompt />
    <OnlineStatus />
    <OfflineFallback />
  </div>
</template>

<script setup lang="ts">
import UpdatePrompt from './components/UpdatePrompt.vue';
import OnlineStatus from './components/OnlineStatus.vue';
import OfflineFallback from './components/OfflineFallback.vue';
import { RouterLink } from 'vue-router';

// Dev mode ellenőrzés
const isDev = import.meta.env.DEV;

function openInfo() {
  alert('Információ hamarosan...');
}
</script>

<style scoped>
.app-root { background: transparent; }
.mobile-nav { height: 56px; }
main.container { padding-bottom: 72px; }
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
  font-size: 20px; 
  margin-bottom: 2px; 
}
</style>



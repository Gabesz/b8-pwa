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

    <nav class="mobile-nav navbar bg-white border-top fixed-bottom">
      <div class="container d-flex justify-content-between px-3 py-1">
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/">
          <svg class="nav-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="m8 .5 6 5V15H2V5.5z"/><path d="M7 1h2v3H7z"/></svg>
          <span class="small">Főoldal</span>
        </RouterLink>
        <a class="btn btn-link d-flex flex-column align-items-center nav-item" href="https://biliard8.hu" target="_blank" rel="noopener noreferrer">
          <svg class="nav-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0V5.414L6.707 11.707a1 1 0 0 1-1.414-1.414L11.586 4H7a1 1 0 0 1-1-1"/><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-1 0v2.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5H7a.5.5 0 0 0 0-1z"/></svg>
          <span class="small">biliard8.hu</span>
        </a>
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/jatekosok">
          <svg class="nav-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1z"/><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/></svg>
          <span class="small">Játékosok</span>
        </RouterLink>
        <RouterLink class="btn btn-link d-flex flex-column align-items-center nav-item" to="/versenyek">
          <svg class="nav-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v2H3z"/><path d="M2 2h2v3a3 3 0 1 1-2-3m12 0a3 3 0 1 1-2 3V2z"/><path d="M4 15v-2h8v2z"/></svg>
          <span class="small">Versenyek</span>
        </RouterLink>
      </div>
    </nav>

    <UpdatePrompt />
  </div>
</template>

<script setup lang="ts">
import UpdatePrompt from './components/UpdatePrompt.vue';
import { RouterLink } from 'vue-router';

function openInfo() {
  alert('Információ hamarosan...');
}
</script>

<style scoped>
.app-root { background: transparent; }
.mobile-nav { height: 56px; }
main.container { padding-bottom: 72px; }
.nav-item { color: #6b7280; }
.nav-item.router-link-active, .nav-item:hover { color: #0ea5e9; }
.nav-ico { width: 22px; height: 22px; margin-bottom: 2px; }
</style>



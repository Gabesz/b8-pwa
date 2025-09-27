<template>
  <div class="players-page">

    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Betöltés...</span>
      </div>
      <p class="mt-2 text-muted">Játékosok betöltése...</p>
    </div>

    <div v-else-if="players.length > 0" class="players-container">
      <div class="filter-section mb-2">
        <!-- Szűrő gombok új elrendezéssel -->
        <div class="filter-buttons" v-show="!showSearchInput">
          <div class="filter-row">
            <!-- Kereső gomb - első helyen -->
            <button 
              @click="toggleSearch"
              class="filter-btn search-toggle-btn"
            >
              <div class="filter-btn-content">
                <div class="filter-btn-title">
                  <i class="fas fa-search"></i>
                </div>
                <div class="filter-btn-count">Keresés</div>
              </div>
            </button>
            
            <button 
              v-for="level in levels" 
              :key="level.value"
              @click="toggleLevel(level.value)"
              :class="['filter-btn', isLevelSelected(level.value) ? 'active' : '']"
              :data-level="level.value"
            >
              <div class="filter-btn-content">
                <div class="filter-btn-title">
                  <i v-if="isLevelSelected(level.value)" class="fas fa-check filter-check-icon"></i>
                  {{ level.label }}
                </div>
                <div class="filter-btn-count">{{ getPlayerCountByLevel(level.value) }}</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Kereső mező -->
        <div class="search-container" v-show="showSearchInput">
          <div class="search-input-wrapper">
            <div class="input-group input-group-lg">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input 
                v-model="searchQuery"
                type="text" 
                class="form-control form-control-lg" 
                placeholder="Játékos keresése..."
                @input="onSearchInput"
                @blur="updateURL"
                ref="searchInput"
              >
              <button 
                @click="toggleSearch"
                class="btn btn-outline-secondary btn-lg"
                type="button"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimum kiválasztás hibaüzenet -->
      <div v-if="showMinSelectionError" class="min-selection-error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Legalább egy játékos szint kiválasztása kötelező</span>
      </div>

      <div class="players-list">
        <RouterLink 
          v-for="(player, index) in displayPlayers" 
          :key="player.uNum"
          :to="`/jatekosok/${player.cuescoreId}`"
          class="player-card"
          :class="{ 'animate-in': animatedCards[index] }"
        >
          <div class="player-rank">#{{ player.uNum }}</div>
          <div class="player-info">
        <div class="player-header">
          <div class="player-name-section">
            <div class="player-name-row">
              <div class="player-name">{{ player.uName }}</div>
              <span class="player-level" :class="'level-' + player.level.toLowerCase()">
                {{ player.level }}
              </span>
            </div>
            <div class="player-comps">{{ player.comps }} verseny</div>
          </div>
          <div class="player-score">{{ player.score }} pont</div>
        </div>
          </div>
        </RouterLink>
        
        <!-- Loading indicator és trigger -->
        <div 
          v-if="isLoadingMore" 
          class="loading-more"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Töltés...</span>
          </div>
          <p class="mt-2 text-muted">Játékosok betöltése...</p>
        </div>
        
        <!-- Intersection Observer trigger -->
        <div 
          v-if="hasMorePlayers && !isLoadingMore"
          ref="loadMoreTrigger"
          class="load-more-trigger"
        >
          <!-- Láthatatlan trigger elem -->
        </div>
        
        <!-- Nincs több játékos üzenet -->
      </div>
    </div>

    <div v-else class="no-data">
      <div class="offline-message">
        <i class="fas fa-wifi-slash offline-icon"></i>
        <h3>Internet szükséges</h3>
        <p>A játékosok listájának megtekintéséhez internetkapcsolat szükséges.</p>
        <p class="text-muted">Ellenőrizze a hálózati kapcsolatát és próbálja újra.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { ApiService, type Player, type PlayersResponse } from '../services/api';

const route = useRoute();
const router = useRouter();

const players = ref<Player[]>([]);
const loading = ref(true);
const selectedLevels = ref(['profi', 'félprofi', 'amatőr']); // Alapértelmezetten minden szint kiválasztva
const searchQuery = ref('');
const showSearchInput = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const animatedCards = ref<boolean[]>([]);

// URL frissítés csak keresés bezárásakor

// Infinity scroll változók
const visiblePlayers = ref<Player[]>([]);
const currentChunkIndex = ref(0);
const chunkSize = ref(20); // Hány kártyát töltünk be egyszerre
const isLoadingMore = ref(false);
const hasMorePlayers = ref(true);
const observer = ref<IntersectionObserver | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const levels = [
  { value: 'profi', label: 'Profi' },
  { value: 'félprofi', label: 'Félprofi' },
  { value: 'amatőr', label: 'Amatőr' }
];


const filteredPlayers = computed(() => {
  let filtered = players.value;
  
  // Ha keresés van, akkor a teljes játékos listában keres
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(player => 
      player.uName.toLowerCase().includes(query)
    );
    return filtered; // Keresés esetén nem alkalmazunk szint szerinti szűrést
  }
  
  // Szint szerinti szűrés - csak a kiválasztott szintek
  filtered = filtered.filter(player => {
    const level = player.level.toLowerCase();
    return selectedLevels.value.some(selectedLevel => {
      return level === selectedLevel || 
             (selectedLevel === 'félprofi' && (level === 'félprofi' || level === 'felprofi')) ||
             (selectedLevel === 'amatőr' && (level === 'amatőr' || level === 'amator'));
    });
  });
  
  return filtered;
});

// A jelenleg látható játékosok (infinity scroll)
const displayPlayers = computed(() => {
  return visiblePlayers.value;
});

const getPlayerCountByLevel = (level: string): number => {
  const filtered = players.value.filter(player => {
    const playerLevel = player.level.toLowerCase();
    return playerLevel === level || 
           (level === 'félprofi' && (playerLevel === 'félprofi' || playerLevel === 'felprofi')) ||
           (level === 'amatőr' && (playerLevel === 'amatőr' || playerLevel === 'amator'));
  });
  
  return filtered.length;
};

const showMinSelectionError = ref(false);

const toggleLevel = (level: string) => {
  const index = selectedLevels.value.indexOf(level);
  
  if (index > -1) {
    // Ha már kiválasztva, ellenőrizzük hogy nem az utolsó-e
    if (selectedLevels.value.length === 1) {
      // Ha ez az utolsó kiválasztott szint, akkor hibaüzenet
      showMinSelectionError.value = true;
      setTimeout(() => {
        showMinSelectionError.value = false;
      }, 3000); // 3 másodperc után eltűnik
      return;
    } else {
      // Ha nem az utolsó, akkor eltávolíthatjuk
      selectedLevels.value.splice(index, 1);
    }
  } else {
    // Ha nincs kiválasztva, hozzáadjuk
    selectedLevels.value.push(level);
    // Ha sikeresen hozzáadtuk, eltüntetjük a hibaüzenetet
    showMinSelectionError.value = false;
  }
  
  // URL frissítése
  updateURL();
  
  // Újra betöltés
  performSearch();
};

const updateURL = () => {
  const query: any = {};
  
  // Ha nem minden szint van kiválasztva, akkor query paraméterek
  if (selectedLevels.value.length !== 3 || !selectedLevels.value.includes('profi') || !selectedLevels.value.includes('félprofi') || !selectedLevels.value.includes('amatőr')) {
    query.levels = selectedLevels.value.join(',');
  }
  
  // Ha keresés van
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim();
  }
  
  // URL frissítése
  router.replace({ query });
};

const isLevelSelected = (level: string): boolean => {
  return selectedLevels.value.includes(level);
};

const onSearchInput = () => {
  // Keresés végrehajtása azonnal - nincs URL frissítés
  performSearch();
};

const performSearch = () => {
  // Teljes újratöltés keresésnél - nincs URL frissítés
  currentChunkIndex.value = 0;
  visiblePlayers.value = [];
  hasMorePlayers.value = true;
  animatedCards.value = [];
  
  // Újra betöltés
  nextTick(() => {
    loadNextChunk();
    setupIntersectionObserver();
  });
};

const toggleSearch = () => {
  showSearchInput.value = !showSearchInput.value;
  
  if (showSearchInput.value) {
    // Kereső mező megjelenítése és fókusza
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    });
  } else {
    // Keresés törlése és visszaállítás teljes listára
    searchQuery.value = '';
    selectedLevels.value = ['profi', 'félprofi', 'amatőr']; // Visszaállítás minden szintre
    
    // URL frissítése és végrehajtás
    updateURL();
    performSearch();
  }
};

const loadPlayers = async () => {
  try {
    loading.value = true;
    const response: PlayersResponse = await ApiService.getPlayers();
    players.value = response.data;
    
    // Reset infinity scroll állapot
    currentChunkIndex.value = 0;
    visiblePlayers.value = [];
    hasMorePlayers.value = true;
    
    // Első chunk betöltése
    loadNextChunk();
  } catch (error) {
    console.error('Hiba a játékosok betöltésekor:', error);
  } finally {
    loading.value = false;
  }
};

// Következő chunk betöltése
const loadNextChunk = () => {
  console.log('loadNextChunk called:', {
    isLoadingMore: isLoadingMore.value,
    hasMorePlayers: hasMorePlayers.value,
    currentChunkIndex: currentChunkIndex.value,
    visibleCount: visiblePlayers.value.length,
    totalFiltered: filteredPlayers.value.length
  });
  
  if (isLoadingMore.value || !hasMorePlayers.value) {
    console.log('loadNextChunk blocked:', { isLoadingMore: isLoadingMore.value, hasMorePlayers: hasMorePlayers.value });
    return;
  }
  
  isLoadingMore.value = true;
  
  const startIndex = currentChunkIndex.value * chunkSize.value;
  const endIndex = startIndex + chunkSize.value;
  const nextChunk = filteredPlayers.value.slice(startIndex, endIndex);
  
  console.log('Loading chunk:', { startIndex, endIndex, chunkSize: chunkSize.value, nextChunkLength: nextChunk.length });
  
  if (nextChunk.length === 0) {
    console.log('No more chunks available');
    hasMorePlayers.value = false;
    isLoadingMore.value = false;
    return;
  }
  
  // Animáció késleltetéssel hozzáadása
  setTimeout(() => {
    // Ha ez az első chunk és vannak már kártyák, akkor töröljük őket
    if (currentChunkIndex.value === 0 && visiblePlayers.value.length > 0) {
      visiblePlayers.value = [];
      animatedCards.value = [];
    }
    
    const currentLength = visiblePlayers.value.length;
    visiblePlayers.value.push(...nextChunk);
    
    console.log('Chunk added:', { newVisibleCount: visiblePlayers.value.length });
    
    // Minden új kártya animálása
    nextChunk.forEach((_, index) => {
      setTimeout(() => {
        const cardIndex = currentLength + index;
        // Bővítjük az animatedCards tömböt ha szükséges
        while (animatedCards.value.length <= cardIndex) {
          animatedCards.value.push(false);
        }
        nextTick(() => {
          animatedCards.value[cardIndex] = true;
        });
      }, (index + 1) * 75); // 75ms késleltetés kártyánként
    });
    
    currentChunkIndex.value++;
    isLoadingMore.value = false;
    
    // Observer újra beállítása az új trigger elemhez
    nextTick(() => {
      setupIntersectionObserver();
    });
  }, 100);
};

// Intersection Observer beállítása
const setupIntersectionObserver = () => {
  // Előző observer törlése
  if (observer.value) {
    observer.value.disconnect();
  }
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        console.log('Intersection Observer triggered:', {
          isIntersecting: entry.isIntersecting,
          hasMorePlayers: hasMorePlayers.value,
          isLoadingMore: isLoadingMore.value,
          visibleCount: visiblePlayers.value.length,
          totalFiltered: filteredPlayers.value.length
        });
        
        if (entry.isIntersecting && hasMorePlayers.value && !isLoadingMore.value) {
          console.log('Loading next chunk from observer');
          loadNextChunk();
        }
      });
    },
    {
      root: null,
      rootMargin: '300px', // 300px-el korábban trigger - nagyobb margin
      threshold: 0.1
    }
  );
  
  // Observer beállítása a trigger elemre
  nextTick(() => {
    if (loadMoreTrigger.value && observer.value) {
      console.log('Setting up observer for trigger element');
      observer.value.observe(loadMoreTrigger.value);
    } else {
      console.log('No trigger element found or no observer');
    }
  });
};


// Ez a watch már nincs szükséges, mivel a loadStateFromURL kezeli

// Szűrt játékosok változására újratöltés - csak szűrő gomboknál
watch(selectedLevels, () => {
  if (filteredPlayers.value.length > 0) {
    // Reset infinity scroll állapot
    currentChunkIndex.value = 0;
    visiblePlayers.value = [];
    hasMorePlayers.value = true;
    animatedCards.value = [];
    
    // Első chunk betöltése
    nextTick(() => {
      loadNextChunk();
      setupIntersectionObserver();
    });
  }
}, { immediate: true });

// Observer újra beállítása amikor új trigger elem jelenik meg
watch(hasMorePlayers, (newValue) => {
  if (newValue) {
    nextTick(() => {
      setupIntersectionObserver();
    });
  }
});

onMounted(() => {
  loadPlayers();
  
  // URL-ből beállítások betöltése
  loadStateFromURL();
});

// Route változás figyelése
watch(() => route.query, () => {
  loadStateFromURL();
}, { deep: true });

const loadStateFromURL = () => {
  // Szintek betöltése
  if (route.query.levels && typeof route.query.levels === 'string') {
    const levels = route.query.levels.split(',');
    selectedLevels.value = levels.filter(level => ['profi', 'félprofi', 'amatőr'].includes(level));
  } else if (route.query.category && typeof route.query.category === 'string') {
    // Visszafelé kompatibilitás a főoldali hivatkozásokhoz
    const category = route.query.category;
    if (['profi', 'félprofi', 'amatőr'].includes(category)) {
      selectedLevels.value = [category];
    }
  }
  
  // Keresés betöltése
  if (route.query.search && typeof route.query.search === 'string') {
    searchQuery.value = route.query.search;
    showSearchInput.value = true;
  }
};

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

</script>

<style scoped>
.players-page {
  padding: 0;
  /* Finom scrollbar elrejtés */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

/* Webkit scrollbar finom elrejtése */
.players-page::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}


.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.filter-section {
  display: flex;
  justify-content: center;
  padding: 16px 16px 0 16px; /* 16px top padding (20px helyett - 20% csökkentés) */
}

.btn-group .btn {
  font-size: 14px;
  padding: 8px 16px;
}

.players-list {
  display: flex;
  flex-direction: column;
  padding: 0 16px 80px 16px; /* 80px bottom padding a lábléc miatt */
}

.player-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(15px);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              opacity 0.2s ease-out;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.player-card.animate-in {
  transform: translateX(0);
  opacity: 1;
}

.player-card:hover {
  background: rgba(255, 255, 255, 1);
  /* transform és box-shadow eltávolítva - nincs mozgás hover-re */
}


.player-rank {
  font-size: 18px;
  font-weight: bold;
  color: #bb5175;
  min-width: 40px;
}

.player-info {
  flex: 1;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  min-height: 60px; /* Nagyobb magasság a vertikális középre igazításhoz */
}

.player-name-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.player-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.player-details {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.player-comps {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.player-score {
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60px; /* Ugyanaz a magasság mint a header-nek */
}

.player-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.level-profi {
  background: rgba(69, 121, 116, 0.2);
  color: #457974;
  border: 1px solid rgba(69, 121, 116, 0.3);
}

.level-félprofi, .level-felprofi {
  background: rgba(204, 187, 37, 0.2);
  color: #ccbb25;
  border: 1px solid rgba(204, 187, 37, 0.3);
}

.level-amatőr, .level-amator {
  background: rgba(187, 81, 117, 0.2);
  color: #bb5175;
  border: 1px solid rgba(187, 81, 117, 0.3);
}

.no-data {
  text-align: center;
  padding: 40px 20px;
}

.offline-message {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.offline-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 20px;
}

.offline-message h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.offline-message p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

/* Kereső stílusok */
.search-container {
  margin-bottom: 20px;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.form-control {
  border-color: #dee2e6;
  border-radius: 0 8px 8px 0;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Szűrő gombok új stílusa */
.filter-buttons {
  margin-bottom: 16px; /* 20px helyett - 20% csökkentés */
  width: 100%; /* Olyan széles mint a játékos kártyák */
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 100%; /* Olyan széles mint a kártyák */
}

.filter-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  text-align: center;
  flex: 1; /* Kitölti a rendelkezésre álló helyet */
}

.filter-btn:hover {
  border-color: rgba(0, 123, 255, 0.3);
  background: rgba(0, 123, 255, 0.05);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: #457974; /* Profi szín alapértelmezésben */
  border-color: #457974;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(69, 121, 116, 0.3);
}

.filter-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.filter-btn-title {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn-count {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.filter-check-icon {
  font-size: 12px;
  color: inherit;
}

.search-toggle-btn {
  background: rgba(255, 193, 7, 0.3) !important;
  border-color: rgba(255, 193, 7, 0.5) !important;
  color: #000000 !important;
}

.search-toggle-btn:hover {
  background: rgba(255, 193, 7, 0.4) !important;
  border-color: rgba(255, 193, 7, 0.7) !important;
  transform: translateY(-2px);
}

.search-toggle-btn i {
  font-size: 16px;
}

.min-selection-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 16px 16px 16px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.min-selection-error i {
  font-size: 16px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Szűrő gombok specifikus színei */
.filter-btn.active[data-level="profi"] {
  background: #457974;
  border-color: #457974;
  box-shadow: 0 4px 12px rgba(69, 121, 116, 0.3);
}

.filter-btn.active[data-level="félprofi"] {
  background: #ccbb25;
  border-color: #ccbb25;
  box-shadow: 0 4px 12px rgba(204, 187, 37, 0.3);
}

.filter-btn.active[data-level="amatőr"] {
  background: #bb5175;
  border-color: #bb5175;
  box-shadow: 0 4px 12px rgba(187, 81, 117, 0.3);
}

.search-input-wrapper {
  display: flex;
  justify-content: center;
  max-width: 500px; /* Szélesebb desktopon */
  margin: 0 auto;
}

.input-group .btn {
  border-radius: 0 8px 8px 0;
}

/* Infinity scroll elemek */
.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 20px 0;
}

.load-more-trigger {
  height: 20px;
  width: 100%;
  /* Láthatatlan trigger elem - de kell a magasság az intersection observer számára */
}



/* Mobil optimalizáció */
@media (max-width: 768px) {
  .btn-group .btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .player-card {
    padding: 12px;
    gap: 12px;
  }
  
  .filter-row {
    gap: 8px; /* Kisebb gap mobilon hogy elférjen a 4 elem */
  }
  
  .filter-btn {
    padding: 8px 12px; /* Kisebb padding mobilon */
    min-width: 80px; /* Kisebb minimum szélesség */
    flex: none; /* Mobilon ne töltse ki a teljes helyet */
  }
  
  .search-input-wrapper {
    max-width: 350px; /* Kisebb szélesség mobilon */
  }
  
  .player-rank {
    font-size: 16px;
    min-width: 35px;
  }
  
  .player-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-height: auto;
  }
  
  .player-name {
    font-size: 15px;
  }
  
  .player-score {
    font-size: 14px;
    height: auto;
    min-height: auto;
    justify-content: flex-start;
  }
  
  .player-details {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .player-comps {
    font-size: 12px;
  }
}
</style>

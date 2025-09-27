<template>
  <div>
    <div v-if="displayCompetitions.length > 0" class="competitions-list">
      <div 
        v-for="(competition, index) in displayCompetitions" 
        :key="competition.event_date + competition.name"
        class="competition-card"
        :class="{ 'animate-in': animatedCards[index] }"
        @click="expandedIndex !== index ? toggleDetails(index) : null"
      >
        <div class="competition-date">
          {{ formatDate(competition.event_date) }}
        </div>
        <div class="competition-divider"></div>
        <div class="competition-details">
          <div class="competition-type">{{ competition.type }}</div>
          <div class="competition-name">{{ competition.name }}</div>
          <div class="competition-location" v-if="competition.place">
            {{ competition.place }}
          </div>
          <a 
            v-if="expandedIndex === index" 
            :href="competition.link" 
            target="_blank"
            class="details-link"
            @click.stop
          >
            Részletek/nevezés
          </a>
        </div>
        <div class="competition-chevron" @click.stop="toggleDetails(index)">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
            <path v-if="expandedIndex === index" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            <path v-else d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div 
        v-if="isLoadingMore" 
        class="loading-more"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Töltés...</span>
        </div>
        <p class="mt-2 text-muted">Versenyek betöltése...</p>
      </div>
      
      <!-- Intersection Observer trigger -->
      <div 
        v-if="hasMoreCompetitions && !isLoadingMore"
        ref="loadMoreTrigger"
        class="load-more-trigger"
      >
        <!-- Láthatatlan trigger elem -->
      </div>
      
      <!-- Nincs több verseny üzenet -->
      <div 
        v-if="!hasMoreCompetitions && displayCompetitions.length > 0"
        class="no-more-competitions"
      >
        <p class="text-muted">Minden verseny betöltve ({{ displayCompetitions.length }}/{{ filteredCompetitions.length }})</p>
      </div>
    </div>
    
    <div v-else-if="filteredCompetitions.length === 0" class="text-center text-white">
      <p>Nincsenek elérhető versenyek.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { ApiService, type Competition } from '../services/api';

const competitions = ref<Competition[]>([]);
const expandedIndex = ref(0); // Első elem alapból nyitva
const animatedCards = ref<boolean[]>([]);

// Infinity scroll változók
const visibleCompetitions = ref<Competition[]>([]);
const currentChunkIndex = ref(0);
const chunkSize = ref(15); // Hány versenyt töltünk be egyszerre
const isLoadingMore = ref(false);
const hasMoreCompetitions = ref(true);
const observer = ref<IntersectionObserver | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

function formatDate(dateStr: string): string {
  // Convert from 2025.09.13 to 2025. 09. 13.
  const [year, month, day] = dateStr.split('.');
  return `${year}. ${month}. ${day}.`;
}

// Ideiglenesen minden versenyt mutatunk (dátum szűrés nélkül)
const filteredCompetitions = computed(() => {
  console.log('Versenyek szűrése...');
  console.log('Összes verseny:', competitions.value.length);
  
  // Ideiglenesen minden versenyt mutatunk
  const filtered = competitions.value;
  
  console.log('Szűrt versenyek:', filtered.length);
  return filtered;
});

// A jelenleg látható versenyek (infinity scroll)
const displayCompetitions = computed(() => {
  return visibleCompetitions.value;
});

function toggleDetails(index: number): void {
  if (expandedIndex.value === index) {
    expandedIndex.value = -1; // Bezárás
  } else {
    expandedIndex.value = index; // Megnyitás
  }
}

// Következő chunk betöltése
const loadNextChunk = () => {
  console.log('loadNextChunk called (tournaments):', {
    isLoadingMore: isLoadingMore.value,
    hasMoreCompetitions: hasMoreCompetitions.value,
    currentChunkIndex: currentChunkIndex.value,
    visibleCount: visibleCompetitions.value.length,
    totalFiltered: filteredCompetitions.value.length
  });
  
  if (isLoadingMore.value || !hasMoreCompetitions.value) {
    console.log('loadNextChunk blocked (tournaments):', { isLoadingMore: isLoadingMore.value, hasMoreCompetitions: hasMoreCompetitions.value });
    return;
  }
  
  isLoadingMore.value = true;
  
  const startIndex = currentChunkIndex.value * chunkSize.value;
  const endIndex = startIndex + chunkSize.value;
  const nextChunk = filteredCompetitions.value.slice(startIndex, endIndex);
  
  console.log('Loading chunk (tournaments):', { startIndex, endIndex, chunkSize: chunkSize.value, nextChunkLength: nextChunk.length });
  
  if (nextChunk.length === 0) {
    console.log('No more chunks available (tournaments)');
    hasMoreCompetitions.value = false;
    isLoadingMore.value = false;
    return;
  }
  
  // Animáció késleltetéssel hozzáadása
  setTimeout(() => {
    const currentLength = visibleCompetitions.value.length;
    visibleCompetitions.value.push(...nextChunk);
    
    console.log('Chunk added (tournaments):', { newVisibleCount: visibleCompetitions.value.length });
    
  // Animáció beállítása az új kártyákhoz
  nextChunk.forEach((_, index) => {
    setTimeout(() => {
      const cardIndex = currentLength + index;
      // Bővítjük az animatedCards tömböt ha szükséges
      while (animatedCards.value.length <= cardIndex) {
        animatedCards.value.push(false);
      }
      animatedCards.value[cardIndex] = true;
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
        console.log('Intersection Observer triggered (tournaments):', {
          isIntersecting: entry.isIntersecting,
          hasMoreCompetitions: hasMoreCompetitions.value,
          isLoadingMore: isLoadingMore.value,
          visibleCount: visibleCompetitions.value.length,
          totalFiltered: filteredCompetitions.value.length
        });
        
        if (entry.isIntersecting && hasMoreCompetitions.value && !isLoadingMore.value) {
          console.log('Loading next chunk from observer (tournaments)');
          loadNextChunk();
        }
      });
    },
    {
      root: null,
      rootMargin: '300px', // 300px-el korábban trigger
      threshold: 0.1
    }
  );
  
  // Observer beállítása a trigger elemre
  nextTick(() => {
    if (loadMoreTrigger.value && observer.value) {
      console.log('Setting up observer for trigger element (tournaments)');
      observer.value.observe(loadMoreTrigger.value);
    } else {
      console.log('No trigger element found or no observer (tournaments)');
    }
  });
};

// Szűrt versenyek változására újratöltés
watch(filteredCompetitions, () => {
  if (filteredCompetitions.value.length > 0) {
    // Reset infinity scroll állapot
    currentChunkIndex.value = 0;
    visibleCompetitions.value = [];
    hasMoreCompetitions.value = true;
    animatedCards.value = [];
    
    // Első chunk betöltése
    nextTick(() => {
      loadNextChunk();
      setupIntersectionObserver(); // Observer beállítása
    });
  }
}, { immediate: true });

// Observer újra beállítása amikor új trigger elem jelenik meg
watch(hasMoreCompetitions, (newValue) => {
  if (newValue) {
    nextTick(() => {
      setupIntersectionObserver();
    });
  }
});

async function loadCompetitions() {
  try {
    console.log('Versenyek betöltése...');
    competitions.value = await ApiService.getCompetitions();
    console.log('Versenyek betöltve:', competitions.value.length);
    
    // Reset infinity scroll állapot
    currentChunkIndex.value = 0;
    visibleCompetitions.value = [];
    hasMoreCompetitions.value = true;
    
    // Első chunk betöltése
    nextTick(() => {
      loadNextChunk();
    });
  } catch (error) {
    console.error('Hiba a versenyek betöltésekor:', error);
  }
}

async function clearCacheAndReload() {
  await ApiService.clearCache();
  await loadCompetitions();
}

onMounted(() => {
  loadCompetitions();
  // Háttér szinkronizáció ellenőrzése
  ApiService.checkAndSyncIfNeeded();
  
  // Debug: cache törlés gomb hozzáadása a konzolhoz (csak fejlesztéshez)
  if (import.meta.env.DEV) {
    ;(window as any).clearTournamentsCacheAndReload = clearCacheAndReload;
    console.log('Debug: Futtassa a clearTournamentsCacheAndReload() függvényt a konzolban a versenyek cache törléséhez');
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

</script>

<style scoped>
.competitions-list {
  padding: 0 16px 80px 16px; /* 80px bottom padding a lábléc miatt */
  overflow-x: hidden;
}

.competition-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 80px;
  transform: translateX(15px);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.6s ease-out 0.2s;
  cursor: pointer;
}

.competition-card.animate-in {
  transform: translateX(0);
  opacity: 1;
}


.competition-date {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  min-width: 100px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.competition-divider {
  width: 1px;
  background: #ddd;
  margin-right: 12px;
  align-self: stretch;
}

.competition-details {
  flex: 1;
}

.competition-type {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.competition-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.2;
  word-break: break-word;
  white-space: pre-line;
}

.competition-location {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.competition-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
}

.details-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: block;
  margin-top: 4px;
}

.details-link:hover {
  text-decoration: underline;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: #666;
  cursor: pointer;
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

.no-more-competitions {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
}

.no-more-competitions p {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
  color: #666;
}
</style>





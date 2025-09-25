<template>
  <div>
    <div v-if="filteredCompetitions.length > 0" class="competitions-list">
      <div 
        v-for="(competition, index) in filteredCompetitions" 
        :key="competition.event_date + competition.name"
        class="competition-card"
        :class="{ 'animate-in': animatedCards[index] }"
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
        <div class="competition-chevron" @click="toggleDetails(index)">
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="currentColor">
            <path v-if="expandedIndex === index" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            <path v-else d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="filteredCompetitions.length === 0" class="text-center text-white">
      <p>Nincsenek elérhető versenyek.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ApiService, type Competition } from '../services/api';

const competitions = ref<Competition[]>([]);
const expandedIndex = ref(0); // Első elem alapból nyitva
const animatedCards = ref<boolean[]>([]);

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

function toggleDetails(index: number): void {
  if (expandedIndex.value === index) {
    expandedIndex.value = -1; // Bezárás
  } else {
    expandedIndex.value = index; // Megnyitás
  }
}

// Animáció logika
function animateCards() {
  const filtered = filteredCompetitions.value;
  animatedCards.value = new Array(filtered.length).fill(false);
  
  // Animáljuk a kártyákat egymás után
  filtered.forEach((_, index) => {
    setTimeout(() => {
      animatedCards.value[index] = true;
    }, 100 + (index * 75)); // 100ms kezdeti késleltetés, majd 75ms közöttük
  });
}

// Watch a filtered competitions változására
watch(filteredCompetitions, () => {
  if (filteredCompetitions.value.length > 0) {
    animateCards();
  }
}, { immediate: true });

async function loadCompetitions() {
  try {
    console.log('Versenyek betöltése...');
    competitions.value = await ApiService.getCompetitions();
    console.log('Versenyek betöltve:', competitions.value.length);
    
    // Animációk indítása az adatok betöltése után
    if (filteredCompetitions.value.length > 0) {
      animateCards();
    }
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
  transform: translateX(100vw);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.6s ease-out 0.2s;
}

.competition-card.animate-in {
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
</style>





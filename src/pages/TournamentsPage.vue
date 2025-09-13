<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h5 mb-0 text-white">Versenyek</h1>
      <button 
        class="btn btn-sm btn-outline-light" 
        @click="clearCacheAndReload"
        title="Cache törlése és újratöltés"
      >
        🔄
      </button>
    </div>
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="filteredCompetitions.length > 0" class="competitions-list">
      <div 
        v-for="(competition, index) in filteredCompetitions" 
        :key="competition.event_date + competition.name"
        class="competition-card"
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
    
    <div v-else class="text-center text-white">
      <p>Nincsenek elérhető versenyek.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ApiService, type Competition } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const competitions = ref<Competition[]>([]);
const loading = ref(true);
const expandedIndex = ref(0); // Első elem alapból nyitva

function formatDate(dateStr: string): string {
  // Convert from 2025.09.13 to 2025. 09. 13.
  const [year, month, day] = dateStr.split('.');
  return `${year}. ${month}. ${day}.`;
}

// Szűrjük a versenyeket - csak a mai dátummal vagy későbbiek
const filteredCompetitions = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('Mai dátum:', today);
  console.log('Összes verseny:', competitions.value.length);
  
  const filtered = competitions.value.filter(comp => {
    // Parse the date string (format: 2025.09.13)
    const [year, month, day] = comp.event_date.split('.');
    const compDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    compDate.setHours(0, 0, 0, 0);
    
    const isFuture = compDate >= today;
    console.log('Verseny dátuma:', comp.event_date, '->', compDate, '>=', today, '?', isFuture);
    return isFuture;
  });
  
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

async function loadCompetitions() {
  loading.value = true;
  try {
    competitions.value = await ApiService.getCompetitions();
  } catch (error) {
    console.error('Hiba a versenyek betöltésekor:', error);
  } finally {
    loading.value = false;
  }
}

async function clearCacheAndReload() {
  ApiService.clearCache();
  await loadCompetitions();
}

onMounted(loadCompetitions);
</script>

<style scoped>
.competitions-list {
  padding: 0 16px;
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





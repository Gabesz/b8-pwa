<template>
  <div class="players-page">

    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Betöltés...</span>
      </div>
      <p class="mt-2 text-muted">Játékosok betöltése...</p>
    </div>

    <div v-else-if="players.length > 0" class="players-container">
      <div class="filter-section mb-3">
        <div class="btn-group" role="group">
          <button 
            v-for="level in levels" 
            :key="level.value"
            @click="selectedLevel = level.value"
            :class="['btn', selectedLevel === level.value ? 'btn-primary' : 'btn-outline-primary']"
          >
            {{ level.label }} ({{ getPlayerCountByLevel(level.value) }})
          </button>
        </div>
      </div>

      <div class="players-list">
        <div 
          v-for="(player, index) in filteredPlayers" 
          :key="player.uNum"
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
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <p class="text-muted">Nincsenek elérhető játékosok.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ApiService, type Player, type PlayersResponse } from '../services/api';

const route = useRoute();

const players = ref<Player[]>([]);
const loading = ref(true);
const selectedLevel = ref('all');
const animatedCards = ref<boolean[]>([]);

const levels = [
  { value: 'all', label: 'Összes' },
  { value: 'profi', label: 'Profi' },
  { value: 'félprofi', label: 'Félprofi' },
  { value: 'amatőr', label: 'Amatőr' }
];


const filteredPlayers = computed(() => {
  if (selectedLevel.value === 'all') {
    return players.value;
  }
  
  return players.value.filter(player => {
    const level = player.level.toLowerCase();
    return level === selectedLevel.value || 
           (selectedLevel.value === 'félprofi' && (level === 'félprofi' || level === 'felprofi')) ||
           (selectedLevel.value === 'amatőr' && (level === 'amatőr' || level === 'amator'));
  });
});

const getPlayerCountByLevel = (level: string): number => {
  if (level === 'all') {
    return players.value.length;
  }
  
  const filtered = players.value.filter(player => {
    const playerLevel = player.level.toLowerCase();
    return playerLevel === level || 
           (level === 'félprofi' && (playerLevel === 'félprofi' || playerLevel === 'felprofi')) ||
           (level === 'amatőr' && (playerLevel === 'amatőr' || playerLevel === 'amator'));
  });
  
  return filtered.length;
};


const loadPlayers = async () => {
  try {
    loading.value = true;
    const response: PlayersResponse = await ApiService.getPlayers();
    players.value = response.data;
    
    // Animáció beállítása - egymás után animáljuk a kártyákat
    animatedCards.value = new Array(players.value.length).fill(false);
    
    // Animáljuk a kártyákat egymás után
    players.value.forEach((_, index) => {
      setTimeout(() => {
        animatedCards.value[index] = true;
      }, 100 + (index * 75)); // 100ms kezdeti késleltetés, majd 75ms közöttük
    });
  } catch (error) {
    console.error('Hiba a játékosok betöltésekor:', error);
  } finally {
    loading.value = false;
  }
};

// Query paraméter figyelése
watch(() => route.query.category, (newCategory) => {
  if (newCategory && typeof newCategory === 'string') {
    selectedLevel.value = newCategory;
  }
}, { immediate: true });

// Szűrt játékosok változására animáció
watch(filteredPlayers, () => {
  if (filteredPlayers.value.length > 0) {
    // Animáció beállítása - egymás után animáljuk a kártyákat
    animatedCards.value = new Array(filteredPlayers.value.length).fill(false);
    
    // Animáljuk a kártyákat egymás után
    filteredPlayers.value.forEach((_, index) => {
      setTimeout(() => {
        animatedCards.value[index] = true;
      }, 100 + (index * 75)); // 100ms kezdeti késleltetés, majd 75ms közöttük
    });
  }
}, { immediate: true });

onMounted(() => {
  loadPlayers();
  
  // Ha van category query paraméter, állítsuk be a szűrőt
  if (route.query.category && typeof route.query.category === 'string') {
    selectedLevel.value = route.query.category;
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
  transform: translateX(100vw);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.6s ease-out 0.2s;
}

.player-card.animate-in {
  transform: translateX(-20px);
  opacity: 1;
  animation: bounceBack 0.3s ease-out 0.8s forwards;
}

.player-card:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

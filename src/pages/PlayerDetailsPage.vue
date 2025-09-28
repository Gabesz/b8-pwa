<template>
  <div class="player-details-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Betöltés...</span>
      </div>
      <p class="mt-2 text-muted">Játékos adatok betöltése...</p>
    </div>

    <div v-else-if="playerResults.length > 0">
      <div class="player-header">
        <h1 :class="getPlayerLevelClass(playerResults[0].Level1)">
          {{ playerResults[0].uName }}
        </h1>
        <div class="player-info">
          <span class="player-rank" :class="getPlayerLevelClass(playerResults[0].Level1)">#{{ playerResults[0].uNum }}</span>
          <span class="player-level" :class="'level-' + playerResults[0].Level1?.toLowerCase()">
            {{ playerResults[0].Level1 }}
          </span>
        </div>
      </div>
      
      <div class="player-stats">
        <div class="stat-card">
          <h3>Jelenlegi Élő-pontszám</h3>
          <p class="stat-value">{{ playerResults[0].EloMa1 }}</p>
        </div>
        <div class="stat-card">
          <h3>Versenyek/Mérkőzések</h3>
          <p class="stat-value">{{ uniqueCompetitionsCount }}/{{ playerResults.length }}</p>
        </div>
      </div>
      
      <div class="player-charts">
        <h2>Élő-pontok Fejlődése</h2>
        <div class="chart-tabs">
          <button 
            v-for="chartType in chartTypes" 
            :key="chartType.id"
            @click="selectedChart = chartType.id"
            :class="['chart-tab', { active: selectedChart === chartType.id }]"
          >
            {{ chartType.name }}
          </button>
        </div>
        
        <div class="chart-container">
          <div v-if="!playerResults || playerResults.length === 0" class="no-chart-data">
            <p>Nincsenek elérhető adatok a grafikon megjelenítéséhez</p>
          </div>
          <div v-else>
            <div v-if="selectedChart === 'line'" class="chart-wrapper">
              <canvas ref="lineChart" width="600" height="400"></canvas>
            </div>
            <div v-else-if="selectedChart === 'bar'" class="chart-wrapper">
              <canvas ref="barChart" width="600" height="400"></canvas>
            </div>
            <div v-else-if="selectedChart === 'area'" class="chart-wrapper">
              <canvas ref="areaChart" width="600" height="400"></canvas>
            </div>
            <div v-else-if="selectedChart === 'scatter'" class="chart-wrapper">
              <canvas ref="scatterChart" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="player-results">
        <h2>Versenyek és eredmények</h2>
        <div class="competitions-list">
          <div 
            v-for="(competition, index) in displayCompetitions" 
            :key="competition.name + competition.date"
            class="competition-card"
            :class="{ 'animate-in': animatedCards[index] }"
          >
            <!-- Verseny fejléc -->
            <div 
              class="competition-header"
              @click="toggleCompetition(competition.name + '_' + competition.matches[0].datum)"
            >
              <div class="competition-info">
                <div class="competition-name">{{ competition.name }}</div>
                <div class="competition-date">{{ competition.date }}</div>
                <div class="competition-matches-count">{{ competition.matches.length }} mérkőzés</div>
              </div>
              <div class="competition-chevron">
                <i 
                  class="fas fa-chevron-down" 
                  :class="{ 'rotated': isCompetitionExpanded(competition.name + '_' + competition.matches[0].datum) }"
                ></i>
              </div>
            </div>
            
            <!-- Mérkőzések listája (kibontott állapotban) -->
            <div 
              v-if="isCompetitionExpanded(competition.name + '_' + competition.matches[0].datum)"
              class="matches-list"
            >
              <div 
                v-for="match in competition.matches" 
                :key="match.uNum"
                class="match-card"
              >
                <!-- 1. cella: Név és játékos szint -->
                <div class="match-cell match-opponent-cell">
                  <span 
                    class="opponent-name-link"
                    @click.stop="navigateToOpponent(match.EllenfelID)"
                  >
                    {{ match.EllenfeNev }}
                  </span>
                  <span class="opponent-level" :class="'level-' + match.Level2?.toLowerCase()">
                    {{ match.Level2 }}
                  </span>
                </div>
                
                <!-- 2. cella: Eredmény (hangsúlyos és középen) -->
                <div class="match-cell match-score-cell">
                  <span class="match-result">{{ match.Eredm1 }} : {{ match.Eredm2 }}</span>
                </div>
                
                <!-- 3. cella: ELO változás -->
                <div class="match-cell match-elo-cell">
                  <span :class="match.EloLett1 > match.EloVolt1 ? 'elo-gain' : 'elo-loss'">
                    {{ match.EloLett1 > match.EloVolt1 ? '+' : '' }}{{ (match.EloLett1 - match.EloVolt1).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div 
          v-if="isLoadingMore" 
          class="loading-more"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Betöltés...</span>
          </div>
          <p class="mt-2 text-muted">Versenyek betöltése...</p>
        </div>
        
        <!-- Intersection Observer trigger -->
        <div 
          v-if="hasMoreResults && !isLoadingMore"
          ref="loadMoreTrigger"
          class="load-more-trigger"
        >
          <!-- Láthatatlan trigger elem -->
        </div>
      </div>
    </div>

    <div v-else-if="hasError" class="no-data">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <h3>Hiba történt</h3>
        <p>{{ errorMessage }}</p>
        <p class="text-muted">Kérjük, próbálja újra később.</p>
      </div>
    </div>

    <div v-else class="no-data">
      <div class="offline-message">
        <i class="fas fa-wifi-slash offline-icon"></i>
        <h3>Internet szükséges</h3>
        <p>A játékos adatainak megtekintéséhez internetkapcsolat szükséges.</p>
        <p class="text-muted">Ellenőrizze a hálózati kapcsolatát és próbálja újra.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiService, type PlayerResult } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Chart.js regisztrálása - minden szükséges komponens
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  annotationPlugin
);

const route = useRoute();
const router = useRouter();
const playerResults = ref<PlayerResult[]>([]);
const loading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');

// Chart változók
const selectedChart = ref('line');
const chartTypes = ref([
  { id: 'line', name: 'Vonal' },
  { id: 'bar', name: 'Oszlop' },
  { id: 'area', name: 'Terület' },
  { id: 'scatter', name: 'Szóró' }
]);

const lineChart = ref<HTMLCanvasElement | null>(null);
const barChart = ref<HTMLCanvasElement | null>(null);
const areaChart = ref<HTMLCanvasElement | null>(null);
const scatterChart = ref<HTMLCanvasElement | null>(null);

let chartInstances: { [key: string]: ChartJS | null } = {
  line: null,
  bar: null,
  area: null,
  scatter: null
};

// Infinity scroll változók - verseny csoportokhoz
const visibleCompetitions = ref<any[]>([]);
const currentChunkIndex = ref(0);
const chunkSize = ref(5);
const isLoadingMore = ref(false);
const hasMoreResults = ref(true);
const observer = ref<IntersectionObserver | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const animatedCards = ref<boolean[]>([]);

const displayCompetitions = computed(() => visibleCompetitions.value);

// Egyedi versenyek számának számítása
const uniqueCompetitionsCount = computed(() => {
  if (!playerResults.value || playerResults.value.length === 0) return 0;
  
  const uniqueCompetitions = new Set(
    playerResults.value.map(result => result.Verseny || result.datum)
  );
  
  return uniqueCompetitions.size;
});

// Versenyek csoportosítása
const competitionsGrouped = computed(() => {
  if (!playerResults.value || playerResults.value.length === 0) return [];
  
  const groups = new Map();
  
  playerResults.value.forEach(result => {
    // Kompozit kulcs: verseny név + dátum
    const competitionName = result.Verseny || 'Verseny';
    const dateKey = formatDate(result.datum);
    const competitionKey = `${competitionName}_${result.datum}`;
    
    if (!groups.has(competitionKey)) {
      groups.set(competitionKey, {
        name: competitionName,
        date: dateKey,
        matches: []
      });
    }
    
    groups.get(competitionKey).matches.push(result);
  });
  
  // Rendezés dátum szerint (legújabb először)
  return Array.from(groups.values()).sort((a, b) => 
    new Date(b.matches[0].datum).getTime() - new Date(a.matches[0].datum).getTime()
  );
});

// Kibontott versenyek kezelése
const expandedCompetitions = ref<Set<string>>(new Set());

const toggleCompetition = (competitionName: string) => {
  if (expandedCompetitions.value.has(competitionName)) {
    expandedCompetitions.value.delete(competitionName);
  } else {
    expandedCompetitions.value.add(competitionName);
  }
};

const isCompetitionExpanded = (competitionName: string) => {
  return expandedCompetitions.value.has(competitionName);
};

const navigateToOpponent = (cuescoreId: number) => {
  console.log('Navigating to opponent:', cuescoreId);
  
  // Egyszerű router.push - ez megőrzi a history-t
  router.push(`/jatekosok/${cuescoreId}`);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('hu-HU');
};

const formatDateForChart = (dateString: string): string => {
  const date = new Date(dateString);
  // Egyszerű formátum: YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

const getPlayerLevelClass = (level: string): string => {
  if (!level) return 'player-name-profi';
  
  const levelLower = level.toLowerCase();
  switch (levelLower) {
    case 'profi':
      return 'player-name-profi';
    case 'félprofi':
    case 'felprofi':
      return 'player-name-felprofi';
    case 'amatőr':
    case 'amator':
      return 'player-name-amator';
    default:
      return 'player-name-profi';
  }
};

// Chart adatok előkészítése
const chartData = computed(() => {
  console.log('Computing chart data, playerResults length:', playerResults.value?.length);
  
  if (!playerResults.value || playerResults.value.length === 0) {
    console.log('No player results available for chart');
    return { labels: [], datasets: [] };
  }

  // Eredmények dátum szerint rendezése (legrégebbi először)
  const sortedResults = [...playerResults.value].sort((a, b) => 
    new Date(a.datum).getTime() - new Date(b.datum).getTime()
  );

  // Egyedi versenyek csoportosítása dátum szerint
  const competitionGroups = new Map();
  
  sortedResults.forEach(result => {
    const dateKey = formatDateForChart(result.datum);
    const dateDisplay = formatDate(result.datum);
    if (!competitionGroups.has(dateKey)) {
      competitionGroups.set(dateKey, {
        date: dateDisplay,
        elo: result.VersTelj1,
        competition: result.Verseny || 'Verseny'
      });
    }
  });

  // Csak az egyedi versenyek adatai
  const uniqueCompetitions = Array.from(competitionGroups.values());
  const labels = uniqueCompetitions.map((comp) => {
    // Dátum formátum: ÉV.HÓNAP.NAP
    const date = new Date(comp.date);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  });
  const eloData = uniqueCompetitions.map(comp => comp.elo);

  console.log('Chart data computed:', { 
    labels: labels.length, 
    eloData: eloData.length, 
    uniqueCompetitions: uniqueCompetitions.length,
    sampleLabels: labels.slice(0, 3),
    sampleData: eloData.slice(0, 3)
  });

  return {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Élő-pontszám',
        data: eloData,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4ecdc4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };
});

// Chart konfigurációk
const getChartConfig = (type: string) => {
  const baseConfig = {
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1.8,
      layout: {
        padding: {
          top: 20,
          bottom: 40,
          left: 20,
          right: 20
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Élő-pontok Fejlődése',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top' as const
        },
        tooltip: {
          callbacks: {
            title: function(context: any) {
              const index = context[0].dataIndex;
              // Keresd meg az adott dátumhoz tartozó első eredményt
              const date = context[0].label;
              const result = playerResults.value.find(r => formatDate(r.datum) === date);
              if (!result) return 'Verseny';
              return `${date} - ${result.Verseny || 'Verseny'}`;
            },
            label: function(context: any) {
              const index = context.dataIndex;
              const date = context.label;
              // Keresd meg az adott dátumhoz tartozó első eredményt
              const result = playerResults.value.find(r => formatDate(r.datum) === date);
              if (!result) return `Élő-pontszám: ${context.parsed.y}`;
              return [
                `Verseny: ${result.Verseny || 'Verseny'}`,
                `Élő-pontszám: ${result.VersTelj1}`,
                `Dátum: ${date}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'Versenyek',
            font: {
              weight: 'bold',
              size: 14
            },
            padding: {
              top: 15
            }
          },
          ticks: {
            display: true,
            font: {
              size: 12,
              weight: 'normal'
            },
            maxTicksLimit: 20,
            padding: 5
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: true,
            borderColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Élő-pontszám',
            font: {
              weight: 'bold',
              size: 14
            },
            padding: {
              bottom: 10
            }
          },
          beginAtZero: false,
          ticks: {
            display: true,
            font: {
              size: 12
            },
            padding: 8
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: true,
            borderColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      },
      plugins: {
        annotation: {
          annotations: {
            profiLine: {
              type: 'line',
              yMin: 575,
              yMax: 575,
              borderColor: '#28a745',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: 'Profi határvonal',
                enabled: true,
                position: 'start',
                backgroundColor: '#28a745',
                color: 'white',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                padding: 4
              }
            },
            felprofiLine: {
              type: 'line',
              yMin: 475,
              yMax: 475,
              borderColor: '#ccbb25',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: 'Félprofi határvonal',
                enabled: true,
                position: 'start',
                backgroundColor: '#ccbb25',
                color: 'white',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                padding: 4
              }
            }
          }
        }
      }
    }
  };

  switch (type) {
    case 'line':
      return {
        ...baseConfig,
        type: 'line' as const
      };
    case 'bar':
      return {
        ...baseConfig,
        type: 'bar' as const,
        data: {
          ...chartData.value,
          datasets: chartData.value.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: 'rgba(78, 205, 196, 0.6)',
            borderColor: '#4ecdc4',
            borderWidth: 1
          }))
        }
      };
    case 'area':
      return {
        ...baseConfig,
        type: 'line' as const,
        data: {
          ...chartData.value,
          datasets: chartData.value.datasets.map(dataset => ({
            ...dataset,
            fill: true,
            backgroundColor: 'rgba(78, 205, 196, 0.3)'
          }))
        }
      };
    case 'scatter':
      return {
        ...baseConfig,
        type: 'line' as const,
        data: {
          ...chartData.value,
          datasets: chartData.value.datasets.map(dataset => ({
            ...dataset,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false,
            borderWidth: 0
          }))
        }
      };
    default:
      return baseConfig;
  }
};

// Chart létrehozása
const createChart = (type: string) => {
  const canvasRef = type === 'line' ? lineChart.value :
                   type === 'bar' ? barChart.value :
                   type === 'area' ? areaChart.value :
                   scatterChart.value;

  if (!canvasRef) {
    console.log(`Canvas ref not found for chart type: ${type}`);
    return;
  }

  // Régi chart törlése - minden chart típusra
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key]?.destroy();
      chartInstances[key] = null;
    }
  });

  // Canvas tisztítása
  const ctx = canvasRef.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
  }

  try {
    // Valódi ELO adatok használata
    const data = chartData.value;
    
    if (!data || data.labels.length === 0) {
      console.log('No chart data available');
      return;
    }

    const config = getChartConfig(type);
    chartInstances[type] = new ChartJS(canvasRef, config);
    console.log(`Chart created successfully for type: ${type} with ${data.labels.length} data points`);
  } catch (error) {
    console.error(`Error creating chart for type ${type}:`, error);
  }
};

// Chart frissítése
const updateCharts = () => {
  chartTypes.value.forEach(chartType => {
    if (chartInstances[chartType.id]) {
      createChart(chartType.id);
    }
  });
};

// Infinity scroll funkciók
const loadNextChunk = () => {
  if (isLoadingMore.value || !hasMoreResults.value) return;
  
  isLoadingMore.value = true;
  
  const startIndex = currentChunkIndex.value * chunkSize.value;
  const endIndex = startIndex + chunkSize.value;
  const nextChunk = competitionsGrouped.value.slice(startIndex, endIndex);
  
  if (nextChunk.length === 0) {
    hasMoreResults.value = false;
    isLoadingMore.value = false;
    return;
  }
  
  setTimeout(() => {
    const currentLength = visibleCompetitions.value.length;
    visibleCompetitions.value.push(...nextChunk);
    
    console.log('Chunk added (competitions):', { newVisibleCount: visibleCompetitions.value.length });
    
    // Animáció beállítása az új kártyákhoz
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

const setupIntersectionObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
  }
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMoreResults.value && !isLoadingMore.value) {
          loadNextChunk();
        }
      });
    },
    {
      rootMargin: '300px'
    }
  );
  
  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value);
  }
};

// Watcher a competitionsGrouped változására
watch(competitionsGrouped, (newCompetitions) => {
  if (newCompetitions.length > 0) {
    // Reset infinity scroll állapot
    visibleCompetitions.value = [];
    currentChunkIndex.value = 0;
    hasMoreResults.value = true;
    animatedCards.value = [];
    
    // Első verseny automatikusan kinyitása
    if (newCompetitions[0]) {
      expandedCompetitions.value.add(newCompetitions[0].name + '_' + newCompetitions[0].matches[0].datum);
    }
    
    // Első chunk betöltése
    setTimeout(() => {
      loadNextChunk();
      nextTick(() => {
        setupIntersectionObserver();
      });
    }, 100);
  }
});

// Watcher a hasMoreResults változására
watch(hasMoreResults, () => {
  nextTick(() => {
    setupIntersectionObserver();
  });
});

// Watcher a selectedChart változására
watch(selectedChart, (newChart) => {
  console.log('Selected chart changed to:', newChart);
  nextTick(() => {
    setTimeout(() => {
      createChart(newChart);
    }, 100);
  });
});

// Watcher a chartData változására
watch(chartData, (newData) => {
  console.log('Chart data changed:', newData);
  if (newData && newData.labels.length > 0) {
    nextTick(() => {
      setTimeout(() => {
        createChart(selectedChart.value);
      }, 100);
    });
  }
}, { deep: true });

onMounted(async () => {
  const cuescoreId = route.params.cuescoreId;
  if (cuescoreId) {
    try {
      hasError.value = false;
      errorMessage.value = '';
      const results = await ApiService.getPlayerResults(Number(cuescoreId));
      playerResults.value = results;
      
      console.log('Player results loaded:', results.length);
      
      // Chart inicializálása adatok betöltése után - csak ha van adat
      if (results.length > 0) {
        nextTick(() => {
          setTimeout(() => {
            createChart(selectedChart.value);
          }, 300);
        });
      }
    } catch (error) {
      console.error('Error loading player results:', error);
      hasError.value = true;
      errorMessage.value = 'Nem sikerült betölteni a játékos adatokat.';
    } finally {
      loading.value = false;
    }
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
  
  // Chart példányok törlése
  Object.values(chartInstances).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });
});
</script>

<style scoped>
.player-details-page {
  padding: 20px 16px 80px 16px;
  color: white;
}

.player-header {
  text-align: center;
  margin-bottom: 30px;
}

.player-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.player-name-profi {
  color: #457974; /* Profi szín */
}

.player-name-felprofi {
  color: #ccbb25; /* Félprofi szín */
}

.player-name-amator {
  color: #bb5175; /* Amatőr szín */
}

.player-info {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.player-rank {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
}

.player-rank.player-name-profi {
  color: #457974; /* Profi szín */
}

.player-rank.player-name-felprofi {
  color: #ccbb25; /* Félprofi szín */
}

.player-rank.player-name-amator {
  color: #bb5175; /* Amatőr szín */
}

.player-level {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.level-profi {
  background: #ff6b6b;
  color: white;
}

.level-félprofi {
  background: #4ecdc4;
  color: white;
}

.level-amatőr {
  background: #45b7d1;
  color: white;
}

.player-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #666;
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.player-results {
}

.player-charts {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.player-charts h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.chart-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.chart-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.chart-tab:hover {
  background: #f5f5f5;
  border-color: #4ecdc4;
}

.chart-tab.active {
  background: #4ecdc4;
  border-color: #4ecdc4;
  color: white;
}

.chart-container {
  position: relative;
  height: auto;
  min-height: 400px;
  max-height: 800px;
  width: 100%;
  overflow: visible;
  padding: 0;
  margin-bottom: 20px;
}

.chart-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.no-chart-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-style: italic;
}

.player-results h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

/* Competitions styling */
.competitions-list {
  display: flex;
  flex-direction: column;
}

.competition-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  transform: translateX(15px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.competition-card.animate-in {
  transform: translateX(0);
  opacity: 1;
}

.competition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}

.competition-info {
  flex: 1;
}

.competition-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.competition-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.competition-matches-count {
  font-size: 12px;
  color: #888;
}

.competition-chevron {
  color: #666;
  transition: transform 0.3s ease;
}

.competition-chevron i.rotated {
  transform: rotate(180deg);
}

.matches-list {
  margin-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
}

.match-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  gap: 16px;
}

.match-card:last-child {
  border-bottom: none;
}

.match-cell {
  display: flex;
  align-items: center;
}

/* 1. cella: Név és szint */
.match-opponent-cell {
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.opponent-name-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
}

.opponent-name-link:hover {
  color: #333;
  text-decoration: none;
  border-bottom: none;
}

.opponent-level {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

/* 2. cella: Eredmény (hangsúlyos és középen) */
.match-score-cell {
  justify-content: center;
}

.match-result {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  text-align: center;
}

/* 3. cella: ELO változás */
.match-elo-cell {
  justify-content: flex-end;
}

.match-elo-cell span {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(15px);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.6s ease-out 0.2s;
}

.result-card.animate-in {
  transform: translateX(0);
  opacity: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.result-date {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.result-tournament {
  font-size: 14px;
  font-weight: bold;
  text-align: right;
  max-width: 60%;
  color: #333;
}

.result-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opponent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.opponent-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.opponent-level {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
  width: fit-content;
}

.result-score {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.player-score {
  color: #4ecdc4;
}

.opponent-score {
  color: #ff6b6b;
}

.score-separator {
  opacity: 0.6;
}

.elo-change {
  text-align: right;
  font-size: 12px;
  font-weight: bold;
}

.elo-gain {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.elo-loss {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
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

.error-message {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 20px;
}

.error-message h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.error-message p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

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

@media (max-width: 768px) {
  .player-details-page {
    padding: 16px 12px 80px 12px;
  }
  
  .player-header h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  
  .player-info {
    flex-direction: row;
    gap: 15px;
  }
  
  .player-stats {
    grid-template-columns: 1fr;
  }
  
  .result-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-tournament {
    text-align: left;
    max-width: 100%;
  }
  
  .result-details {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .elo-change {
    text-align: left;
  }
  
  .chart-tabs {
    gap: 6px;
  }
  
  .chart-tab {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .chart-container {
    min-height: 350px;
    max-height: 600px;
    padding: 0;
  }
}

@media (min-width: 1024px) {
  .chart-container {
    min-height: 500px;
    max-height: 900px;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .chart-container {
    min-height: 250px;
    max-height: 400px;
    padding: 0;
  }
}
</style>

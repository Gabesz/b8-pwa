<template>
  <div class="homepage-container">
    <!-- Preloader -->
    <CircularPreloader :show="isLoadingPlayers" text="Játékosok betöltése..." />
    <!-- 1 soros navigáció - fix gomb + scrollozható gombok -->
    <div 
      class="single-row-navigation"
      :class="{ 'animate-in': showMenu }"
    >
      <!-- Fix gomb balra -->
      <a href="#" class="menu-item fixed-item">Játékos ranglista</a>
      
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ApiService, type Player } from '../services/api'
import CircularPreloader from '../components/CircularPreloader.vue'

const showMenu = ref(false)
const showProfi = ref(false)
const showFelprofi = ref(false)
const showAmator = ref(false)

// Játékosok számlálása
const profiCount = ref(66)
const felprofiCount = ref(153)
const amatorCount = ref(967)

// Loading state
const isLoadingPlayers = ref(false)

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
  isLoadingPlayers.value = true
  
  try {
    // Teszt késleltetés - hogy látszódjon a preloader
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const playersResponse = await ApiService.getPlayers()
    const counts = ApiService.getPlayerCountsByLevel(playersResponse.data)
    
    profiCount.value = counts.profi
    felprofiCount.value = counts.felprofi
    amatorCount.value = counts.amator
  } catch (error) {
    // Ha hiba van, az alapértelmezett értékek maradnak
    console.log('Nem sikerült betölteni a játékos adatokat')
  } finally {
    isLoadingPlayers.value = false
    // Preloader eltűnése után indítsuk az animációkat
    startAnimations()
  }
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

onMounted(() => {
  // Játékos adatok betöltése
  loadPlayerData()
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
}
</style>





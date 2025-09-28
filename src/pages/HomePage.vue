<template>
  <div class="homepage-container">
    <!-- 1 soros navigáció - fix gomb + scrollozható gombok -->
    <div 
      class="single-row-navigation"
      :class="{ 'animate-in': showMenu }"
    >
      <!-- Fix gombok balra -->
      <a @click="navigateToPlayersPage" class="menu-item fixed-item">Játékos ranglista</a>
      <a href="https://biliard8.hu/" target="_blank" class="menu-item simple-link">Biliard8.hu</a>
      <a href="https://poolszakag.hu/group" target="_blank" class="menu-item simple-link">CsB</a>
      <a href="https://poolszakag.hu/fixture" target="_blank" class="menu-item simple-link">
        <i class="fas fa-calendar-alt"></i>
      </a>
      
    </div>

    <div 
      class="skill-level-box profi-box"
      :class="{ 'animate-in': showProfi }"
      @click="navigateToPlayers('profi')"
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
      @click="navigateToPlayers('félprofi')"
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
      @click="navigateToPlayers('amatőr')"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService, type Player, OFFLINE_PLAYERS_DATA } from '../services/api'

const router = useRouter()

// Navigációs függvények a kártyákhoz
const navigateToPlayers = (category: string) => {
  router.push({
    path: '/jatekosok',
    query: { category: category }
  })
}

// Navigáció a Játékosok oldalra (kategória nélkül)
const navigateToPlayersPage = () => {
  router.push({
    path: '/jatekosok'
  })
}


const showMenu = ref(false)
const showProfi = ref(false)
const showFelprofi = ref(false)
const showAmator = ref(false)


// Játékosok számlálása - 0-ról indulunk, majd frissül a valódi adatokkal
const profiCount = ref(0)
const felprofiCount = ref(0)
const amatorCount = ref(0)


// Játékosok adatainak lekérése
const loadPlayerData = async () => {
  try {
    console.log('Játékosok betöltése...')
    const playersResponse = await ApiService.getPlayers()
    console.log('Játékosok válasz:', playersResponse)
    console.log('Játékosok száma:', playersResponse.data.length)
    
    const counts = ApiService.getPlayerCountsByLevel(playersResponse.data)
    console.log('Játékosok száma szint szerint:', counts)
    
    profiCount.value = counts.profi
    felprofiCount.value = counts.felprofi
    amatorCount.value = counts.amator
    
    console.log('Frissített számlálók:', { profi: profiCount.value, felprofi: felprofiCount.value, amator: amatorCount.value })
  } catch (error) {
    // Ha hiba van, használjuk az offline adatokat
    console.error('Nem sikerült betölteni a játékos adatokat:', error)
    console.log('Offline adatok használata...')
    
    const counts = ApiService.getPlayerCountsByLevel(OFFLINE_PLAYERS_DATA.data)
    console.log('Offline játékosok száma szint szerint:', counts)
    
    profiCount.value = counts.profi
    felprofiCount.value = counts.felprofi
    amatorCount.value = counts.amator
    
    console.log('Offline számlálók:', { profi: profiCount.value, felprofi: felprofiCount.value, amator: amatorCount.value })
  }
  
  // Animációk indítása azonnal
  startAnimations()
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
  display: inline-block;
  position: relative;
  z-index: 10;
  pointer-events: auto;
  cursor: pointer;
  /* Biztosítsuk, hogy a linkek működjenek */
  pointer-events: auto !important;
}

.menu-item.fixed-item {
  background-color: #bb5175;
  color: white;
  transition: background-color 0.2s ease;
  cursor: pointer;
  border: 2px solid #bb5175;
}

.menu-item.fixed-item:hover {
  background-color: #a0445f;
}

.menu-item.simple-link {
  background-color: transparent;
  color: #000;
  text-decoration: none;
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  transition: none;
}

.menu-item.simple-link:hover {
  background-color: transparent;
  color: #000;
  text-decoration: none;
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
  cursor: pointer;
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
    z-index: 20;
    pointer-events: auto;
    touch-action: manipulation;
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

/* Tablet nézetben a nyilak láthatóak */
@media (min-width: 769px) and (max-width: 1023px) {
  .scroll-arrow {
    width: 28px;
    height: 28px;
  }
  
  .scroll-arrow i {
    font-size: 10px;
  }
}

/* Desktop nézetben a nyilak kisebb méretben */
@media (min-width: 1200px) {
  .scroll-arrow {
    width: 28px;
    height: 28px;
  }
  
  .scroll-arrow i {
    font-size: 10px;
  }
}
</style>





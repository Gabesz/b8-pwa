<template>
  <div class="homepage-container">
    <!-- Vízszintes menü sáv -->
    <div 
      class="horizontal-menu"
      :class="{ 'animate-in': showMenu }"
    >
      <a href="#" class="menu-item">Játékos ranglista</a>
      <a href="#" class="menu-item">CueScore.hu</a>
      <a href="#" class="menu-item">Biliard8.hu</a>
      <a href="#" class="menu-item">CsB</a>
      <a href="#" class="menu-item">Verseny naptár</a>
      <a href="#" class="menu-item">LIVE stream-ek</a>
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
          <div class="box-subtitle">ranglista (66)</div>
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
          <div class="box-subtitle">ranglista (153)</div>
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
          <div class="box-subtitle">ranglista (967)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showMenu = ref(false)
const showProfi = ref(false)
const showFelprofi = ref(false)
const showAmator = ref(false)

onMounted(() => {
  // Menü sáv azonnal indul
  setTimeout(() => {
    showMenu.value = true
  }, 100)
  
  // PROFI doboz 500ms után (amikor a menü félig beért)
  setTimeout(() => {
    showProfi.value = true
  }, 600)
  
  // FÉLPROFI doboz 900ms után (amikor a PROFI félig beért)
  setTimeout(() => {
    showFelprofi.value = true
  }, 1000)
  
  // AMATŐR doboz 1200ms után (amikor a FÉLPROFI félig beért)
  setTimeout(() => {
    showAmator.value = true
  }, 1300)
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

.horizontal-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.horizontal-menu.animate-in {
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
  transition: all 0.2s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: #bb5175;
  color: white;
  transform: translateY(-2px);
}

.menu-item:first-child {
  background-color: #bb5175;
  color: white;
}

.menu-item:first-child:hover {
  background-color: #a0445f;
  transform: translateY(-2px);
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
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
  
  .horizontal-menu {
    gap: 8px;
    margin-bottom: 6px;
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





<template>
  <div v-if="show" class="preloader-overlay">
    <div class="preloader-container">
      <div class="circular-preloader">
        <div class="spinner"></div>
      </div>
      <div class="preloader-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: 'Betöltés...'
});
</script>

<style scoped>
.preloader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.preloader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.circular-preloader {
  width: 60px;
  height: 60px;
  position: relative;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #bb5175;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.preloader-text {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobil optimalizáció */
@media (max-width: 768px) {
  .circular-preloader {
    width: 50px;
    height: 50px;
  }
  
  .spinner {
    border-width: 3px;
  }
  
  .preloader-text {
    font-size: 14px;
  }
}
</style>

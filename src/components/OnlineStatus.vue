<template>
  <div 
    v-if="showStatus" 
    class="online-status"
    :class="{ 'online': isOnline, 'offline': !isOnline }"
  >
    <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
    <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);
const showStatus = ref(false);

const handleOnline = () => {
  isOnline.value = true;
  showStatus.value = true;
  
  // 3 másodperc után elrejtjük az online státuszt
  setTimeout(() => {
    showStatus.value = false;
  }, 3000);
};

const handleOffline = () => {
  isOnline.value = false;
  showStatus.value = true;
};

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Ha offline állapotban vagyunk, mutassuk a státuszt
  if (!navigator.onLine) {
    showStatus.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.online-status {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.online-status.online {
  background-color: #28a745;
  color: white;
}

.online-status.offline {
  background-color: #dc3545;
  color: white;
}

.online-status i {
  font-size: 16px;
}

/* Mobil optimalizáció */
@media (max-width: 768px) {
  .online-status {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .online-status i {
    font-size: 14px;
  }
}
</style>

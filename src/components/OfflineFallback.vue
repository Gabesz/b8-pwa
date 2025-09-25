<template>
  <!-- Eltávolítjuk a blokkoló modalt, csak egy kis értesítést hagyunk -->
  <div v-if="showOfflineNotification" class="offline-notification">
    <div class="notification-content">
      <i class="fas fa-wifi-slash"></i>
      <span>Offline mód - cache-ből töltve</span>
      <button @click="dismissNotification" class="dismiss-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showOfflineNotification = ref(false);

const handleOnline = () => {
  showOfflineNotification.value = false;
};

const handleOffline = () => {
  // Csak akkor mutassuk az értesítést, ha offline vagyunk
  showOfflineNotification.value = true;
  
  // Automatikusan elrejtjük 5 másodperc után
  setTimeout(() => {
    showOfflineNotification.value = false;
  }, 5000);
};

const dismissNotification = () => {
  showOfflineNotification.value = false;
};

onMounted(() => {
  // Csak akkor mutassuk az offline értesítést, ha valóban offline vagyunk
  if (!navigator.onLine) {
    showOfflineNotification.value = true;
    
    // Automatikusan elrejtjük 5 másodperc után
    setTimeout(() => {
      showOfflineNotification.value = false;
    }, 5000);
  }
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.offline-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

.notification-content {
  background: rgba(220, 53, 69, 0.95);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-content i {
  font-size: 16px;
}

.dismiss-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  margin-left: 8px;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dismiss-btn i {
  font-size: 12px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Mobil optimalizáció */
@media (max-width: 768px) {
  .offline-notification {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
  }
  
  .notification-content {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>

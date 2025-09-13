<script setup lang="ts">
import { ref, onMounted } from 'vue';

const show = ref(false);
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      show.value = true;
    });
  }
});

function reload() {
  location.reload();
}
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="update-prompt">
      Új verzió elérhető.
      <button type="button" @click="reload">Frissítés</button>
    </div>
  </transition>
</template>

<style scoped>
.update-prompt {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
button { background: #0ea5e9; color: white; border: 0; border-radius: 0.375rem; padding: 0.25rem 0.5rem; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>





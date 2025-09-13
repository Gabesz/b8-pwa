<script setup lang="ts">
defineProps<{ msg: string }>();
</script>

<template>
  <section>
    <h2>{{ msg }}</h2>
    <p>
      Szerkeszd a <code>src/components/HelloWorld.vue</code> fájlt és mentsd el azonnali frissítéshez.
    </p>
  </section>
</template>

<style scoped>
section { padding: 1rem; }
h2 { color: #0ea5e9; }
</style>



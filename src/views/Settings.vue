<template>
  <div class="settings-view">
    <SettingsPage />
  </div>
</template>

<script setup>
import SettingsPage from '../components/SettingsPage.vue';
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: var(--background);
}
</style>

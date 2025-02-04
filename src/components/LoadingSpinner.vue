<template>
  <transition name="fade">
    <div v-if="loading" class="loading-overlay" :class="{ contained }">
      <div class="loading-spinner"></div>
      <div v-if="message" class="loading-message">{{ message }}</div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  contained: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay.contained {
  position: absolute;
  border-radius: var(--border-radius);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 1rem;
  color: #fff;
  font-size: 1rem;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

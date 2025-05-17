<template>
  <div 
    v-if="loading"
    class="spinner-wrapper"
    :class="{ 'contained': contained }"
  >
    <div class="spinner-content">
      <div class="spinner">
        <svg class="spinner-circle" viewBox="0 0 50 50">
          <circle
            class="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
          />
        </svg>
      </div>
      <div v-if="message" class="spinner-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true
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
.spinner-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  z-index: var(--z-50);
}

.spinner-wrapper.contained {
  position: absolute;
  background: var(--glass-background);
  border-radius: var(--radius-lg);
}

.spinner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  animation: scale 0.3s ease-out;
}

.spinner {
  width: 40px;
  height: 40px;
  color: var(--primary);
}

.spinner-circle {
  animation: rotate 2s linear infinite;
  transform-origin: center;
}

.path {
  stroke-dasharray: 128;
  stroke-dashoffset: 128;
  animation: dash 1.5s ease-in-out infinite;
}

.spinner-message {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  max-width: 200px;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 128;
  }
  50% {
    stroke-dashoffset: 32;
  }
  100% {
    stroke-dashoffset: 128;
  }
}

@keyframes scale {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

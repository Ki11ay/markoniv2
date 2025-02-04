<template>
  <div class="connection-status">
    <div class="status-group">
      <span 
        class="status-indicator" 
        :class="{
          'connected': isConnected,
          'pulse': isConnected
        }"
      ></span>
      <span class="status-text">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>
    <transition name="fade">
      <div v-if="!isConnected" class="reconnect-timer">
        Next check in {{ timeUntilNextCheck }}s
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useSystemControl } from '../composables/useSystemControl';

const props = defineProps({
  isConnected: {
    type: Boolean,
    required: true
  },
  checkInterval: {
    type: Number,
    default: 20000 // 20 seconds
  }
});

const timeUntilNextCheck = ref(Math.ceil(props.checkInterval / 1000));
let timer = null;

const updateTimer = () => {
  if (!props.isConnected) {
    timeUntilNextCheck.value--;
    if (timeUntilNextCheck.value <= 0) {
      timeUntilNextCheck.value = Math.ceil(props.checkInterval / 1000);
    }
  }
};

onMounted(() => {
  timer = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.connection-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  background-color: var(--card-background);
  box-shadow: var(--shadow);
}

.status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background-color: var(--success-color);
  box-shadow: 0 0 8px var(--success-color);
}

.status-indicator:not(.connected) {
  background-color: var(--danger-color);
  box-shadow: 0 0 8px var(--danger-color);
}

.status-text {
  font-weight: 500;
  color: var(--text-color);
}

.reconnect-timer {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
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

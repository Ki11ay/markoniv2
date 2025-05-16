<template>
  <div 
    class="connection-status"
    :class="{
      'is-connected': isConnected,
      'is-disconnected': !isConnected
    }"
  >
    <div class="status-icon">
      <i 
        class="fas"
        :class="{
          'fa-link connection-active': isConnected,
          'fa-unlink error-shake': !isConnected
        }"
      ></i>
    </div>
    <div class="status-text">
      {{ isConnected ? 'Connected' : 'Disconnected' }}
    </div>
    <div 
      v-if="!isConnected" 
      class="reconnect-message"
    >
      Attempting to reconnect...
    </div>
  </div>
</template>

<script setup>
defineProps({
  isConnected: {
    type: Boolean,
    required: true
  }
});
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition);
}

.is-connected {
  background: var(--success-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-md);
}

.is-disconnected {
  background: var(--danger-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-md);
  animation: pulse 2s infinite;
  --pulse-color: 239, 68, 68;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
}

.status-icon i {
  font-size: 0.875rem;
}

.status-text {
  font-weight: 600;
}

.reconnect-message {
  font-size: 0.75rem;
  opacity: 0.9;
  animation: fade-in-out 2s ease-in-out infinite;
}

@keyframes fade-in-out {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .connection-status {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-3);
    gap: var(--space-2);
  }

  .status-icon {
    width: 32px;
    height: 32px;
  }

  .status-icon i {
    font-size: 1rem;
  }
}
</style>

<template>
  <div 
    class="slider-container"
    :class="{ 'is-disabled': disabled }"
  >
    <div class="slider-header">
      <label :for="id" class="slider-label">{{ label }}</label>
      <div class="slider-value">
        {{ modelValue }}%
        <span v-if="targetValue !== null && targetValue !== modelValue" class="target-value">
          → {{ targetValue }}%
        </span>
      </div>
    </div>
    
    <div class="slider-wrapper">
      <input
        :id="id"
        type="range"
        min="0"
        max="100"
        step="1"
        :value="modelValue"
        @input="$emit('update:modelValue', Number($event.target.value))"
        @change="$emit('change', Number($event.target.value))"
        :disabled="disabled"
        class="slider"
      />
      <div 
        class="slider-track"
        :style="{
          '--slider-value': `${modelValue}%`,
          '--track-color': getTrackColor(modelValue)
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  targetValue: {
    type: Number,
    default: null
  },
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const getTrackColor = (value) => {
  if (value < 30) return 'var(--primary-light)';
  if (value < 70) return 'var(--primary)';
  return 'var(--primary-dark)';
};
</script>

<style scoped>
.slider-container {
  width: 100%;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.slider-label {
  font-weight: 500;
  color: var(--text-primary);
}

.slider-value {
  font-weight: 600;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.target-value {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-left: var(--space-1);
  animation: fade-in 0.3s ease-out;
}

.slider-wrapper {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: transparent;
  position: relative;
  z-index: 2;
}

.slider-track {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--border-light);
  overflow: hidden;
  z-index: 1;
}

.slider-track::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: var(--slider-value);
  height: 100%;
  background: var(--track-color);
  transition: width var(--transition), background-color var(--transition);
}

/* Thumb Styles */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--primary);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--primary);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

/* Hover States */
.slider:not(:disabled)::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.slider:not(:disabled)::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

/* Active States */
.slider:not(:disabled)::-webkit-slider-thumb:active {
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}

.slider:not(:disabled)::-moz-range-thumb:active {
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}

/* Disabled State */
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.is-disabled .slider::-webkit-slider-thumb {
  background: var(--border-light);
  border-color: var(--border);
  cursor: not-allowed;
}

.is-disabled .slider::-moz-range-thumb {
  background: var(--border-light);
  border-color: var(--border);
  cursor: not-allowed;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<template>
  <div class="slider-wrapper" :class="{ disabled }">
    <div class="slider-header">
      <label :for="id" class="slider-label">{{ label }}</label>
      <div class="slider-value">{{ displayValue }}%</div>
    </div>
    
    <div class="slider-container">
      <input
        :id="id"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :value="modelValue"
        @input="handleInput"
        @change="handleChange"
      />
      
      <div 
        class="slider-progress" 
        :style="{ width: `${modelValue}%` }"
      ></div>
      
      <div 
        class="slider-target" 
        :style="{ left: `${targetValue}%` }"
        :class="{ active: showTarget }"
      >
        <div class="target-value">{{ targetValue }}%</div>
      </div>
      
      <div class="slider-markers">
        <span 
          v-for="marker in markers" 
          :key="marker"
          class="marker"
          :style="{ left: `${marker}%` }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
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
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const displayValue = computed(() => Math.round(props.modelValue));
const showTarget = computed(() => props.targetValue !== null && props.targetValue !== props.modelValue);

// Create markers at each quarter
const markers = computed(() => {
  return [0, 25, 50, 75, 100];
});

const handleInput = (event) => {
  emit('update:modelValue', Number(event.target.value));
};

const handleChange = (event) => {
  emit('change', Number(event.target.value));
};
</script>

<style scoped>
.slider-wrapper {
  width: 100%;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.slider-label {
  color: var(--text-primary);
  font-weight: 500;
}

.slider-value {
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 3rem;
  text-align: right;
}

.slider-container {
  position: relative;
  height: calc(var(--slider-height) + var(--space-8));
  padding-top: var(--space-4);
}

input[type="range"] {
  position: absolute;
  top: var(--space-4);
  left: 0;
  width: 100%;
  z-index: 2;
}

.slider-progress {
  position: absolute;
  top: var(--space-4);
  left: 0;
  height: var(--slider-height);
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  pointer-events: none;
  transition: width var(--transition);
}

.slider-target {
  position: absolute;
  top: 0;
  width: 2px;
  height: calc(var(--slider-height) + var(--space-2));
  background-color: var(--success);
  transform: translateX(-50%);
  transition: left var(--transition);
  opacity: 0;
  pointer-events: none;
}

.slider-target.active {
  opacity: 1;
}

.target-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--success);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  white-space: nowrap;
}

.slider-markers {
  position: absolute;
  top: var(--space-4);
  left: 0;
  right: 0;
  height: var(--slider-height);
  pointer-events: none;
}

.marker {
  position: absolute;
  width: 2px;
  height: var(--slider-height);
  background-color: var(--border-color);
  transform: translateX(-50%);
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled input[type="range"] {
  cursor: not-allowed;
}

/* Slider track styling for Firefox */
input[type="range"]::-moz-range-track {
  width: 100%;
  height: var(--slider-height);
  background: var(--slider-track-color);
  border-radius: var(--radius-full);
  border: none;
}

/* Slider thumb styling for Firefox */
input[type="range"]::-moz-range-thumb {
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  background: var(--slider-thumb-color);
  border: none;
  border-radius: 50%;
  box-shadow: var(--slider-thumb-shadow);
  cursor: pointer;
  transition: var(--transition);
}

input[type="range"]::-moz-range-thumb:hover {
  box-shadow: var(--slider-thumb-shadow-active);
  transform: scale(1.1);
}

input[type="range"]::-moz-range-thumb:active {
  transform: scale(1.2);
}
</style>

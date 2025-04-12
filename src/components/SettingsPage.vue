<template>
  <div class="settings-page">
    <h1>Settings</h1>
    
    <div class="settings-section">
      <h2>Appearance</h2>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-moon"></i>
          <span>Dark Mode</span>
        </div>
        <label class="toggle">
          <input type="checkbox" :checked="isDarkMode" @change="toggleDarkMode">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h2>Temperature Settings</h2>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-thermometer-full"></i>
          <span>Maximum Temperature</span>
        </div>
        <input 
          type="number" 
          v-model="settings.maxTemp" 
          class="number-input"
          min="0"
          max="50"
          step="0.1"
        > °C
      </div>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-thermometer-half"></i>
          <span>Optimal Temperature</span>
        </div>
        <input 
          type="number" 
          v-model="settings.optimalTemp" 
          class="number-input"
          min="0"
          max="50"
          step="0.1"
        > °C
      </div>
    </div>

    <div class="settings-section">
      <h2>Optimal Mode Configuration</h2>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-fan"></i>
          <span>Optimal Dry Fan Speed</span>
        </div>
        <div class="input-with-unit">
          <input 
            type="number" 
            v-model="settings.optimalDryFan"
            class="number-input"
            min="0"
            max="100"
          >
          <span class="unit">%</span>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-fan"></i>
          <span>Optimal Wet Fan Speed</span>
        </div>
        <div class="input-with-unit">
          <input 
            type="number" 
            v-model="settings.optimalWetFan"
            class="number-input"
            min="0"
            max="100"
          >
          <span class="unit">%</span>
        </div>
      </div>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-tint"></i>
          <span>Enable Pump in Optimal Mode</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.optimalPump">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h2>System Preferences</h2>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-magic"></i>
          <span>Auto-enable Optimal Mode on High Temperature</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.autoOptimal">
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-label">
          <i class="fas fa-bell"></i>
          <span>Enable System Notifications</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.notifications">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-actions">
      <button class="button secondary" @click="resetSettings">
        <i class="fas fa-undo"></i>
        Reset to Defaults
      </button>
      <button class="button primary" @click="saveSettings" :disabled="saving">
        <i class="fas fa-save"></i>
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getDatabase, ref as dbRef, get, set } from 'firebase/database';
import { useFirebase } from '../composables/useFirebase';

const { database } = useFirebase();
const isDarkMode = ref(document.documentElement.getAttribute('data-theme') === 'dark');
const saving = ref(false);

const settings = ref({
  maxTemp: 30,
  optimalTemp: 25,
  optimalDryFan: 50,
  optimalWetFan: 50,
  optimalPump: false,
  autoOptimal: true,
  notifications: true
});

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

// Watch for theme changes from other components
watch(() => document.documentElement.getAttribute('data-theme'), (newTheme) => {
  isDarkMode.value = newTheme === 'dark';
});

async function loadSettings() {
  try {
    const snapshot = await get(dbRef(database, 'settings'));
    if (snapshot.exists()) {
      settings.value = { ...settings.value, ...snapshot.val() };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  try {
    saving.value = true;
    await set(dbRef(database, 'settings'), settings.value);
  } catch (error) {
    console.error('Failed to save settings:', error);
  } finally {
    saving.value = false;
  }
}

function resetSettings() {
  settings.value = {
    maxTemp: 30,
    optimalTemp: 25,
    optimalDryFan: 50,
    optimalWetFan: 50,
    optimalPump: false,
    autoOptimal: true,
    notifications: true
  };
}

onMounted(loadSettings);
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

h1 {
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}

.settings-section {
  background: var(--card-background);
  border-radius: var(--radius);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow);
}

h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.setting-label i {
  width: 24px;
  text-align: center;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: .4s;
  border-radius: 34px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Add animation for the toggle */
.slider:before {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

/* Number Input */
.input-with-unit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.number-input {
  width: 80px;
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-primary);
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.unit {
  color: var(--text-secondary);
}

/* Action Buttons */
.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button i {
  font-size: 1rem;
}

.button.primary {
  background: var(--primary-color);
  color: white;
}

.button.primary:hover {
  background: var(--primary-dark);
}

.button.secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.button.secondary:hover {
  background: var(--surface-hover);
}

.button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .settings-page {
    padding: var(--space-4);
  }

  .settings-section {
    padding: var(--space-4);
  }

  .settings-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .setting-item .toggle, 
  .setting-item .input-with-unit {
    width: 100%;
    margin-top: var(--space-2);
  }

  .number-input {
    width: 100%;
  }
}
</style> 
<template>
  <div class="settings">
    <header class="header">
      <h1>System Settings</h1>
      <button class="back-button" @click="$router.push('/')">
        <i class="fas fa-arrow-left"></i>
        Back to Dashboard
      </button>
    </header>

    <div class="settings-container card">
      <form @submit.prevent="saveSettings" class="settings-form">
        <div class="settings-group">
          <h2>Temperature Settings</h2>
          
          <div class="form-group">
            <label for="maxTemp">Maximum Temperature (°C)</label>
            <input
              id="maxTemp"
              type="number"
              v-model.number="settings.maxTemp"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label for="optimalTemp">Optimal Temperature (°C)</label>
            <input
              id="optimalTemp"
              type="number"
              v-model.number="settings.optimalTemp"
              step="0.1"
              required
            />
          </div>
        </div>

        <div class="settings-group">
          <h2>Optimal Mode Configuration</h2>
          
          <div class="form-group">
            <label for="optimalDryFan">Optimal Dry Fan Speed (%)</label>
            <input
              id="optimalDryFan"
              type="number"
              v-model.number="settings.optimalDryFan"
              min="0"
              max="100"
              required
            />
          </div>

          <div class="form-group">
            <label for="optimalWetFan">Optimal Wet Fan Speed (%)</label>
            <input
              id="optimalWetFan"
              type="number"
              v-model.number="settings.optimalWetFan"
              min="0"
              max="100"
              required
            />
          </div>

          <div class="form-group checkbox-group">
            <label for="optimalPump">
              <input
                id="optimalPump"
                type="checkbox"
                v-model="settings.optimalPump"
              />
              Enable Pump in Optimal Mode
            </label>
          </div>
        </div>

        <div class="settings-group">
          <h2>System Preferences</h2>
          
          <div class="form-group checkbox-group">
            <label for="autoOptimal">
              <input
                id="autoOptimal"
                type="checkbox"
                v-model="settings.autoOptimal"
              />
              Auto-enable Optimal Mode on High Temperature
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label for="notifications">
              <input
                id="notifications"
                type="checkbox"
                v-model="settings.notifications"
              />
              Enable System Notifications
            </label>
          </div>
        </div>

        <div v-if="error" class="error-text">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" class="reset-button" @click="resetSettings">
            Reset to Defaults
          </button>
          <button type="submit" class="save-button" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDatabase, ref as dbRef, get, set } from 'firebase/database';
import { useFirebase } from '../composables/useFirebase';

const { database } = useFirebase();

const settings = ref({
  maxTemp: 30,
  optimalTemp: 25,
  optimalDryFan: 50,
  optimalWetFan: 50,
  optimalPump: false,
  autoOptimal: true,
  notifications: true
});

const error = ref(null);
const saving = ref(false);

const loadSettings = async () => {
  try {
    const snapshot = await get(dbRef(database, 'settings'));
    if (snapshot.exists()) {
      settings.value = { ...settings.value, ...snapshot.val() };
    }
  } catch (e) {
    error.value = 'Failed to load settings: ' + e.message;
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    error.value = null;
    await set(dbRef(database, 'settings'), settings.value);
  } catch (e) {
    error.value = 'Failed to save settings: ' + e.message;
  } finally {
    saving.value = false;
  }
};

const resetSettings = () => {
  settings.value = {
    maxTemp: 30,
    optimalTemp: 25,
    optimalDryFan: 50,
    optimalWetFan: 50,
    optimalPump: false,
    autoOptimal: true,
    notifications: true
  };
};

onMounted(loadSettings);
</script>

<style scoped>
.settings {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--secondary-color);
  color: white;
}

.settings-container {
  padding: 2rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-group h2 {
  color: var(--primary-color);
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

input[type="number"] {
  max-width: 200px;
}

input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
  min-width: 120px;
}

.reset-button {
  background-color: var(--secondary-color);
  color: white;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .settings-container {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-button, .reset-button {
    width: 100%;
  }
}
</style>

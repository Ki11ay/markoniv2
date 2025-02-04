<template>
  <div class="dashboard container">
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h1>AC Control Dashboard</h1>
          <connection-status :is-connected="systemState.isSystemConnected" />
        </div>
        <div class="header-actions">
          <button class="settings-button hover-lift ripple" @click="$router.push('/settings')">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </button>
          <button class="logout-button hover-lift ripple" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <div class="status-cards">
      <div 
        class="status-card cold-temp" 
        :class="{ disconnected: !systemState.isSystemConnected }"
      >
        <div class="sensor-info">
          <i class="fas fa-thermometer-half"></i>
          <h3>Cold Air (Outlet)</h3>
        </div>
        <div class="sensor-value">
          {{ systemState.dryOutletTemp?.toFixed(2) || '--' }}°C
          <span class="trend-indicator">
            <i class="fas fa-arrow-down"></i>
          </span>
        </div>
      </div>

      <div 
        class="status-card hot-temp" 
        :class="{ disconnected: !systemState.isSystemConnected }"
      >
        <div class="sensor-info">
          <i class="fas fa-thermometer-full"></i>
          <h3>Hot Air (Inlet)</h3>
        </div>
        <div class="sensor-value">
          {{ systemState.inletTemp?.toFixed(2) || '--' }}°C
          <span class="trend-indicator">
            <i class="fas fa-arrow-up"></i>
          </span>
        </div>
      </div>

      <div class="status-card">
        <div class="sensor-info">
          <i class="fas fa-fan fa-spin"></i>
          <h3>Dry Fan</h3>
        </div>
        <div class="sensor-value">{{ systemState.dryFanSpeed }}%</div>
      </div>

      <div class="status-card">
        <div class="sensor-info">
          <i class="fas fa-fan fa-spin"></i>
          <h3>Wet Fan</h3>
        </div>
        <div class="sensor-value">{{ systemState.wetFanSpeed }}%</div>
      </div>
    </div>

    <div class="controls-section card">
      <loading-spinner 
        :loading="isSyncing" 
        message="Updating controls..." 
        :contained="true" 
      />
      
      <h2>System Controls</h2>
      
      <div class="fan-controls">
        <custom-slider
          v-model="localDryFanSpeed"
          :target-value="systemState.dryFanSpeed"
          label="Dry Fan Speed"
          id="dry-fan"
          @update:modelValue="handleDryFanInput"
          @change="updateDryFan"
          :disabled="systemState.isOptimalMode || isSyncing"
        />

        <custom-slider
          v-model="localWetFanSpeed"
          :target-value="systemState.wetFanSpeed"
          label="Wet Fan Speed"
          id="wet-fan"
          @update:modelValue="handleWetFanInput"
          @change="updateWetFan"
          :disabled="systemState.isOptimalMode || isSyncing"
        />
      </div>

      <div class="action-buttons">
        <button 
          class="pump-button ripple hover-lift"
          :class="{ active: systemState.isPumpActive }"
          @click="togglePump"
          :disabled="systemState.isOptimalMode || isSyncing"
        >
          <i class="fas fa-tint"></i>
          <span>{{ systemState.isPumpActive ? 'Pump On' : 'Pump Off' }}</span>
        </button>

        <button 
          class="optimal-button ripple hover-lift"
          :class="{ active: systemState.isOptimalMode }"
          @click="toggleOptimalMode"
          :disabled="isSyncing"
        >
          <i class="fas fa-magic"></i>
          <span>{{ systemState.isOptimalMode ? 'Optimal Mode On' : 'Optimal Mode Off' }}</span>
        </button>

        <button 
          class="stop-button ripple hover-lift" 
          @click="handleEmergencyStop"
          :disabled="isSyncing"
        >
          <i class="fas fa-stop"></i>
          <span>Emergency Stop</span>
        </button>
      </div>
    </div>

    <div class="temperature-history card">
      <div class="history-header">
        <h2>Temperature History</h2>
        <button 
          class="export-button hover-lift ripple"
          @click="exportTemperatureLog"
          :disabled="!temperatureLog.length"
          title="Export temperature log to CSV"
        >
          <i class="fas fa-download"></i>
          <span>Export Data</span>
        </button>
      </div>
      <div class="chart-container">
        <temperature-chart :temperature-log="temperatureLog" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import CustomSlider from '../components/CustomSlider.vue';
import { useSystemControl } from '../composables/useSystemControl';
import { useFirebase } from '../composables/useFirebase';
import TemperatureChart from '../components/TemperatureChart.vue';
import { convertToCSV, downloadCSV, generateTimestampedFilename } from '../utils/csvExport';

const { systemState, temperatureLog, setFanSpeed, togglePump: togglePumpState, setOptimalMode, emergencyStop } = useSystemControl();
const { logoutUser } = useFirebase();

// Local state for fan speeds
const localDryFanSpeed = ref(systemState.value.dryFanSpeed);
const localWetFanSpeed = ref(systemState.value.wetFanSpeed);
const isSyncing = ref(false);

// Watch for system state changes
watch(() => systemState.value.dryFanSpeed, (newSpeed) => {
  if (!isSyncing.value) {
    localDryFanSpeed.value = newSpeed;
  }
});

watch(() => systemState.value.wetFanSpeed, (newSpeed) => {
  if (!isSyncing.value) {
    localWetFanSpeed.value = newSpeed;
  }
});

// Methods for handling fan speed changes
const handleDryFanInput = (value) => {
  localDryFanSpeed.value = value;
  // Don't update Firebase on every input change
};

const handleWetFanInput = (value) => {
  localWetFanSpeed.value = value;
  // Don't update Firebase on every input change
};

const updateDryFan = async (value) => {
  isSyncing.value = true;
  try {
    await setFanSpeed('dry', value);
    localDryFanSpeed.value = value; // Update local value after successful Firebase update
  } catch (error) {
    console.error('Failed to update dry fan:', error);
    // Revert to previous value on error
    localDryFanSpeed.value = systemState.value.dryFanSpeed;
  } finally {
    isSyncing.value = false;
  }
};

const updateWetFan = async (value) => {
  isSyncing.value = true;
  try {
    await setFanSpeed('wet', value);
    localWetFanSpeed.value = value; // Update local value after successful Firebase update
  } catch (error) {
    console.error('Failed to update wet fan:', error);
    // Revert to previous value on error
    localWetFanSpeed.value = systemState.value.wetFanSpeed;
  } finally {
    isSyncing.value = false;
  }
};

// Other control methods
const togglePump = async () => {
  isSyncing.value = true;
  await togglePumpState();
  isSyncing.value = false;
};

const toggleOptimalMode = async () => {
  isSyncing.value = true;
  await setOptimalMode(!systemState.value.isOptimalMode);
  isSyncing.value = false;
};

const handleEmergencyStop = async () => {
  isSyncing.value = true;
  await emergencyStop();
  isSyncing.value = false;
};

const handleLogout = () => logoutUser();

const exportTemperatureLog = () => {
  if (!temperatureLog.value.length) return;
  
  const csvContent = convertToCSV(temperatureLog.value);
  const filename = generateTimestampedFilename();
  downloadCSV(csvContent, filename);
};

// Initialize fan speeds when component mounts
onMounted(() => {
  localDryFanSpeed.value = systemState.value.dryFanSpeed;
  localWetFanSpeed.value = systemState.value.wetFanSpeed;
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-4);
  min-height: 100vh;
  background-color: var(--background);
}

.header {
  margin-bottom: var(--space-4);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.settings-button {
  background: var(--secondary);
  color: white;
}

.logout-button {
  background: var(--danger);
  color: white;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}

.status-card {
  padding: var(--space-6);
  border-radius: var(--radius);
  background: var(--card-background);
  box-shadow: var(--shadow);
  text-align: center;
  transition: var(--transition);
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.status-card.disconnected {
  opacity: 0.7;
  border: 2px solid var(--danger);
}

.sensor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.sensor-info i {
  font-size: 2rem;
}

.hot-temp {
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
}

.hot-temp .sensor-info i,
.hot-temp .trend-indicator {
  color: var(--danger);
}

.cold-temp {
  background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
}

.cold-temp .sensor-info i,
.cold-temp .trend-indicator {
  color: var(--primary);
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  font-size: 1rem;
}

.sensor-info h3 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.sensor-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: var(--transition);
}

.controls-section {
  padding: var(--space-8);
  position: relative;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-6) 0;
}

.fan-controls {
  display: grid;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: center;
}

button {
  padding: var(--space-3) var(--space-6);
  font-size: 1rem;
}

button i {
  font-size: 1.1rem;
}

.pump-button {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
}

.pump-button.active {
  animation: pulse 2s infinite;
}

.optimal-button {
  background: var(--primary-gradient);
  color: white;
}

.optimal-button.active {
  background: var(--success-gradient);
  animation: pulse 2s infinite;
}

.stop-button {
  background: var(--danger-gradient);
  color: white;
}

.temperature-history {
  padding: var(--space-8);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.export-button {
  background: var(--secondary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.export-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.export-button i {
  font-size: 1rem;
}

.chart-container {
  height: 400px;
  margin-top: var(--space-6);
  background: var(--surface);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow-inner);
}

.relative {
  position: relative;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-title {
    flex-direction: column;
    gap: var(--space-2);
  }

  .action-buttons {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  .controls-section {
    padding: var(--space-4);
  }

  .temperature-history {
    padding: var(--space-4);
  }
}

/* Animations */
.fa-spin {
  animation: fa-spin 2s linear infinite;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>

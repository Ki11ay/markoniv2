<template>
  <div class="dashboard">
    <header class="header">
      <h1>AC Control Dashboard</h1>
      <div class="header-actions">
        <button class="settings-button" @click="$router.push('/settings')">
          <i class="fas fa-cog"></i>
          Settings
        </button>
        <button class="logout-button" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </header>

    <div class="status-cards">
      <div class="status-card" :class="{ disconnected: !systemState.isSystemConnected }">
        <div class="sensor-info">
          <i class="fas fa-thermometer-half"></i>
          <h3>Dry Outlet</h3>
        </div>
        <div class="sensor-value">
          {{ systemState.dryOutletTemp?.toFixed(2) || '--' }}°C
        </div>
      </div>

      <div class="status-card" :class="{ disconnected: !systemState.isSystemConnected }">
        <div class="sensor-info">
          <i class="fas fa-thermometer-half"></i>
          <h3>Inlet</h3>
        </div>
        <div class="sensor-value">
          {{ systemState.inletTemp?.toFixed(2) || '--' }}°C
        </div>
      </div>

      <div class="status-card">
        <div class="sensor-info">
          <i class="fas fa-fan"></i>
          <h3>Dry Fan</h3>
        </div>
        <div class="sensor-value">{{ systemState.dryFanSpeed }}%</div>
      </div>

      <div class="status-card">
        <div class="sensor-info">
          <i class="fas fa-fan"></i>
          <h3>Wet Fan</h3>
        </div>
        <div class="sensor-value">{{ systemState.wetFanSpeed }}%</div>
      </div>
    </div>

    <div class="controls-section card">
      <h2>System Controls</h2>
      
      <div class="fan-controls">
        <div class="control-group">
          <label>Dry Fan Speed</label>
          <input 
            type="range" 
            v-model.number="dryFanSpeed" 
            @change="updateDryFan"
            :disabled="systemState.isOptimalMode"
            min="0"
            max="100"
          />
          <span class="value-display">{{ dryFanSpeed }}%</span>
        </div>

        <div class="control-group">
          <label>Wet Fan Speed</label>
          <input 
            type="range" 
            v-model.number="wetFanSpeed" 
            @change="updateWetFan"
            :disabled="systemState.isOptimalMode"
            min="0"
            max="100"
          />
          <span class="value-display">{{ wetFanSpeed }}%</span>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          class="pump-button"
          :class="{ active: systemState.isPumpActive }"
          @click="togglePump"
          :disabled="systemState.isOptimalMode"
        >
          <i class="fas fa-tint"></i>
          {{ systemState.isPumpActive ? 'Pump On' : 'Pump Off' }}
        </button>

        <button 
          class="optimal-button"
          :class="{ active: systemState.isOptimalMode }"
          @click="toggleOptimalMode"
        >
          <i class="fas fa-magic"></i>
          {{ systemState.isOptimalMode ? 'Optimal Mode On' : 'Optimal Mode Off' }}
        </button>

        <button class="stop-button" @click="handleEmergencyStop">
          <i class="fas fa-stop"></i>
          Emergency Stop
        </button>
      </div>
    </div>

    <div class="temperature-history card">
      <h2>Temperature History</h2>
      <div class="chart-container">
        <line-chart :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import { useSystemControl } from '../composables/useSystemControl';
import { useFirebase } from '../composables/useFirebase';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { systemState, setFanSpeed, togglePump: togglePumpState, setOptimalMode, emergencyStop } = useSystemControl();
const { logoutUser } = useFirebase();

// Local state
const dryFanSpeed = ref(systemState.value.dryFanSpeed);
const wetFanSpeed = ref(systemState.value.wetFanSpeed);

// Methods
const updateDryFan = () => setFanSpeed('dry', dryFanSpeed.value);
const updateWetFan = () => setFanSpeed('wet', wetFanSpeed.value);
const togglePump = () => togglePumpState();
const toggleOptimalMode = () => setOptimalMode(!systemState.value.isOptimalMode);
const handleEmergencyStop = () => emergencyStop();
const handleLogout = () => logoutUser();

// Chart data
const chartData = computed(() => ({
  labels: ['12:00', '12:05', '12:10', '12:15', '12:20'], // Replace with actual timestamps
  datasets: [
    {
      label: 'Inlet Temperature',
      borderColor: '#e74c3c',
      data: [25, 26, 25.5, 25.8, 26.2], // Replace with actual temperature data
      tension: 0.4
    },
    {
      label: 'Dry Outlet Temperature',
      borderColor: '#3498db',
      data: [22, 23, 22.5, 22.8, 23.2], // Replace with actual temperature data
      tension: 0.4
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Temperature (°C)'
      }
    }
  }
};

// Update fan speed displays when system state changes
onMounted(() => {
  dryFanSpeed.value = systemState.value.dryFanSpeed;
  wetFanSpeed.value = systemState.value.wetFanSpeed;
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.settings-button {
  background-color: var(--secondary-color);
  color: white;
}

.logout-button {
  background-color: var(--danger-color);
  color: white;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.status-card {
  padding: 1.5rem;
  border-radius: var(--border-radius);
  background: var(--card-background);
  box-shadow: var(--shadow);
  text-align: center;
}

.status-card.disconnected .sensor-value {
  color: var(--danger-color);
}

.sensor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sensor-info i {
  font-size: 1.5rem;
  color: var(--secondary-color);
}

.sensor-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.controls-section {
  padding: 2rem;
}

.fan-controls {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.control-group {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  align-items: center;
  gap: 1rem;
}

.value-display {
  text-align: center;
  background: var(--primary-color);
  color: white;
  padding: 0.4rem;
  border-radius: 20px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.pump-button {
  background-color: #9b59b6;
  color: white;
}

.pump-button.active {
  background-color: #8e44ad;
}

.optimal-button {
  background-color: var(--primary-color);
  color: white;
}

.optimal-button.active {
  background-color: #27ae60;
}

.stop-button {
  background-color: var(--danger-color);
  color: white;
}

.temperature-history {
  padding: 2rem;
}

.chart-container {
  height: 400px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .control-group {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>

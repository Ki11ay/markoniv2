<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3>Psychrometric Process</h3>
      <div class="legend">
        <div class="legend-item">
          <div class="point inlet"></div>
          <span>Inlet Air (Hot)</span>
        </div>
        <div class="legend-item">
          <div class="point outlet"></div>
          <span>Outlet Air (Cold)</span>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <line-chart :data="chartData" :options="chartOptions" />
    </div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Inlet Air</div>
        <div class="metric-values">
          <div>Temperature: {{ formatNumber(inletTemp) }}°C</div>
          <div>Humidity: {{ formatNumber(inletHumidity) }}%</div>
          <div>Dew Point: {{ formatNumber(inletDewPoint) }}°C</div>
          <div>Wet Bulb: {{ formatNumber(inletWetBulb) }}°C</div>
          <div>Enthalpy: {{ formatNumber(inletEnthalpy) }} kJ/kg</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Outlet Air</div>
        <div class="metric-values">
          <div>Temperature: {{ formatNumber(outletTemp) }}°C</div>
          <div>Humidity: {{ formatNumber(outletHumidity) }}%</div>
          <div>Dew Point: {{ formatNumber(outletDewPoint) }}°C</div>
          <div>Wet Bulb: {{ formatNumber(outletWetBulb) }}°C</div>
          <div>Enthalpy: {{ formatNumber(outletEnthalpy) }} kJ/kg</div>
        </div>
      </div>
      <div class="metric-card performance">
        <div class="metric-title">System Performance</div>
        <div class="metric-values">
          <div class="cop-value">
            <span>COP:</span>
            <span :class="copClass">{{ formatNumber(cop) }}</span>
          </div>
          <div>Cooling Effect: {{ formatNumber(coolingEffect) }} W</div>
          <div>Mass Flow Rate: {{ formatNumber(massFlowRate) }} kg/s</div>
          <div class="power-consumption">
            <div>Power Consumption:</div>
            <div>Total: {{ powerConsumption.total }}W</div>
            <div>Dry Fan: {{ powerConsumption.dryFan }}W</div>
            <div>Wet Fan: {{ powerConsumption.wetFan }}W</div>
            <div>Pump: {{ powerConsumption.pump }}W</div>
          </div>
        </div>
      </div>
    </div>
    <TechnicalDetails
      :cop="cop"
      :cooling-effect="coolingEffect"
      :power-consumption="powerConsumption"
      :mass-flow-rate="massFlowRate"
      :effectiveness="effectiveness"
      :temperatures="temperatures"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import TechnicalDetails from './TechnicalDetails.vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  inletTemp: { type: Number, default: null },
  outletTemp: { type: Number, default: null },
  inletHumidity: { type: Number, default: null },
  outletHumidity: { type: Number, default: null },
  inletDewPoint: { type: Number, default: null },
  outletDewPoint: { type: Number, default: null },
  inletWetBulb: { type: Number, default: null },
  outletWetBulb: { type: Number, default: null },
  inletEnthalpy: { type: Number, default: null },
  outletEnthalpy: { type: Number, default: null },
  cop: { type: Number, default: null },
  coolingEffect: { type: Number, default: null },
  powerConsumption: {
    type: Object,
    default: () => ({
      total: 0,
      dryFan: 0,
      wetFan: 0,
      pump: 0
    })
  },
  massFlowRate: { type: Number, default: null },
  effectiveness: {
    type: Object,
    default: () => ({
      wetBulb: 0,
      dewPoint: 0
    })
  },
  temperatures: {
    type: Object,
    default: () => ({
      inletWetBulb: 0,
      inletDewPoint: 0
    })
  }
});

const formatNumber = (value) => {
  if (value === null || value === undefined) return '--';
  return typeof value === 'number' ? value.toFixed(2) : value;
};

const copClass = computed(() => {
  if (!props.cop) return '';
  if (props.cop >= 3) return 'text-success';
  if (props.cop >= 2) return 'text-warning';
  return 'text-danger';
});

const chartData = computed(() => {
  // Create data points for psychrometric chart
  const data = {
    labels: ['Inlet', 'Outlet'],
    datasets: [
      {
        label: 'Process Path',
        data: [
          { x: props.inletTemp || 0, y: props.inletHumidity || 0 },
          { x: props.outletTemp || 0, y: props.outletHumidity || 0 }
        ],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBorderColor: ['#e74c3c', '#3498db'],
        pointBackgroundColor: ['#e74c3c', '#3498db']
      }
    ]
  };

  return data;
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Dry Bulb Temperature (°C)',
        font: {
          size: 12,
          family: "'Poppins', sans-serif"
        }
      },
      min: 0,
      max: 50
    },
    y: {
      title: {
        display: true,
        text: 'Relative Humidity (%)',
        font: {
          size: 12,
          family: "'Poppins', sans-serif"
        }
      },
      min: 0,
      max: 100
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const point = context.raw;
          return `Temperature: ${point.x.toFixed(1)}°C, Humidity: ${point.y.toFixed(1)}%`;
        }
      }
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  background: var(--card-background);
  border-radius: var(--radius);
  padding: var(--space-6);
  box-shadow: var(--shadow);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.legend {
  display: flex;
  gap: var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.inlet {
  background: var(--danger);
}

.outlet {
  background: var(--primary);
}

.chart-container {
  height: 400px;
  margin-bottom: var(--space-6);
  background: var(--surface);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow-inner);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.metric-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: var(--space-4);
}

.metric-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  font-size: 1.1rem;
}

.metric-values {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--text-secondary);
}

.cop-value {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 600;
}

.text-success {
  color: var(--success);
}

.text-warning {
  color: var(--warning);
}

.text-danger {
  color: var(--danger);
}

.power-consumption {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .legend {
    flex-direction: column;
    gap: var(--space-2);
  }

  .chart-container {
    height: 300px;
  }
}
</style>

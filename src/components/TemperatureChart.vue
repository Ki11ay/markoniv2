<template>
  <div class="chart-wrapper">
    <line-chart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  temperatureLog: {
    type: Array,
    required: true
  }
});

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const chartData = computed(() => {
  const labels = props.temperatureLog.map(log => formatTime(log.timestamp));

  return {
    labels,
    datasets: [
      {
        label: 'Hot Air (Inlet)',
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        data: props.temperatureLog.map(log => log.inlet),
        tension: 0.4,
        fill: true
      },
      {
        label: 'Cold Air (Outlet)',
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        data: props.temperatureLog.map(log => log.dryOutlet),
        tension: 0.4,
        fill: true
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: "'Poppins', sans-serif"
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1,
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold',
        family: "'Poppins', sans-serif"
      },
      bodyFont: {
        size: 13,
        family: "'Poppins', sans-serif"
      },
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.y?.toFixed(2) || '';
          return `${label}: ${value}°C`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          family: "'Poppins', sans-serif"
        }
      }
    },
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          family: "'Poppins', sans-serif"
        },
        callback: (value) => `${value}°C`
      }
    }
  },
  animations: {
    tension: {
      duration: 1000,
      easing: 'linear'
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>

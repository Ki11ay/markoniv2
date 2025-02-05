<template>
  <div class="technical-details">
    <div class="details-header" @click="isExpanded = !isExpanded">
      <h3>Technical Details</h3>
      <span class="expand-icon" :class="{ expanded: isExpanded }">▼</span>
    </div>

    <div class="details-content" v-show="isExpanded">
      <div class="section">
        <div class="section-header" @click="sections.massFlow = !sections.massFlow">
          <h4>Mass Flow & Power</h4>
          <span class="expand-icon" :class="{ expanded: sections.massFlow }">▼</span>
        </div>
        <div class="section-content" v-show="sections.massFlow">
          <div class="formula">
            <h5>Mass Flow Rate</h5>
            <div class="formula-text">ṁ = 0.259 × (fan_speed/50) kg/s</div>
            <div class="current-value">Current: {{ massFlowRate }} kg/s</div>
          </div>
          <div class="formula">
            <h5>Power Consumption</h5>
            <div class="formula-text">P_total = P_dry + P_wet + P_pump</div>
            <div class="current-value">
              Total: {{ powerConsumption.total }}W
              (Dry: {{ powerConsumption.dryFan }}W,
              Wet: {{ powerConsumption.wetFan }}W,
              Pump: {{ powerConsumption.pump }}W)
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" @click="sections.cooling = !sections.cooling">
          <h4>Cooling Performance</h4>
          <span class="expand-icon" :class="{ expanded: sections.cooling }">▼</span>
        </div>
        <div class="section-content" v-show="sections.cooling">
          <div class="formula">
            <h5>Coefficient of Performance (COP)</h5>
            <div class="formula-text">COP = (ṁ × cp × ΔT) / P_total</div>
            <div class="formula-description">
              cp = 1.005 kJ/kg·K (specific heat of air)
              ΔT = T_inlet - T_outlet
            </div>
            <div class="current-value">Current COP: {{ cop }}</div>
          </div>
          <div class="formula">
            <h5>Cooling Effect</h5>
            <div class="formula-text">Q = ṁ × cp × (T_inlet - T_outlet)</div>
            <div class="current-value">Current: {{ coolingEffect }} W</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" @click="sections.effectiveness = !sections.effectiveness">
          <h4>System Effectiveness</h4>
          <span class="expand-icon" :class="{ expanded: sections.effectiveness }">▼</span>
        </div>
        <div class="section-content" v-show="sections.effectiveness">
          <div class="formula">
            <h5>Wet Bulb Effectiveness</h5>
            <div class="formula-text">ε_wb = (T_inlet - T_outlet) / (T_inlet - T_wb_inlet)</div>
            <div class="current-value">
              Current: {{ effectiveness.wetBulb }}
              (T_wb_inlet = {{ temperatures.inletWetBulb }}°C)
            </div>
          </div>
          <div class="formula">
            <h5>Dew Point Effectiveness</h5>
            <div class="formula-text">ε_dp = (T_inlet - T_outlet) / (T_inlet - T_dp_inlet)</div>
            <div class="current-value">
              Current: {{ effectiveness.dewPoint }}
              (T_dp_inlet = {{ temperatures.inletDewPoint }}°C)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  cop: { type: Number, required: true },
  coolingEffect: { type: Number, required: true },
  powerConsumption: {
    type: Object,
    required: true,
    validator: (obj) => {
      return ['total', 'dryFan', 'wetFan', 'pump'].every(key => key in obj);
    }
  },
  massFlowRate: { type: Number, required: true },
  effectiveness: {
    type: Object,
    required: true,
    validator: (obj) => {
      return ['wetBulb', 'dewPoint'].every(key => key in obj);
    }
  },
  temperatures: {
    type: Object,
    required: true,
    validator: (obj) => {
      return ['inletWetBulb', 'inletDewPoint'].every(key => key in obj);
    }
  }
});

const isExpanded = ref(false);
const sections = ref({
  massFlow: true,
  cooling: true,
  effectiveness: true
});
</script>

<style scoped>
.technical-details {
  background: var(--card-background);
  border-radius: var(--radius);
  margin-top: var(--space-4);
  box-shadow: var(--shadow);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  cursor: pointer;
  user-select: none;
}

.details-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.details-content {
  padding: var(--space-4);
  border-top: 1px solid var(--border);
}

.section {
  margin-bottom: var(--space-4);
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: var(--space-2);
  background: var(--surface);
  border-radius: var(--radius);
}

.section-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.section-content {
  padding: var(--space-4);
  background: var(--card-background);
  border-radius: 0 0 var(--radius) var(--radius);
}

.formula {
  margin-bottom: var(--space-4);
}

.formula:last-child {
  margin-bottom: 0;
}

.formula h5 {
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.formula-text {
  font-family: monospace;
  background: var(--surface);
  padding: var(--space-2);
  border-radius: var(--radius);
  margin-bottom: var(--space-2);
  white-space: pre-wrap;
}

.formula-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.current-value {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.expand-icon {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}
</style>

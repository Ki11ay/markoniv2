import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { ref as dbRef, onValue, set, get } from 'firebase/database';
import {
  calcDewPoint,
  calcWetBulb,
  calcEnthalpy,
  calculateCOP
} from '../utils/psychrometrics';

export function useSystemControl() {
  const database = inject('database');
  
  if (!database) {
    console.error('Firebase database not properly initialized');
    throw new Error('Firebase not properly initialized');
  }
  
  const systemState = ref({
    // Temperature and Humidity
    dryOutletTemp: null,
    inletTemp: null,
    intakeHumidity: null,
    outtakeHumidity: null,

    // Fan and Pump States
    dryFanSpeed: 0,
    wetFanSpeed: 0,
    isPumpActive: false,
    isOptimalMode: false,

    // Calculated Values
    inletDewPoint: null,
    outletDewPoint: null,
    inletWetBulb: null,
    outletWetBulb: null,
    inletEnthalpy: null,
    outletEnthalpy: null,
    cop: null,
    coolingEffect: null,
    massFlowRate: null,
    effectiveness: {
      wetBulb: null,
      dewPoint: null
    },
    temperatures: {
      inletWetBulb: null,
      inletDewPoint: null
    },
    powerConsumption: {
      total: 0,
      dryFan: 0,
      wetFan: 0,
      pump: 0
    },

    // System Status
    isSystemConnected: false,
    lastAliveTimestamp: null
  });

  const temperatureLog = ref([]);
  const error = ref(null);
  let connectionCheckInterval = null;

  // Update psychrometric values
  const updatePsychrometricValues = () => {
    const {
      inletTemp,
      dryOutletTemp,
      intakeHumidity,
      outtakeHumidity,
      dryFanSpeed,
      wetFanSpeed,
      isPumpActive
    } = systemState.value;

    // Only update if we have all required values
    if (inletTemp != null && 
        dryOutletTemp != null && 
        intakeHumidity != null && 
        outtakeHumidity != null) {
      
      // Calculate dew points
      const inletDewPoint = calcDewPoint(inletTemp, intakeHumidity);
      const outletDewPoint = calcDewPoint(dryOutletTemp, outtakeHumidity);
      systemState.value.inletDewPoint = inletDewPoint;
      systemState.value.outletDewPoint = outletDewPoint;

      // Calculate wet bulb temperatures
      const inletWetBulb = calcWetBulb(inletTemp, intakeHumidity);
      const outletWetBulb = calcWetBulb(dryOutletTemp, outtakeHumidity);
      systemState.value.inletWetBulb = inletWetBulb;
      systemState.value.outletWetBulb = outletWetBulb;

      // Calculate enthalpies
      systemState.value.inletEnthalpy = calcEnthalpy(inletTemp, intakeHumidity);
      systemState.value.outletEnthalpy = calcEnthalpy(dryOutletTemp, outtakeHumidity);

      // Calculate COP, effectiveness, and power consumption
      const copData = calculateCOP(
        inletTemp,
        dryOutletTemp,
        intakeHumidity,
        outtakeHumidity,
        dryFanSpeed,
        wetFanSpeed,
        isPumpActive
      );

      // Update all performance metrics
      systemState.value.cop = copData.cop;
      systemState.value.coolingEffect = copData.coolingEffect;
      systemState.value.powerConsumption = copData.powerConsumption;
      systemState.value.massFlowRate = copData.massFlowRate;
      systemState.value.effectiveness = copData.effectiveness;
      systemState.value.temperatures = copData.temperatures;
    }
  };

  // Computed values
  const averages = computed(() => {
    if (!temperatureLog.value.length) return { inlet: 0, dryOutlet: 0 };
    
    const sum = temperatureLog.value.reduce((acc, entry) => ({
      inlet: acc.inlet + entry.inlet,
      dryOutlet: acc.dryOutlet + entry.dryOutlet
    }), { inlet: 0, dryOutlet: 0 });

    return {
      inlet: (sum.inlet / temperatureLog.value.length).toFixed(2),
      dryOutlet: (sum.dryOutlet / temperatureLog.value.length).toFixed(2)
    };
  });

  // Connection state tracking
  const connectionState = ref({
    lastAliveTimestamp: null,
    isConnected: false,
    hasInitialData: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectInterval: 5000  // 5 seconds
  });

  // Check system connection status
  const checkSystemConnection = () => {
    const now = Date.now();
    if (connectionState.value.lastAliveTimestamp) {
      const timeSinceLastAlive = now - connectionState.value.lastAliveTimestamp;
      const isConnected = timeSinceLastAlive < 20000;

      if (connectionState.value.isConnected !== isConnected) {
        connectionState.value.isConnected = isConnected;
        systemState.value.isSystemConnected = isConnected;

        console.log(`System connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);

        if (!isConnected && connectionState.value.reconnectAttempts < connectionState.value.maxReconnectAttempts) {
          // Attempt reconnection
          connectionState.value.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Attempting reconnection (${connectionState.value.reconnectAttempts}/${connectionState.value.maxReconnectAttempts})`);
            setupListeners();
          }, connectionState.value.reconnectInterval);
        }
      }
    }
  };

  // Firebase listeners
  const setupListeners = () => {
    const rootRef = dbRef(database);
    
    onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Reset connection state on successful data
      connectionState.value.lastAliveTimestamp = Date.now();
      connectionState.value.reconnectAttempts = 0;
      connectionState.value.hasInitialData = true;

      // Update system state with new values if provided
      const updates = {
        dryOutletTemp: data.sensor1 ?? systemState.value.dryOutletTemp,
        inletTemp: data.sensor2 ?? systemState.value.inletTemp,
        intakeHumidity: data['intake-humidity'] ?? systemState.value.intakeHumidity,
        outtakeHumidity: data['outtake-humidity'] ?? systemState.value.outtakeHumidity,
        dryFanSpeed: data['dry-fan'] ?? systemState.value.dryFanSpeed,
        wetFanSpeed: data['wet-fan'] ?? systemState.value.wetFanSpeed,
        isPumpActive: data.pump ?? systemState.value.isPumpActive,
        isOptimalMode: data.optimal ?? systemState.value.isOptimalMode
      };

      // Apply updates
      // Only update if we have valid data
      const hasValidData = Object.values(updates).some(value => value !== null && value !== undefined);
      if (hasValidData) {
        Object.assign(systemState.value, updates);
      }

      // Update psychrometric calculations if we have all required values
      if (systemState.value.dryOutletTemp != null &&
          systemState.value.inletTemp != null &&
          systemState.value.intakeHumidity != null &&
          systemState.value.outtakeHumidity != null) {
        updatePsychrometricValues();
      }

      // Log temperature if connected and have sensor data
      if (systemState.value.isSystemConnected && 
          systemState.value.dryOutletTemp != null && 
          systemState.value.inletTemp != null) {
        logTemperature();
      }

      // Log current state for debugging
      console.log('Updated system state:', {
        temps: {
          inlet: systemState.value.inletTemp,
          outlet: systemState.value.dryOutletTemp
        },
        humidity: {
          intake: systemState.value.intakeHumidity,
          outtake: systemState.value.outtakeHumidity
        },
        fans: {
          dry: systemState.value.dryFanSpeed,
          wet: systemState.value.wetFanSpeed
        },
        pump: systemState.value.isPumpActive,
        optimal: systemState.value.isOptimalMode,
        connected: systemState.value.isSystemConnected,
        effectiveness: systemState.value.effectiveness
      });
    });

    // Start connection check interval
    connectionCheckInterval = setInterval(checkSystemConnection, 20000);
  };

  // System control functions
  const setFanSpeed = async (type, speed) => {
    if (!systemState.value.isSystemConnected) {
      error.value = 'System is disconnected';
      return;
    }

    try {
      const fanRef = dbRef(database, type === 'dry' ? 'dry-fan' : 'wet-fan');
      await set(fanRef, Number(speed));
    } catch (e) {
      error.value = `Failed to set ${type} fan speed: ${e.message}`;
    }
  };

  const togglePump = async () => {
    if (!systemState.value.isSystemConnected) {
      error.value = 'System is disconnected';
      return;
    }

    try {
      const pumpRef = dbRef(database, 'pump');
      await set(pumpRef, !systemState.value.isPumpActive);
    } catch (e) {
      error.value = `Failed to toggle pump: ${e.message}`;
    }
  };

  const setOptimalMode = async (enabled) => {
    if (!systemState.value.isSystemConnected) {
      error.value = 'System is disconnected';
      return;
    }

    try {
      const optimalRef = dbRef(database, 'optimal');
      await set(optimalRef, enabled);
    } catch (e) {
      error.value = `Failed to set optimal mode: ${e.message}`;
    }
  };

  const emergencyStop = async () => {
    try {
      await Promise.all([
        set(dbRef(database, 'dry-fan'), 0),
        set(dbRef(database, 'wet-fan'), 0),
        set(dbRef(database, 'pump'), false),
        set(dbRef(database, 'optimal'), false)
      ]);
    } catch (e) {
      error.value = `Emergency stop failed: ${e.message}`;
    }
  };

  const logTemperature = () => {
    const currentTime = new Date();
    const {
      inletTemp,
      dryOutletTemp,
      intakeHumidity,
      outtakeHumidity,
      dryFanSpeed,
      wetFanSpeed,
      inletDewPoint,
      outletDewPoint,
      inletWetBulb,
      outletWetBulb,
      cop,
      effectiveness,
      coolingEffect,
      powerConsumption,
      massFlowRate,
      isPumpActive
    } = systemState.value;

    temperatureLog.value.push({
      timestamp: currentTime.toISOString(),
      inlet: inletTemp,
      dryOutlet: dryOutletTemp,
      inletHumidity: intakeHumidity,
      outletHumidity: outtakeHumidity,
      inletDewPoint,
      outletDewPoint,
      effectiveness,
      massFlowRate,
      dryFan: dryFanSpeed,
      wetFan: wetFanSpeed,
      pumpStatus: isPumpActive,
      powerTotal: powerConsumption.total,
      coolingEffect,
      cop
    });

    // Keep only last hour of readings (assuming one reading every few seconds)
    const oneHourAgo = currentTime.getTime() - (60 * 60 * 1000);
    temperatureLog.value = temperatureLog.value.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    );
  };

  // Setup and cleanup
  onMounted(() => {
    setupListeners();
  });

  onUnmounted(() => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }
  });

  return {
    systemState,
    averages,
    error,
    temperatureLog,
    setFanSpeed,
    togglePump,
    setOptimalMode,
    emergencyStop
  };
}

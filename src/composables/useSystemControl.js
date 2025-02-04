import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { ref as dbRef, onValue, set, get } from 'firebase/database';

export function useSystemControl() {
  const database = inject('database');
  
  if (!database) {
    console.error('Firebase database not properly initialized');
    throw new Error('Firebase not properly initialized');
  }
  
  const systemState = ref({
    dryOutletTemp: null,
    inletTemp: null,
    dryFanSpeed: 0,
    wetFanSpeed: 0,
    isPumpActive: false,
    isOptimalMode: false,
    isSystemConnected: false,
    lastAliveTimestamp: null
  });

  const temperatureLog = ref([]);
  const error = ref(null);
  let connectionCheckInterval = null;

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

  // Check if system is alive based on timestamp
  const checkSystemConnection = () => {
    const now = Date.now();
    if (systemState.value.lastAliveTimestamp) {
      // Consider system disconnected if last alive timestamp is more than 20 seconds old
      const isConnected = now - systemState.value.lastAliveTimestamp < 20000;
      if (systemState.value.isSystemConnected !== isConnected) {
        systemState.value.isSystemConnected = isConnected;
        console.log(`System connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
      }
    }
  };

  // Firebase listeners
  const setupListeners = () => {
    const rootRef = dbRef(database);
    
    onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Update last alive timestamp if isAlive is true
      if (data.isAlive) {
        systemState.value.lastAliveTimestamp = Date.now();
      }

      systemState.value = {
        ...systemState.value,
        dryOutletTemp: data.sensor1 || null,
        inletTemp: data.sensor2 || null,
        dryFanSpeed: data['dry-fan'] || 0,
        wetFanSpeed: data['wet-fan'] || 0,
        isPumpActive: data.pump || false,
        isOptimalMode: data.optimal || false
      };

      if (systemState.value.isSystemConnected && 
          systemState.value.dryOutletTemp && 
          systemState.value.inletTemp) {
        logTemperature();
      }
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
    temperatureLog.value.push({
      timestamp: currentTime.toISOString(),
      inlet: systemState.value.inletTemp,
      dryOutlet: systemState.value.dryOutletTemp,
      dryFan: systemState.value.dryFanSpeed,
      wetFan: systemState.value.wetFanSpeed
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

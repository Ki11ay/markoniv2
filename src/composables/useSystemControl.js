import { ref, computed, inject } from 'vue';
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
    isSystemConnected: false
  });

  const temperatureLog = ref([]);
  const error = ref(null);

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

  // Firebase listeners
  const setupListeners = () => {
    const rootRef = dbRef(database);
    
    onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      systemState.value = {
        dryOutletTemp: data.sensor1 || null,
        inletTemp: data.sensor2 || null,
        dryFanSpeed: data['dry-fan'] || 0,
        wetFanSpeed: data['wet-fan'] || 0,
        isPumpActive: data.pump || false,
        isOptimalMode: data.optimal || false,
        isSystemConnected: data.isAlive || false
      };

      if (systemState.value.isSystemConnected && 
          systemState.value.dryOutletTemp && 
          systemState.value.inletTemp) {
        logTemperature();
      }
    });
  };

  // System control functions
  const setFanSpeed = async (type, speed) => {
    try {
      const fanRef = dbRef(database, type === 'dry' ? 'dry-fan' : 'wet-fan');
      await set(fanRef, Number(speed));
    } catch (e) {
      error.value = `Failed to set ${type} fan speed: ${e.message}`;
    }
  };

  const togglePump = async () => {
    try {
      const pumpRef = dbRef(database, 'pump');
      await set(pumpRef, !systemState.value.isPumpActive);
    } catch (e) {
      error.value = `Failed to toggle pump: ${e.message}`;
    }
  };

  const setOptimalMode = async (enabled) => {
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
  };

  // Initialize listeners
  setupListeners();

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

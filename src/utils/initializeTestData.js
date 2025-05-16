import { getDatabase, ref, set } from 'firebase/database';

export async function initializeTestData(app) {
  const db = getDatabase(app);
  
  // Initial test data with realistic values for testing COP calculation
  const initialData = {
    'sensor1': 20.0,  // Dry outlet temperature (cooled air)
    'sensor2': 32.0,  // Inlet temperature (hot air)
    'intake-humidity': 32,  // Inlet humidity (typical outdoor humidity)
    'outtake-humidity': 65, // Outlet humidity (after evaporative cooling)
    'dry-fan': 50,    // Dry fan speed - should give us base mass flow rate of 0.259 kg/s
    'wet-fan': 100,    // Wet fan speed
    'pump': true,     // Pump active for evaporative cooling
    'optimal': false, // Manual mode for testing
    'isAlive': true   // System connection status
  };

  console.log('Initializing test data with values:', initialData);

  try {
    // Write initial data to Firebase
    await set(ref(db, '/'), initialData);
    console.log('Test data initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize test data:', error);
    return false;
  }
}

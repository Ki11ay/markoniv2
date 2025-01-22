// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from './config.prod.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

// Reference to the root of the database
const rootRef = ref(database);

console.log("Firebase initialized successfully!");

// Add these variables at the top with other declarations
let lastLoggedTemps = {
    inlet: null,
    dryOutlet: null,
    lastUpdateTime: null
};

let sensorStatus = {
    lastUpdate: null,
    isConnected: false
};

// Add this variable with other declarations at the top
let lastRealtimeUpdate = null;

// Function to update display values
function updateDisplayValues(data) {
    // Update sensor connection status
    if (data.lastUpdate) {
        sensorStatus.lastUpdate = new Date(data.lastUpdate);
        sensorStatus.isConnected = true;
    }

    // Update sensors
    const dryOutletValue = document.querySelector('li:nth-child(1) .sensor-value');
    const inletValue = document.querySelector('li:nth-child(2) .sensor-value');
    const dryFanDisplay = document.querySelector('li:nth-child(3) .sensor-value');
    const wetFanDisplay = document.querySelector('li:nth-child(4) .sensor-value');

    // Get control elements
    const dryFanSlider = document.getElementById('dry-fan-slider');
    const wetFanSlider = document.getElementById('wet-fan-slider');
    const pumpButton = document.getElementById('pump-button');
    const optimalSwitch = document.getElementById('optimal-switch');

    // Check sensor connection
    const currentTime = new Date();
    const timeSinceLastUpdate = sensorStatus.lastUpdate ? 
        (currentTime - sensorStatus.lastUpdate) / 1000 : null;

    // If no update in last 30 seconds, mark as disconnected
    if (!sensorStatus.lastUpdate || timeSinceLastUpdate > 30) {
        sensorStatus.isConnected = false;
        dryOutletValue.textContent = 'Disconnected';
        inletValue.textContent = 'Disconnected';
        dryOutletValue.classList.add('disconnected');
        inletValue.classList.add('disconnected');
        return;
    } else {
        dryOutletValue.classList.remove('disconnected');
        inletValue.classList.remove('disconnected');
    }

    // Check if optimal mode is enabled
    const isOptimalMode = data.optimal === true;

    // Disable/Enable controls based on optimal mode
    dryFanSlider.disabled = isOptimalMode;
    wetFanSlider.disabled = isOptimalMode;
    pumpButton.disabled = isOptimalMode;

    // Update sensor values and log them
    if (data.sensor1 !== undefined && data.sensor2 !== undefined) {
        const newDryOutlet = Number(data.sensor1);
        const newInlet = Number(data.sensor2);
        
        // Check for valid temperature values (add reasonable bounds)
        if (isNaN(newDryOutlet) || isNaN(newInlet) || 
            newDryOutlet < -50 || newDryOutlet > 100 || 
            newInlet < -50 || newInlet > 100) {
            console.log('Invalid temperature values detected - skipping log');
            return;
        }
        
        dryOutletValue.textContent = `${newDryOutlet.toFixed(2)}°C`;
        inletValue.textContent = `${newInlet.toFixed(2)}°C`;
        
        // Log temperatures to Firestore if they've changed
        logTemperatures(newInlet, newDryOutlet);
    }

    // Update fan values in the cards
    if (data['dry-fan'] !== undefined) {
        dryFanDisplay.textContent = `${data['dry-fan']}%`;
        
        // Update slider values and background
        if (dryFanSlider && document.getElementById('dry-fan-value')) {
            dryFanSlider.value = data['dry-fan'];
            document.getElementById('dry-fan-value').textContent = `${data['dry-fan']}%`;
            updateSliderBackground(dryFanSlider, data['dry-fan']);
        }
    }

    if (data['wet-fan'] !== undefined) {
        wetFanDisplay.textContent = `${data['wet-fan']}%`;
        
        // Update slider values and background
        if (wetFanSlider && document.getElementById('wet-fan-value')) {
            wetFanSlider.value = data['wet-fan'];
            document.getElementById('wet-fan-value').textContent = `${data['wet-fan']}%`;
            updateSliderBackground(wetFanSlider, data['wet-fan']);
        }
    }

    // Update optimal switch state
    if (data.optimal !== undefined && optimalSwitch) {
        optimalSwitch.checked = data.optimal;
    }

    // Update pump button state
    if (data.pump !== undefined && pumpButton) {
        if (data.pump) {
            pumpButton.classList.add('active');
            pumpButton.querySelector('span').textContent = 'Pump On';
        } else {
            pumpButton.classList.remove('active');
            pumpButton.querySelector('span').textContent = 'Pump Off';
        }
    }
}

// Function to update fan value in Firebase
async function updateFanValue(fanType, value) {
    try {
        await set(ref(database, fanType), Number(value));
        console.log(`${fanType} updated to ${value}`);
    } catch (error) {
        console.error(`Error updating ${fanType}:`, error);
    }
}

// Function to update slider background
function updateSliderBackground(slider, value) {
    const percentage = (value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
}

// Function to set optimal conditions
async function setOptimalConditions(enabled) {
    try {
        if (enabled) {
            // Set optimal values in Firebase
            await set(ref(database, 'dry-fan'), 50);
            await set(ref(database, 'wet-fan'), 50);
            await set(ref(database, 'pump'), true);
        }
        // Set optimal mode state
        await set(ref(database, 'optimal'), enabled);
    } catch (error) {
        console.error('Error setting optimal conditions:', error);
    }
}

// Add this function after the setOptimalConditions function
async function stopAllSystems() {
    try {
        // Set both fans to 0
        await set(ref(database, 'dry-fan'), 0);
        await set(ref(database, 'wet-fan'), 0);
        // Turn off the pump
        await set(ref(database, 'pump'), false);
        // Disable optimal mode if it's on
        await set(ref(database, 'optimal'), false);
        
        console.log('All systems stopped successfully');
    } catch (error) {
        console.error('Error stopping systems:', error);
    }
}

// Set up slider event listeners
['dry-fan', 'wet-fan'].forEach(fanType => {
    const slider = document.getElementById(`${fanType}-slider`);
    const valueDisplay = document.getElementById(`${fanType}-value`);
    
    slider.addEventListener('input', (e) => {
        // Update display immediately
        valueDisplay.textContent = `${e.target.value}%`;
        // Update slider background
        updateSliderBackground(slider, e.target.value);
    });

    slider.addEventListener('change', (e) => {
        // Update Firebase when sliding stops
        updateFanValue(fanType, e.target.value);
    });
});

// Set up optimal switch event listener
const optimalSwitch = document.getElementById('optimal-switch');
if (optimalSwitch) {
    optimalSwitch.addEventListener('change', (e) => {
        setOptimalConditions(e.target.checked);
    });
}

// Get pump button element
const pumpButton = document.getElementById('pump-button');

// Add event listener for pump button
pumpButton.addEventListener('click', async () => {
    try {
        const currentState = pumpButton.classList.contains('active');
        const newState = !currentState;
        await set(ref(database, 'pump'), newState);
    } catch (error) {
        console.error('Error updating pump state:', error);
    }
});

// Listen for pump state changes
onValue(ref(database, 'pump'), (snapshot) => {
    const pumpState = snapshot.val();
    if (pumpState) {
        pumpButton.classList.add('active');
        pumpButton.querySelector('span').textContent = 'Pump On';
    } else {
        pumpButton.classList.remove('active');
        pumpButton.querySelector('span').textContent = 'Pump Off';
    }
});

// Modify the onValue listener for realtime database
onValue(rootRef, (snapshot) => {
    console.log("Data received from Firebase:", snapshot.val());
    const data = snapshot.val();
    lastRealtimeUpdate = new Date(); // Update timestamp when we get new data
    updateDisplayValues(data);
}, (error) => {
    console.error('Error reading data:', error);
});

// Function to show modal with readings
async function showReadings(sensorType) {
    try {
        const tempCollection = collection(firestore, 'temp');
        const q = query(tempCollection, orderBy('timestamp', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        
        let readings = [];
        let sum = 0;
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const value = sensorType === 'inlet' ? data.inlet : data.dryOutlet;
            const timestamp = data.timestamp.toDate();
            readings.push({ value, timestamp });
            sum += value;
            count++;
        });

        // Update modal title
        modalTitle.textContent = `${sensorType === 'inlet' ? 'Inlet' : 'Dry Outlet'} Temperature Readings (Last ${count})`;
        
        // Calculate and display average
        const avg = count > 0 ? (sum / count).toFixed(2) : 0;
        modalAverage.textContent = `${avg}°C`;
        
        // Display readings with timestamps
        readingsList.innerHTML = readings.map(reading => `
            <div class="reading-item">
                <span>${reading.value.toFixed(2)}°C</span>
                <span>${reading.timestamp.toLocaleTimeString()}</span>
            </div>
        `).join('');
        
        // Show modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching readings:', error);
    }
}

// Function to calculate average of readings
async function calculateAverages() {
    try {
        const tempCollection = collection(firestore, 'temp');
        const q = query(tempCollection, orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        let inletSum = 0;
        let dryOutletSum = 0;
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            inletSum += data.inlet;
            dryOutletSum += data.dryOutlet;
            count++;
        });
        
        const inletAvg = count > 0 ? (inletSum / count).toFixed(2) : 0;
        const dryOutletAvg = count > 0 ? (dryOutletSum / count).toFixed(2) : 0;
        
        // Update averages display
        document.getElementById('inlet-avg').textContent = `${inletAvg}°C`;
        document.getElementById('dry-outlet-avg').textContent = `${dryOutletAvg}°C`;
    } catch (error) {
        console.error('Error calculating averages:', error);
    }
}

// Modify the logTemperatures function
async function logTemperatures(inlet, dryOutlet) {
    try {
        // Don't log if sensors are disconnected
        if (!sensorStatus.isConnected) {
            console.log('Sensors are disconnected - skipping log');
            return;
        }

        const currentTime = new Date();
        
        // Check if this is the first reading
        if (lastLoggedTemps.inlet === null) {
            await addNewReading(inlet, dryOutlet, currentTime);
            return;
        }

        // Check if temperatures have changed
        const inletChanged = Math.abs(lastLoggedTemps.inlet - inlet) > 0.01;
        const dryOutletChanged = Math.abs(lastLoggedTemps.dryOutlet - dryOutlet) > 0.01;

        // Only log if either temperature has changed
        if (inletChanged || dryOutletChanged) {
            await addNewReading(inlet, dryOutlet, currentTime);
        }
    } catch (error) {
        console.error('Error logging temperatures:', error);
    }
}

// Helper function to add new reading
async function addNewReading(inlet, dryOutlet, timestamp) {
    try {
        const tempCollection = collection(firestore, 'temp');
        await addDoc(tempCollection, {
            inlet: Number(inlet),
            dryOutlet: Number(dryOutlet),
            timestamp: timestamp
        });
        
        // Update last logged values
        lastLoggedTemps.inlet = Number(inlet);
        lastLoggedTemps.dryOutlet = Number(dryOutlet);
        lastLoggedTemps.lastUpdateTime = timestamp;
        
        // Calculate new averages after logging
        await calculateAverages();
        
        console.log('New temperature reading logged');
    } catch (error) {
        console.error('Error adding new reading:', error);
    }
}

// Calculate initial averages when the page loads
calculateAverages();

// Add CSS for disabled controls
const style = document.createElement('style');
style.textContent = `
    input[type="range"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .pump-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Add this with your other event listeners
const stopButton = document.getElementById('stop-button');
if (stopButton) {
    stopButton.addEventListener('click', stopAllSystems);
}

// Add these functions after the existing imports
let currentReadings = [];
const modal = document.getElementById('readings-modal');
const modalTitle = document.getElementById('modal-title');
const modalAverage = document.getElementById('modal-average');
const readingsList = document.getElementById('readings-list');
const closeModal = document.querySelector('.close-modal');

// Add click event listeners to temperature containers
document.querySelector('li:nth-child(1)').addEventListener('click', () => showReadings('dryOutlet'));
document.querySelector('li:nth-child(2)').addEventListener('click', () => showReadings('inlet'));

// Close modal when clicking the close button
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
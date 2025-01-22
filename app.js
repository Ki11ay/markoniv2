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

// Function to update display values
function updateDisplayValues(data) {
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

    // Check if optimal mode is enabled
    const isOptimalMode = data.optimal === true;

    // Disable/Enable controls based on optimal mode
    dryFanSlider.disabled = isOptimalMode;
    wetFanSlider.disabled = isOptimalMode;
    pumpButton.disabled = isOptimalMode;

    // Update sensor values and log them
    if (data.sensor1 !== undefined && data.sensor2 !== undefined) {
        dryOutletValue.textContent = `${data.sensor1}°C`;
        inletValue.textContent = `${data.sensor2}°C`;
        
        // Log temperatures to Firestore
        logTemperatures(data.sensor2, data.sensor1);
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

// Read data from Firebase
onValue(rootRef, (snapshot) => {
    console.log("Data received from Firebase:", snapshot.val());
    const data = snapshot.val();
    updateDisplayValues(data);
}, (error) => {
    console.error('Error reading data:', error);
});

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
        
        const inletAvg = count > 0 ? (inletSum / count).toFixed(1) : 0;
        const dryOutletAvg = count > 0 ? (dryOutletSum / count).toFixed(1) : 0;
        
        // Update averages display
        document.getElementById('inlet-avg').textContent = `${inletAvg}°C`;
        document.getElementById('dry-outlet-avg').textContent = `${dryOutletAvg}°C`;
    } catch (error) {
        console.error('Error calculating averages:', error);
    }
}

// Function to log temperature readings
async function logTemperatures(inlet, dryOutlet) {
    try {
        const tempCollection = collection(firestore, 'temp');
        await addDoc(tempCollection, {
            inlet: Number(inlet),
            dryOutlet: Number(dryOutlet),
            timestamp: new Date()
        });
        
        // Calculate new averages after logging
        await calculateAverages();
    } catch (error) {
        console.error('Error logging temperatures:', error);
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
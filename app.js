// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from './config.prod.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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

    // Update sensor values
    if (data.sensor1 !== undefined) {
        dryOutletValue.textContent = `${data.sensor1}°C`;
    }
    if (data.sensor2 !== undefined) {
        inletValue.textContent = `${data.sensor2}°C`;
    }

    // Update fan values in the cards
    if (data['dry-fan'] !== undefined) {
        dryFanDisplay.textContent = `${data['dry-fan']}%`;
        
        // Update slider values and background
        const slider = document.getElementById('dry-fan-slider');
        const valueDisplay = document.getElementById('dry-fan-value');
        if (slider && valueDisplay) {
            slider.value = data['dry-fan'];
            valueDisplay.textContent = `${data['dry-fan']}%`;
            updateSliderBackground(slider, data['dry-fan']);
        }
    }

    if (data['wet-fan'] !== undefined) {
        wetFanDisplay.textContent = `${data['wet-fan']}%`;
        
        // Update slider values and background
        const slider = document.getElementById('wet-fan-slider');
        const valueDisplay = document.getElementById('wet-fan-value');
        if (slider && valueDisplay) {
            slider.value = data['wet-fan'];
            valueDisplay.textContent = `${data['wet-fan']}%`;
            updateSliderBackground(slider, data['wet-fan']);
        }
    }

    // Update optimal switch state
    const optimalSwitch = document.getElementById('optimal-switch');
    if (data.optimal !== undefined && optimalSwitch) {
        optimalSwitch.checked = data.optimal;
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

// Function to update optimal value in Firebase
async function updateOptimalValue(value) {
    try {
        await set(ref(database, 'optimal'), value);
        console.log(`Optimal mode ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
        console.error('Error updating optimal mode:', error);
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
        updateOptimalValue(e.target.checked);
    });
}

// Get pump switch element
const pumpSwitch = document.getElementById('pump-switch');

// Add event listener for pump switch
pumpSwitch.addEventListener('change', async (e) => {
    try {
        const pumpState = e.target.checked;
        await set(ref(database, 'pump'), pumpState);
    } catch (error) {
        console.error('Error updating pump state:', error);
    }
});

// Listen for pump state changes
onValue(ref(database, 'pump'), (snapshot) => {
    const pumpState = snapshot.val();
    pumpSwitch.checked = pumpState;
});

// Read data from Firebase
onValue(rootRef, (snapshot) => {
    console.log("Data received from Firebase:", snapshot.val());
    const data = snapshot.val();
    updateDisplayValues(data);
}, (error) => {
    console.error('Error reading data:', error);
});
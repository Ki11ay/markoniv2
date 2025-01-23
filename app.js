// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from './config.prod.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const rootRef = ref(database);

console.log("Firebase initialized successfully!");

// System state variables
let isSystemConnected = false;
let heartbeatChecker = null;
let systemSettings = null;
let lastLoggedTemps = {
    inlet: null,
    dryOutlet: null,
    lastUpdateTime: null
};
let temperatureLog = [];

// DOM Elements
const dryOutletValue = document.querySelector('.status-card:nth-child(1) .sensor-value');
const inletValue = document.querySelector('.status-card:nth-child(2) .sensor-value');
const dryFanDisplay = document.querySelector('.status-card:nth-child(3) .sensor-value');
const wetFanDisplay = document.querySelector('.status-card:nth-child(4) .sensor-value');
const dryFanSlider = document.getElementById('dry-fan-slider');
const wetFanSlider = document.getElementById('wet-fan-slider');
const pumpButton = document.getElementById('pump-button');
const optimalButton = document.getElementById('optimal-button');
const stopButton = document.getElementById('stop-button');
const downloadBtn = document.getElementById('download-button');

// Function to update display values
function updateDisplayValues(data) {
    // Update connection status
    const connectionElements = [dryOutletValue, inletValue];
    if (!isSystemConnected) {
        connectionElements.forEach(el => {
            el.textContent = 'Disconnected';
            el.classList.add('disconnected');
        });
        return;
    } else {
        connectionElements.forEach(el => el.classList.remove('disconnected'));
    }

    // Update sensor values
    if (data.sensor1 !== undefined && data.sensor2 !== undefined) {
        const newDryOutlet = Number(data.sensor1);
        const newInlet = Number(data.sensor2);

        dryOutletValue.textContent = `${newDryOutlet.toFixed(2)}°C`;
        inletValue.textContent = `${newInlet.toFixed(2)}°C`;

        // Safety checks
        const tempDifference = Math.abs(newInlet - newDryOutlet);
        if (tempDifference > 10) stopAllSystems();
        if (systemSettings && newInlet > systemSettings.maxTemp) applyOptimalConditions();
    }

    // Update fan controls
    if (data['dry-fan'] !== undefined) {
        const dryFanValue = data['dry-fan'];
        dryFanDisplay.textContent = `${dryFanValue}%`;
        dryFanSlider.value = dryFanValue;
        document.getElementById('dry-fan-value').textContent = `${dryFanValue}%`;
        updateSliderBackground(dryFanSlider, dryFanValue);
    }

    if (data['wet-fan'] !== undefined) {
        const wetFanValue = data['wet-fan'];
        wetFanDisplay.textContent = `${wetFanValue}%`;
        wetFanSlider.value = wetFanValue;
        document.getElementById('wet-fan-value').textContent = `${wetFanValue}%`;
        updateSliderBackground(wetFanSlider, wetFanValue);
    }

    // Update controls state
    if (data.optimal !== undefined) {
        optimalButton.textContent = data.optimal ? 'Optimal Mode On' : 'Optimal Mode Off';
        [dryFanSlider, wetFanSlider, pumpButton].forEach(el => el.disabled = data.optimal);
    }

    if (data.pump !== undefined) {
        pumpButton.classList.toggle('active', data.pump);
        pumpButton.querySelector('span').textContent = data.pump ? 'Pump On' : 'Pump Off';
    }
}

// Slider functions
function updateSliderBackground(slider, value) {
    const percentage = (value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, #ddd ${percentage}%)`;
}

// System control functions
async function setOptimalConditions(enabled) {
    try {
        if (!systemSettings) await loadSettings();
        
        if (enabled) {
            await Promise.all([
                set(ref(database, 'dry-fan'), systemSettings.optimalDryFan || 50),
                set(ref(database, 'wet-fan'), systemSettings.optimalWetFan || 50),
                set(ref(database, 'pump'), systemSettings.optimalPump || false)
            ]);
        }
        await set(ref(database, 'optimal'), enabled);
    } catch (error) {
        console.error('Error setting optimal conditions:', error);
    }
}

async function stopAllSystems() {
    try {
        await Promise.all([
            set(ref(database, 'dry-fan'), 0),
            set(ref(database, 'wet-fan'), 0),
            set(ref(database, 'pump'), false),
            set(ref(database, 'optimal'), false)
        ]);
    } catch (error) {
        console.error('Error stopping systems:', error);
    }
}

// Event listeners
dryFanSlider.addEventListener('input', (e) => {
    document.getElementById('dry-fan-value').textContent = `${e.target.value}%`;
    updateSliderBackground(dryFanSlider, e.target.value);
});

dryFanSlider.addEventListener('change', (e) => {
    set(ref(database, 'dry-fan'), Number(e.target.value));
});

wetFanSlider.addEventListener('input', (e) => {
    document.getElementById('wet-fan-value').textContent = `${e.target.value}%`;
    updateSliderBackground(wetFanSlider, e.target.value);
});

wetFanSlider.addEventListener('change', (e) => {
    set(ref(database, 'wet-fan'), Number(e.target.value));
});

optimalButton.addEventListener('click', () => {
    const isOptimal = optimalButton.textContent.includes('On');
    setOptimalConditions(!isOptimal);
});

pumpButton.addEventListener('click', () => {
    const newState = !pumpButton.classList.contains('active');
    set(ref(database, 'pump'), newState);
});

stopButton.addEventListener('click', stopAllSystems);
downloadBtn.addEventListener('click', downloadCSV);

// Connection monitoring
function checkSystemConnection() {
    get(ref(database, 'isAlive')).then((snapshot) => {
        isSystemConnected = snapshot.val() === true;
        if (!isSystemConnected) updateDisplayValues({});
    }).catch(console.error);
}

// Data handling
onValue(rootRef, (snapshot) => {
    const data = snapshot.val();
    updateDisplayValues(data);
    
    if (isSystemConnected && data.sensor1 && data.sensor2) {
        logTemperature(data.sensor1, data.sensor2, data['dry-fan'] || 0, data['wet-fan'] || 0);
    }
});

function logTemperature(inlet, dryOutlet, fanDry, fanWet) {
    const currentTime = new Date();
    const entry = {
        timestamp: currentTime.toISOString(),
        inlet: Number(inlet),
        dryOutlet: Number(dryOutlet),
        dryFan: Number(fanDry),
        wetFan: Number(fanWet)
    };

    const shouldLog = !lastLoggedTemps.lastUpdateTime ||
        Math.abs(lastLoggedTemps.inlet - inlet) > 0.01 ||
        Math.abs(lastLoggedTemps.dryOutlet - dryOutlet) > 0.01 ||
        currentTime - lastLoggedTemps.lastUpdateTime > 60000;

    if (shouldLog) {
        temperatureLog.push(entry);
        lastLoggedTemps = {
            inlet: entry.inlet,
            dryOutlet: entry.dryOutlet,
            lastUpdateTime: currentTime
        };
        calculateAverages();
    }
}

function calculateAverages() {
    if (!temperatureLog.length) return;
    
    const inletAvg = temperatureLog.reduce((sum, entry) => sum + entry.inlet, 0) / temperatureLog.length;
    const dryOutletAvg = temperatureLog.reduce((sum, entry) => sum + entry.dryOutlet, 0) / temperatureLog.length;

    document.getElementById('inlet-avg').textContent = `${inletAvg.toFixed(2)}°C`;
    document.getElementById('dry-outlet-avg').textContent = `${dryOutletAvg.toFixed(2)}°C`;
}

function downloadCSV() {
    if (!temperatureLog.length) return alert('No data available to download!');
    
    const csvContent = [
        'Timestamp,Inlet Temp (°C),Dry Outlet Temp (°C),Dry Fan (%),Wet Fan (%)',
        ...temperatureLog.map(entry => 
            `${entry.timestamp},${entry.inlet.toFixed(2)},${entry.dryOutlet.toFixed(2)},${entry.dryFan},${entry.wetFan}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system_log.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkSystemConnection();
    heartbeatChecker = setInterval(checkSystemConnection, 30000);
    loadSettings();
});

window.addEventListener('beforeunload', () => clearInterval(heartbeatChecker));

async function loadSettings() {
    try {
        const snapshot = await get(ref(database, 'settings'));
        systemSettings = snapshot.val() || {};
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from './config.prod.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Load settings when page loads
document.addEventListener('DOMContentLoaded', loadSettings);

async function loadSettings() {
    try {
        const settingsRef = ref(database, 'settings');
        const snapshot = await get(settingsRef);
        const settings = snapshot.val() || {};

        // Set form values
        document.getElementById('startTime').value = settings.startTime || '08:00';
        document.getElementById('endTime').value = settings.endTime || '18:00';
        document.getElementById('optimalDryFan').value = settings.optimalDryFan || 50;
        document.getElementById('optimalWetFan').value = settings.optimalWetFan || 50;
        document.getElementById('optimalPump').checked = settings.optimalPump || false;
        document.getElementById('maxTemp').value = settings.maxTemp || 30;
    } catch (error) {
        console.error('Error loading settings:', error);
        alert('Error loading settings. Please try again.');
    }
}

window.saveSettings = async function() {
    try {
        const settings = {
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            optimalDryFan: Number(document.getElementById('optimalDryFan').value),
            optimalWetFan: Number(document.getElementById('optimalWetFan').value),
            optimalPump: document.getElementById('optimalPump').checked,
            maxTemp: Number(document.getElementById('maxTemp').value)
        };

        await set(ref(database, 'settings'), settings);
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
} 
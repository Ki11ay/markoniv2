// Production Firebase configuration
console.log('Loading Firebase config from config.prod.js');

export const firebaseConfig = {
    apiKey: "AIzaSyCb6Ks_OTz_EGYrtPlBZoTI4iqn6506PvA",
    authDomain: "markoni-fc0f3.firebaseapp.com",
    databaseURL: "https://markoni-fc0f3-default-rtdb.firebaseio.com",
    projectId: "markoni-fc0f3",
    storageBucket: "markoni-fc0f3.firebasestorage.app",
    messagingSenderId: "959264968250",
    appId: "1:959264968250:web:37560e21c471953cffef03",
    measurementId: "G-CXN5D5F26P"
};

// Log the config to verify it's loaded correctly
console.log('Firebase config loaded:', {
    hasApiKey: !!firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain
});

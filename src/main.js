import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/theme.css';
import './styles/animations.css';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Import FontAwesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import Google Fonts
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
document.head.appendChild(link);

// Import Firebase configuration and test data initializer
import { firebaseConfig } from './firebase-config';
import { initializeTestData } from './utils/initializeTestData';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

// Initialize test data in development mode
if (import.meta.env.DEV) {
  initializeTestData(firebaseApp).then(success => {
    if (success) {
      console.log('Development test data initialized');
    }
  });
}

// Create and mount the Vue application
const app = createApp(App);

// Register router
app.use(router);

// Error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err);
  console.error('Error info:', info);
};

// Global properties
app.config.globalProperties.$formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Provide Firebase instances to all components
app.provide('auth', auth);
app.provide('database', database);

// Mount the app
app.mount('#app');

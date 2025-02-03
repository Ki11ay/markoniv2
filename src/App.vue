<template>
  <div class="app-container">
    <div v-if="initializing" class="loading-screen">
      <div class="loader"></div>
      <p>Loading...</p>
    </div>
    <router-view v-else v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFirebase } from './composables/useFirebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const { user, isAuthenticated } = useFirebase();
const router = useRouter();
const initializing = ref(true);
const auth = getAuth();

onMounted(() => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? 'authenticated' : 'not authenticated');
    if (!user && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login');
    }
    initializing.value = false;
  });
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--background-color);
  z-index: 1000;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--primary-color);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>

<style>
:root {
  --primary-color: #2ecc71;
  --secondary-color: #3498db;
  --danger-color: #e74c3c;
  --background-color: #f8f9fa;
  --card-background: #ffffff;
  --text-color: #2c3e50;
  --border-radius: 12px;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

button {
  cursor: pointer;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.card {
  background: var(--card-background);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.error-text {
  color: var(--danger-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
}
</style>

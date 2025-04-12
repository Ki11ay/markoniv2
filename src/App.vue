<template>
  <div 
    class="app-wrapper"
    :data-theme="theme"
  >
    <Transition 
      name="fade"
      mode="out-in"
    >
      <router-view></router-view>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const theme = ref(localStorage.getItem('theme') || 'light');
const router = useRouter();

// Watch for system theme changes
onMounted(() => {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  if (!localStorage.getItem('theme')) {
    theme.value = systemDark.matches ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
  }
  document.documentElement.setAttribute('data-theme', theme.value);

  systemDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      theme.value = e.matches ? 'dark' : 'light';
      localStorage.setItem('theme', theme.value);
      document.documentElement.setAttribute('data-theme', theme.value);
    }
  });
});

// Watch route changes for page transitions
watch(() => router.currentRoute.value.name, (newRoute, oldRoute) => {
  if (newRoute !== oldRoute) {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 300); // Match transition duration
  }
});
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  min-width: 100vw;
}

/* Global Styles */
:root {
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --accent-color: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color var(--transition), color var(--transition);
}

/* Reset button styles */
button {
  font-family: inherit;
}

/* Reset input styles */
input, button {
  outline: none;
}

/* Selection color */
::selection {
  background: var(--primary-color);
  color: white;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--surface);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
  border: 2px solid var(--surface);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Remove dark mode image filters */
[data-theme="dark"] img {
  filter: none;
}

[data-theme="dark"] .hero-image {
  filter: none;
}
</style>

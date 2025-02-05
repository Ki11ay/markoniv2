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

    <button 
      class="theme-toggle ripple hover-lift"
      @click="toggleTheme"
      v-if="$route.name !== 'login'"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <i :class="theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const theme = ref(localStorage.getItem('theme') || 'light');
const router = useRouter();

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

// Watch for system theme changes
onMounted(() => {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  if (!localStorage.getItem('theme')) {
    theme.value = systemDark.matches ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
  }

  systemDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      theme.value = e.matches ? 'dark' : 'light';
      localStorage.setItem('theme', theme.value);
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

/* Theme Toggle Button */
.theme-toggle {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: var(--z-50);
  transition: var(--transition);
}

.theme-toggle i {
  font-size: 1.25rem;
  transition: transform var(--transition);
}

.theme-toggle:hover i {
  transform: rotate(15deg) scale(1.1);
}

[data-theme="dark"] .theme-toggle:hover i {
  transform: rotate(-15deg) scale(1.1);
}

@media (max-width: 768px) {
  .theme-toggle {
    bottom: var(--space-4);
    right: var(--space-4);
    width: 40px;
    height: 40px;
  }

  .theme-toggle i {
    font-size: 1rem;
  }
}

/* Global Styles */
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
  background: var(--primary);
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
</style>

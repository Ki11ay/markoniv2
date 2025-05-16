<template>
  <nav class="dashboard-nav">
    <div class="nav-left">
      <router-link to="/" class="nav-link">
        <i class="fas fa-home"></i>
        Home
      </router-link>
      <router-link to="/dashboard" class="nav-link">
        <i class="fas fa-chart-line"></i>
        Dashboard
      </router-link>
      <router-link to="/settings" class="nav-link">
        <i class="fas fa-cog"></i>
        Settings
      </router-link>
    </div>
    <div class="nav-right">
      <button @click="handleLogout" class="logout-button">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = getAuth();

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<style scoped>
.dashboard-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: var(--z-50);
  box-shadow: var(--shadow);
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  padding: var(--space-2) 0;
}

.nav-link i {
  font-size: 1.1rem;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-color);
  border-radius: var(--radius-full);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .dashboard-nav {
    padding: 0 var(--space-4);
  }

  .nav-left, .nav-right {
    gap: var(--space-4);
  }

  .nav-link span {
    display: none;
  }

  .logout-button span {
    display: none;
  }
}
</style> 
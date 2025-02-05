<template>
  <div class="login-container">
    <div class="login-card glass-card">
      <div class="logo-section">
        <i class="fas fa-snowflake fa-spin"></i>
        <h1>AC Control</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              :disabled="loading"
              placeholder="Enter your email"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="loading"
              placeholder="Enter your password"
            >
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message error-shake">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>

        <button 
          type="submit"
          class="login-button ripple hover-lift"
          :disabled="loading"
          :class="{ 'loading': loading }"
        >
          <i class="fas fa-sign-in-alt"></i>
          <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFirebase } from '../composables/useFirebase';

const router = useRouter();
const { loginUser } = useFirebase();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    await loginUser(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Failed to login';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: var(--space-8);
  color: var(--text-primary);
}

.logo-section {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-section i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: var(--space-4);
}

.logo-section h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-weight: 500;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: var(--space-4);
  color: var(--text-tertiary);
}

.input-wrapper input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: calc(var(--space-4) * 2 + 1em);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
}

.toggle-password {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius);
  transition: var(--transition);
}

.toggle-password:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--border-light);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius);
  background: var(--danger);
  color: white;
  font-size: 0.875rem;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4);
  background: var(--primary-gradient);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}

.login-button:hover:not(:disabled) {
  filter: brightness(1.1);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button.loading {
  position: relative;
}

.login-button.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: loading-bar 1.5s ease-in-out infinite;
}

@media (max-width: 768px) {
  .login-card {
    padding: var(--space-6);
  }

  .logo-section i {
    font-size: 2.5rem;
  }

  .logo-section h1 {
    font-size: 1.75rem;
  }
}
</style>

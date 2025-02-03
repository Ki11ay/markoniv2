<template>
  <div class="login-container">
    <div class="login-card card">
      <h1>{{ isRegister ? 'Create Account' : 'Login' }}</h1>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            placeholder="Enter your email"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-text">
          {{ error }}
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="loading"
          :class="{ loading }"
        >
          {{ isRegister ? 'Sign Up' : 'Sign In' }}
        </button>
      </form>

      <div class="toggle-auth">
        <span>
          {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
        </span>
        <button
          class="toggle-button"
          @click="isRegister = !isRegister"
          :disabled="loading"
        >
          {{ isRegister ? 'Sign In' : 'Sign Up' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useFirebase } from '../composables/useFirebase';

const { loginUser, registerUser, error, loading } = useFirebase();

const email = ref('');
const password = ref('');
const isRegister = ref(false);

// Watch for error changes and log them
watch(error, (newError) => {
  if (newError) {
    console.log('Auth error:', newError);
  }
});

const handleSubmit = async () => {
  if (isRegister.value) {
    await registerUser(email.value, password.value);
  } else {
    await loginUser(email.value, password.value);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  margin-top: 1rem;
}

.submit-button.loading {
  opacity: 0.7;
}

.toggle-auth {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-button {
  background: none;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.5rem;
}

.toggle-button:hover {
  transform: none;
  box-shadow: none;
  text-decoration: underline;
}
</style>

import { ref, computed, inject } from 'vue';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

export function useFirebase() {
  const auth = inject('auth');
  const database = inject('database');
  const router = useRouter();
  
  if (!auth || !database) {
    console.error('Firebase auth or database not properly initialized');
    throw new Error('Firebase not properly initialized');
  }

  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const isAuthenticated = computed(() => user.value !== null);

  auth.onAuthStateChanged((currentUser) => {
    console.log('Auth state changed:', currentUser ? 'authenticated' : 'not authenticated');
    user.value = currentUser;
  });

  const loginUser = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;
      console.log('Attempting login with:', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      router.push('/');
    } catch (e) {
      console.error('Login error:', e);
      error.value = e.message;
      if (e.code) {
        switch (e.code) {
          case 'auth/invalid-email':
            error.value = 'Invalid email address format.';
            break;
          case 'auth/user-not-found':
            error.value = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            error.value = 'Incorrect password.';
            break;
          case 'auth/too-many-requests':
            error.value = 'Too many attempts. Please try again later.';
            break;
          default:
            error.value = 'Failed to login. Please try again.';
        }
      }
    } finally {
      loading.value = false;
    }
  };

  const registerUser = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (e) {
      console.error('Registration error:', e);
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (e) {
      console.error('Logout error:', e);
      error.value = e.message;
    }
  };

  return {
    user,
    error,
    loading,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    database
  };
}

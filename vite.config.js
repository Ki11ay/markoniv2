import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/database'],
          'chart': ['chart.js', 'vue-chartjs'],
          'vendor': ['@vueuse/core', '@fortawesome/fontawesome-free']
        }
      }
    }
  },
  server: {
    port: 3000,
    // Enable HMR
    hmr: true
  },
  // Enable PWA
  pwa: {
    includeAssets: ['favicon.ico', 'robots.txt', 'icons/*'],
    manifest: {
      name: 'AC Control System',
      short_name: 'AC Control',
      description: 'Smart AC Control System',
      theme_color: '#2ecc71',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
});

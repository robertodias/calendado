import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Vite automatically loads .env.local, .env.development, .env.production files
  // Variables are available via process.env and import.meta.env
  // Priority: .env.local > .env.[mode] > .env
  const getEnvValue = (key: string, fallback: string) => {
    // Check process.env first (from .env files or system environment)
    // Then fall back to the default
    return process.env[key] || import.meta.env[key] || fallback;
  };
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      open: true,
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    define: {
      // Firebase configuration
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
        getEnvValue('VITE_FIREBASE_API_KEY', 'demo-key')
      ),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
        getEnvValue('VITE_FIREBASE_AUTH_DOMAIN', 'demo.firebaseapp.com')
      ),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
        getEnvValue('VITE_FIREBASE_PROJECT_ID', 'demo-project')
      ),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        getEnvValue('VITE_FIREBASE_STORAGE_BUCKET', 'demo.appspot.com')
      ),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
      ),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
        getEnvValue('VITE_FIREBASE_APP_ID', '1:123456789:web:demo')
      ),
      
      // reCAPTCHA configuration
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(
        getEnvValue('VITE_RECAPTCHA_SITE_KEY', '6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K')
      ),
      
      // App configuration
      'import.meta.env.VITE_APP_ENV': JSON.stringify(
        getEnvValue('VITE_APP_ENV', mode)
      ),
      'import.meta.env.VITE_APP_BASE_URL': JSON.stringify(
        getEnvValue('VITE_APP_BASE_URL', 'https://calendado.com')
      ),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(
        getEnvValue('VITE_DEBUG_MODE', mode === 'development' ? 'true' : 'false')
      ),
    },
    envPrefix: 'VITE_',
  };
});

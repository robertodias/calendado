import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for the specified mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fallback values for production
  const getEnvValue = (key: string, fallback: string) => {
    return env[key] || process.env[key] || fallback;
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
      // Built-in Vite environment variables
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.BASE_URL': JSON.stringify('/'),
      
      // Legacy compatibility
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      
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
    },
    envPrefix: 'VITE_',
  };
});

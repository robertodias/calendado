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
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(
        getEnvValue('VITE_RECAPTCHA_SITE_KEY', '6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K')
      ),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(
        getEnvValue('VITE_APP_ENV', 'production')
      ),
      'import.meta.env.VITE_APP_BASE_URL': JSON.stringify(
        getEnvValue('VITE_APP_BASE_URL', 'https://calendado.com')
      ),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(
        getEnvValue('VITE_DEBUG_MODE', 'false')
      ),
    },
    envPrefix: 'VITE_',
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for the specified mode
  const env = loadEnv(mode, process.cwd(), '');
  
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
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(env.VITE_RECAPTCHA_SITE_KEY),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV),
      'import.meta.env.VITE_APP_BASE_URL': JSON.stringify(env.VITE_APP_BASE_URL),
      'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(env.VITE_DEBUG_MODE),
    },
    envPrefix: 'VITE_',
  };
});

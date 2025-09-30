import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { logger } from './lib/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Check if we have valid Firebase configuration
const hasValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'demo-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'demo-project';

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null;
let auth: Auth | null;
let db: Firestore | null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    logger.info('Firebase initialized successfully', {
      component: 'firebase',
    });
  } catch (error) {
    logger.error('Failed to initialize Firebase', error as Error, {
      component: 'firebase',
    });
    app = null;
    auth = null;
    db = null;
  }
} else {
  logger.warn('Firebase not configured. Using demo values for development.', {
    component: 'firebase',
    config: {
      apiKey: firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      isDemoKey: firebaseConfig.apiKey === 'demo-key',
      isLocalDev: import.meta.env.MODE === 'development',
    },
  });
  app = null;
  auth = null;
  db = null;
}

// Export Firebase services
export { auth, db };

export default app;

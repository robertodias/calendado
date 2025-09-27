import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize admin collections with default documents if they don't exist
 */
export const initializeAdminCollections = async () => {
  if (!db) {
    console.warn('Firebase not initialized, skipping admin collections initialization');
    return;
  }

  try {
    // Initialize feature flags document with defaults
    const featureFlagsRef = doc(db, 'admin', 'featureFlags');
    await setDoc(featureFlagsRef, {
      bookingAlpha: false,
      paymentsAlpha: false,
      advancedCalendar: false,
      mobileApp: false,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: 'system',
    }, { merge: true });

    console.log('Admin collections initialized successfully');
  } catch (error) {
    console.error('Error initializing admin collections:', error);
    // Don't throw error to prevent blocking the app
  }
};

/**
 * Create an audit log entry
 */
export const createAuditLogEntry = async (entry: {
  actorUid: string;
  actorEmail: string;
  action: string;
  resource: string;
  targetUid?: string;
  targetEmail?: string;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
}) => {
  if (!db) {
    console.warn('Firebase not initialized, skipping audit log creation');
    return;
  }

  try {
    const { addDoc, collection } = await import('firebase/firestore');
    
    await addDoc(collection(db, 'admin', 'auditLogs', 'entries'), {
      timestamp: serverTimestamp(),
      ...entry,
    });
  } catch (error) {
    console.error('Error creating audit log entry:', error);
    // Don't throw error to prevent blocking the main operation
  }
};

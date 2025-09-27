import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize admin collections with default documents if they don't exist
 * Only attempts operations that the current user has permissions for
 */
export const initializeAdminCollections = async (currentUser?: { uid: string; email: string; displayName?: string; roles: string[] }) => {
  if (!db) {
    console.warn('Firebase not initialized, skipping admin collections initialization');
    return;
  }

  if (!currentUser || !currentUser.roles || currentUser.roles.length === 0) {
    console.log('User has no roles, skipping admin collections initialization');
    return;
  }

  const hasAdminRoles = currentUser.roles.some(role => ['admin', 'superadmin'].includes(role));

  try {
    // Only initialize feature flags if user has admin permissions
    if (hasAdminRoles) {
      try {
        const featureFlagsRef = doc(db, 'admin', 'featureFlags');
        const snapshot = await getDoc(featureFlagsRef);

        if (!snapshot.exists()) {
          await setDoc(featureFlagsRef, {
            bookingAlpha: false,
            paymentsAlpha: false,
            advancedCalendar: false,
            mobileApp: false,
            lastUpdated: serverTimestamp(),
            lastUpdatedBy: currentUser.email || 'system',
          });
          console.log('Feature flags initialized successfully');
        }
      } catch (flagsError) {
        console.warn('Could not initialize feature flags (may already exist):', flagsError);
      }
    }

    // User profiles are created automatically by the updateUserRoles cloud function
    // when roles are assigned. No client-side creation needed.

  } catch (error) {
    console.warn('Some admin collections could not be initialized:', error);
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

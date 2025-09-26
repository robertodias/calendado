import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

export interface UpdateUserRolesRequest {
  targetUid: string;
  roles: string[];
}

export const updateUserRoles = onCall<UpdateUserRolesRequest>(
  {
    cors: true,
    region: 'us-central1',
  },
  async (request) => {
    const { auth, data } = request;

    // Validate authentication
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate input
    if (!data?.targetUid || !Array.isArray(data?.roles)) {
      throw new HttpsError('invalid-argument', 'targetUid and roles array are required');
    }

    const { targetUid, roles } = data;

    try {
      // Get current user's custom claims
      const currentUser = await getAuth().getUser(auth.uid);
      const currentUserClaims = currentUser.customClaims || {};
      const currentUserRoles = currentUserClaims.roles || [];

      // Check if current user is superadmin
      if (!currentUserRoles.includes('superadmin')) {
        throw new HttpsError('permission-denied', 'Only superadmins can change user roles');
      }

      // Validate roles
      const validRoles = ['superadmin', 'admin', 'support', 'editor', 'viewer'];
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        throw new HttpsError('invalid-argument', `Invalid roles: ${invalidRoles.join(', ')}`);
      }

      // Get target user info
      const targetUser = await getAuth().getUser(targetUid);
      const currentTargetClaims = targetUser.customClaims || {};
      const currentTargetRoles = currentTargetClaims.roles || [];

      // Update custom claims
      await getAuth().setCustomUserClaims(targetUid, {
        ...currentTargetClaims,
        roles: roles
      });

      // Update user document in Firestore (mirror for UI)
      const db = getFirestore();
      const userRef = db.collection('users').doc(targetUid);
      
      await userRef.set({
        uid: targetUid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        roles: roles,
        lastUpdated: FieldValue.serverTimestamp(),
        updatedBy: auth.uid
      }, { merge: true });

      // Create audit log entry
      await db.collection('admin').doc('auditLogs').collection('entries').add({
        timestamp: FieldValue.serverTimestamp(),
        actorUid: auth.uid,
        actorEmail: currentUser.email,
        targetUid: targetUid,
        targetEmail: targetUser.email,
        action: 'update_roles',
        resource: 'user_roles',
        before: { roles: currentTargetRoles },
        after: { roles: roles },
        metadata: {
          userAgent: request.rawRequest?.headers['user-agent'],
          ip: request.rawRequest?.ip
        }
      });

      logger.info('User roles updated', {
        actorUid: auth.uid,
        actorEmail: currentUser.email,
        targetUid,
        targetEmail: targetUser.email,
        oldRoles: currentTargetRoles,
        newRoles: roles
      });

      return {
        success: true,
        message: 'User roles updated successfully',
        targetUid,
        targetEmail: targetUser.email,
        oldRoles: currentTargetRoles,
        newRoles: roles
      };

    } catch (error: any) {
      logger.error('Error updating user roles', {
        error: error.message,
        actorUid: auth.uid,
        targetUid,
        roles
      });

      // Re-throw HttpsError as-is
      if (error instanceof HttpsError) {
        throw error;
      }

      // Convert other errors to HttpsError
      throw new HttpsError('internal', `Failed to update user roles: ${error.message}`);
    }
  }
);

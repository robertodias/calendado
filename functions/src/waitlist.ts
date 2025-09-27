/**
 * Waitlist management Cloud Functions
 * 
 * Provides callable HTTPS functions for managing waitlist entries,
 * including inviting users and rejecting entries.
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { validateAdmin, validateOrgAccess } from './lib/authz';
import { createWaitlistAuditLog, createInviteAuditLog, formatWaitlistDetails, formatInviteDetails } from './lib/audit';

// Types for function parameters and responses
export interface InviteFromWaitlistRequest {
  entryId: string;
  role?: string;
  orgId?: string;
}

export interface InviteFromWaitlistResponse {
  success: boolean;
  inviteId?: string;
  message: string;
  error?: string;
}

export interface RejectWaitlistRequest {
  entryId: string;
  reason?: string;
}

export interface RejectWaitlistResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'invited' | 'rejected' | 'active';
  language: string;
  createdAt: Date;
  updatedAt?: Date;
  comms: {
    confirmation: {
      sent: boolean;
      sentAt?: Date;
      messageId?: string;
      error?: string;
    };
  };
  dedupeKey?: string;
  captchaVerified: boolean;
  captchaToken?: string;
  rejectedAt?: Date;
  rejectedReason?: string;
  invitedAt?: Date;
  invitedBy?: string;
  inviteId?: string;
}

export interface InviteDoc {
  id: string;
  email: string;
  role: string;
  orgId?: string;
  status: 'pending' | 'used' | 'expired' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * Invites a user from the waitlist
 * 
 * Validates admin permissions, creates an invite, updates waitlist status,
 * and logs the action for audit purposes.
 */
export const inviteFromWaitlist = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<InviteFromWaitlistRequest>) => {
    try {
      // Validate authentication and admin privileges
      const authResult = await validateAdmin(request);
      if (!authResult.success) {
        throw new HttpsError('permission-denied', authResult.error || 'Admin privileges required');
      }

      const { entryId, role = 'viewer', orgId } = request.data;
      const actor = authResult.user!;

      if (!entryId) {
        throw new HttpsError('invalid-argument', 'Entry ID is required');
      }

      const db = getFirestore();

      // Get the waitlist entry
      const waitlistRef = db.collection('waitlist').doc(entryId);
      const waitlistDoc = await waitlistRef.get();

      if (!waitlistDoc.exists) {
        throw new HttpsError('not-found', 'Waitlist entry not found');
      }

      const waitlistData = waitlistDoc.data() as WaitlistEntry;

      // Check if already invited
      if (waitlistData.status === 'invited') {
        return {
          success: true,
          inviteId: waitlistData.inviteId,
          message: 'User already invited from waitlist'
        };
      }

      // Check if already rejected
      if (waitlistData.status === 'rejected') {
        throw new HttpsError('failed-precondition', 'Cannot invite a rejected waitlist entry');
      }

      // Validate organization access if orgId is provided
      if (orgId) {
        const orgAccessResult = await validateOrgAccess(request, orgId);
        if (!orgAccessResult.success) {
          throw new HttpsError('permission-denied', orgAccessResult.error || 'Access denied to organization');
        }
      }

      // Create invite document
      const inviteRef = db.collection('invites').doc();
      const inviteId = inviteRef.id;
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const inviteData: InviteDoc = {
        id: inviteId,
        email: waitlistData.email,
        role,
        orgId,
        status: 'pending',
        createdAt: new Date(),
        expiresAt,
        createdBy: actor.uid,
        metadata: {
          source: 'waitlist',
          waitlistEntryId: entryId
        }
      };

      // Use batch to ensure atomicity
      const batch = db.batch();
      
      // Create invite
      batch.set(inviteRef, inviteData);
      
      // Update waitlist entry
      batch.update(waitlistRef, {
        status: 'invited',
        invitedAt: new Date(),
        invitedBy: actor.uid,
        inviteId,
        updatedAt: new Date()
      });

      await batch.commit();

      // Create audit logs
      await createWaitlistAuditLog(
        actor,
        'invite',
        entryId,
        formatWaitlistDetails(entryId, 'invited', waitlistData.email, {
          role,
          orgId,
          inviteId
        })
      );

      await createInviteAuditLog(
        actor,
        'create',
        inviteId,
        formatInviteDetails(inviteId, waitlistData.email, role, orgId, {
          waitlistEntryId: entryId
        })
      );

      return {
        success: true,
        inviteId,
        message: `Successfully invited ${waitlistData.email} from waitlist`
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in inviteFromWaitlist:', error);
      throw new HttpsError('internal', 'Failed to invite from waitlist');
    }
  }
);

/**
 * Rejects a waitlist entry
 * 
 * Soft-rejects the entry by updating its status and logging the reason.
 */
export const rejectWaitlist = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<RejectWaitlistRequest>) => {
    try {
      // Validate authentication and admin privileges
      const authResult = await validateAdmin(request);
      if (!authResult.success) {
        throw new HttpsError('permission-denied', authResult.error || 'Admin privileges required');
      }

      const { entryId, reason = 'No reason provided' } = request.data;
      const actor = authResult.user!;

      if (!entryId) {
        throw new HttpsError('invalid-argument', 'Entry ID is required');
      }

      const db = getFirestore();

      // Get the waitlist entry
      const waitlistRef = db.collection('waitlist').doc(entryId);
      const waitlistDoc = await waitlistRef.get();

      if (!waitlistDoc.exists) {
        throw new HttpsError('not-found', 'Waitlist entry not found');
      }

      const waitlistData = waitlistDoc.data() as WaitlistEntry;

      // Check if already rejected
      if (waitlistData.status === 'rejected') {
        return {
          success: true,
          message: 'Waitlist entry already rejected'
        };
      }

      // Check if already invited
      if (waitlistData.status === 'invited') {
        throw new HttpsError('failed-precondition', 'Cannot reject an already invited waitlist entry');
      }

      // Update waitlist entry
      await waitlistRef.update({
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedReason: reason,
        rejectedBy: actor.uid,
        updatedAt: new Date()
      });

      // Create audit log
      await createWaitlistAuditLog(
        actor,
        'reject',
        entryId,
        formatWaitlistDetails(entryId, 'rejected', waitlistData.email, {
          reason
        })
      );

      return {
        success: true,
        message: `Successfully rejected waitlist entry for ${waitlistData.email}`
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in rejectWaitlist:', error);
      throw new HttpsError('internal', 'Failed to reject waitlist entry');
    }
  }
);

/**
 * Gets waitlist entry details
 * 
 * Allows admins to retrieve detailed information about a waitlist entry.
 */
export const getWaitlistEntry = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<{ entryId: string }>) => {
    try {
      // Validate authentication and admin privileges
      const authResult = await validateAdmin(request);
      if (!authResult.success) {
        throw new HttpsError('permission-denied', authResult.error || 'Admin privileges required');
      }

      const { entryId } = request.data;

      if (!entryId) {
        throw new HttpsError('invalid-argument', 'Entry ID is required');
      }

      const db = getFirestore();
      const waitlistRef = db.collection('waitlist').doc(entryId);
      const waitlistDoc = await waitlistRef.get();

      if (!waitlistDoc.exists) {
        throw new HttpsError('not-found', 'Waitlist entry not found');
      }

      const entry = waitlistDoc.data() as WaitlistEntry;

      return {
        success: true,
        entry
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in getWaitlistEntry:', error);
      throw new HttpsError('internal', 'Failed to get waitlist entry');
    }
  }
);

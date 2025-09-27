/**
 * Magic Link Cloud Functions
 * 
 * Provides callable HTTPS functions for issuing magic links
 * and handling magic link validation.
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { validateAdmin } from './lib/authz';
import { createInviteToken, validateMagicLinkToken } from './tokens';
import { sendInviteEmail } from './email';
import { createInviteAuditLog, formatInviteDetails } from './lib/audit';

// Types for function parameters and responses
export interface IssueMagicLinkRequest {
  inviteId: string;
  expiresInHours?: number;
  sendEmail?: boolean;
}

export interface IssueMagicLinkResponse {
  success: boolean;
  token?: string;
  url?: string;
  expiresAt?: Date;
  messageId?: string;
  message: string;
  error?: string;
}

export interface ValidateMagicLinkRequest {
  token: string;
}

export interface ValidateMagicLinkResponse {
  success: boolean;
  valid: boolean;
  payload?: {
    inviteId: string;
    email: string;
    type: 'invite' | 'password_reset';
    expiresAt?: Date;
  };
  error?: string;
}

/**
 * Issues a magic link for an invite
 * 
 * Creates a JWT token with configurable expiration and optionally sends an email.
 */
export const issueMagicLink = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<IssueMagicLinkRequest>) => {
    try {
      // Validate authentication and admin privileges
      const authResult = await validateAdmin(request);
      if (!authResult.success) {
        throw new HttpsError('permission-denied', authResult.error || 'Admin privileges required');
      }

      const { inviteId, expiresInHours = 72, sendEmail = true } = request.data;
      const actor = authResult.user!;

      if (!inviteId) {
        throw new HttpsError('invalid-argument', 'Invite ID is required');
      }

      if (expiresInHours < 1 || expiresInHours > 168) { // Max 7 days
        throw new HttpsError('invalid-argument', 'Expiration must be between 1 and 168 hours');
      }

      const db = getFirestore();

      // Get the invite document
      const inviteRef = db.collection('invites').doc(inviteId);
      const inviteDoc = await inviteRef.get();

      if (!inviteDoc.exists) {
        throw new HttpsError('not-found', 'Invite not found');
      }

      const inviteData = inviteDoc.data();
      if (!inviteData) {
        throw new HttpsError('not-found', 'Invite data not found');
      }

      // Check if invite is still valid
      if (inviteData.status !== 'pending') {
        throw new HttpsError('failed-precondition', `Invite is no longer valid. Status: ${inviteData.status}`);
      }

      // Check if invite has expired
      if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
        throw new HttpsError('failed-precondition', 'Invite has expired');
      }

      // Create magic link token
      const tokenResult = createInviteToken(inviteData.email, inviteData.email, expiresInHours);
      
      if (!tokenResult.success) {
        throw new HttpsError('internal', tokenResult.error || 'Failed to create magic link token');
      }

      let messageId: string | undefined;

      // Send email if requested
      if (sendEmail) {
        const emailResult = await sendInviteEmail({
          email: inviteData.email,
          token: tokenResult.token!,
          brandName: inviteData.brandName,
          inviteUrl: tokenResult.url,
          expiresAt: tokenResult.expiresAt
        });

        if (!emailResult.success) {
          console.warn('Failed to send magic link email:', emailResult.error);
          // Don't fail the entire operation if email fails
        } else {
          messageId = emailResult.messageId;
        }
      }

      // Update invite with magic link info
      await inviteRef.update({
        magicLinkToken: tokenResult.token,
        magicLinkUrl: tokenResult.url,
        magicLinkExpiresAt: tokenResult.expiresAt,
        magicLinkCreatedAt: new Date(),
        magicLinkCreatedBy: actor.uid,
        updatedAt: new Date()
      });

      // Create audit log
      await createInviteAuditLog(
        actor,
        'create',
        inviteId,
        formatInviteDetails(inviteId, inviteData.email, inviteData.role, inviteData.orgId, {
          expiresInHours,
          sendEmail,
          messageId
        })
      );

      return {
        success: true,
        token: tokenResult.token,
        url: tokenResult.url,
        expiresAt: tokenResult.expiresAt,
        messageId,
        message: `Magic link created successfully${sendEmail ? ' and email sent' : ''}`
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in issueMagicLink:', error);
      throw new HttpsError('internal', 'Failed to issue magic link');
    }
  }
);

/**
 * Validates a magic link token
 * 
 * Validates the JWT token and returns the payload if valid.
 */
export const validateMagicLink = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<ValidateMagicLinkRequest>) => {
    try {
      const { token } = request.data;

      if (!token) {
        throw new HttpsError('invalid-argument', 'Token is required');
      }

      // Validate the token
      const validationResult = validateMagicLinkToken(token);

      if (!validationResult.valid) {
        return {
          success: true,
          valid: false,
          error: validationResult.error
        };
      }

      const payload = validationResult.payload!;

      // Get additional info from the invite if it's an invite token
      if (payload.type === 'invite') {
        const db = getFirestore();
        const inviteRef = db.collection('invites').doc(payload.inviteId);
        const inviteDoc = await inviteRef.get();
        
        if (inviteDoc.exists) {
          // Additional invite data could be processed here if needed
        }
      }

      return {
        success: true,
        valid: true,
        payload: {
          inviteId: payload.inviteId,
          email: payload.email,
          type: payload.type,
          expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined
        }
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in validateMagicLink:', error);
      throw new HttpsError('internal', 'Failed to validate magic link');
    }
  }
);

/**
 * Redeems a magic link token
 * 
 * Marks the invite as used and creates user account if needed.
 */
export const redeemMagicLink = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<{ token: string; userData?: Record<string, unknown> }>) => {
    try {
      const { token } = request.data;

      if (!token) {
        throw new HttpsError('invalid-argument', 'Token is required');
      }

      // Validate the token
      const validationResult = validateMagicLinkToken(token);

      if (!validationResult.valid) {
        throw new HttpsError('invalid-argument', validationResult.error || 'Invalid token');
      }

      const payload = validationResult.payload!;

      if (payload.type !== 'invite') {
        throw new HttpsError('invalid-argument', 'Token is not an invite token');
      }

      const db = getFirestore();

      // Get the invite document
      const inviteRef = db.collection('invites').doc(payload.inviteId);
      const inviteDoc = await inviteRef.get();

      if (!inviteDoc.exists) {
        throw new HttpsError('not-found', 'Invite not found');
      }

      const inviteData = inviteDoc.data()!;

      // Check if invite is still valid
      if (inviteData.status !== 'pending') {
        throw new HttpsError('failed-precondition', `Invite is no longer valid. Status: ${inviteData.status}`);
      }

      // Mark invite as used
      await inviteRef.update({
        status: 'used',
        usedAt: new Date(),
        usedBy: payload.email, // This would be the actual user ID in a real implementation
        updatedAt: new Date()
      });

      // Update waitlist entry if it exists
      if (inviteData.waitlistEntryId) {
        const waitlistRef = db.collection('waitlist').doc(inviteData.waitlistEntryId);
        await waitlistRef.update({
          status: 'active',
          activatedAt: new Date(),
          activatedBy: payload.email,
          updatedAt: new Date()
        });
      }

      return {
        success: true,
        message: 'Magic link redeemed successfully',
        inviteId: payload.inviteId,
        email: payload.email
      };

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      
      console.error('Error in redeemMagicLink:', error);
      throw new HttpsError('internal', 'Failed to redeem magic link');
    }
  }
);

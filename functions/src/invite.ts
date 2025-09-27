/**
 * Invite Consumption Cloud Function
 * 
 * Handles magic link token validation and user account creation
 * when users click on invitation links.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { validateMagicLinkToken } from './tokens';
import { createUserAuditLog } from './lib/audit';
import { UserDoc, WaitlistDoc } from './models';
import { Timestamp } from 'firebase-admin/firestore';

// Extended invite interface for our use case
interface InviteDocExtended {
  id: string;
  email: string;
  status: 'pending' | 'used' | 'expired' | 'cancelled';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  usedAt?: Timestamp;
  usedBy?: string;
  createdBy: string;
  role?: string;
  orgId?: string;
  waitlistEntryId?: string;
  magicLinkToken?: string;
  magicLinkUrl?: string;
  magicLinkExpiresAt?: Timestamp;
}
import { defineSecret } from 'firebase-functions/params';

const db = getFirestore();
const auth = getAuth();

// Define secrets
const publicAppUrl = defineSecret('PUBLIC_APP_URL');

export interface ConsumeInviteRequest {
  token: string;
  userData?: {
    displayName?: string;
    preferences?: Record<string, unknown>;
  };
}

export interface ConsumeInviteResponse {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
    roles: string[];
    orgId?: string;
  };
  redirectUrl?: string;
  error?: string;
}

/**
 * Consumes an invitation token and creates/updates user account
 * 
 * POST /api/invite/consume
 * Body: { token: string, userData?: { displayName?: string, preferences?: object } }
 */
export const consumeInvite = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [publicAppUrl],
  },
  async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      });
      return;
    }

    try {
      const { token, userData }: ConsumeInviteRequest = req.body;

      // Validate request body
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Token is required and must be a string.',
        });
        return;
      }

      // Validate magic link token
      const tokenResult = validateMagicLinkToken(token);
      if (!tokenResult.valid || !tokenResult.payload) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired token.',
        });
        return;
      }

      const { inviteId, email, type } = tokenResult.payload;

      // Only handle invite type tokens
      if (type !== 'invite') {
        res.status(400).json({
          success: false,
          error: 'Invalid token type. This endpoint only handles invitation tokens.',
        });
        return;
      }

      // Load invite from Firestore
      const inviteRef = db.collection('invites').doc(inviteId);
      const inviteDoc = await inviteRef.get();

      if (!inviteDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Invitation not found.',
        });
        return;
      }

      const invite = inviteDoc.data() as InviteDocExtended;

      // Check if invite is already used
      if (invite.status === 'used' || invite.usedAt) {
        res.status(400).json({
          success: false,
          error: 'This invitation has already been used.',
        });
        return;
      }

      // Check if invite is expired
      if (invite.expiresAt && new Date() > invite.expiresAt.toDate()) {
        res.status(400).json({
          success: false,
          error: 'This invitation has expired.',
        });
        return;
      }

      // Verify email matches
      if (invite.email !== email) {
        res.status(400).json({
          success: false,
          error: 'Email mismatch. Please use the correct invitation link.',
        });
        return;
      }

      // Check if user already exists
      let userRecord;
      let isNewUser = false;

      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // User doesn't exist, we'll create them
          isNewUser = true;
        } else {
          throw error;
        }
      }

      // If user exists, check if they already have the role/org
      if (!isNewUser) {
        const existingClaims = userRecord!.customClaims || {};
        const existingRoles = existingClaims.roles || {};
        
        // Check if user already has access to this org
        if (invite.orgId && existingRoles[invite.orgId]) {
          res.status(400).json({
            success: false,
            error: 'You already have access to this organization.',
          });
          return;
        }
      }

      // Use transaction to ensure atomicity
      const result = await db.runTransaction(async (transaction) => {
        if (isNewUser) {
          // Create new user account
          const newUserRecord = await auth.createUser({
            email: email,
            displayName: userData?.displayName || invite.email.split('@')[0],
            emailVerified: true, // Trust the invitation process
          });

          // Set custom claims
          const customClaims: Record<string, any> = {
            roles: invite.role ? [invite.role] : ['viewer'],
          };

          if (invite.orgId) {
            customClaims.roles = {
              [invite.orgId]: invite.role || 'viewer',
            };
          }

          await auth.setCustomUserClaims(newUserRecord.uid, customClaims);

          // Create user document in Firestore
          const userDoc: UserDoc = {
            id: newUserRecord.uid,
            email: email,
            displayName: userData?.displayName || invite.email.split('@')[0],
            roles: invite.role ? [invite.role as any] : ['viewer'],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            lastSignIn: Timestamp.now(),
            contact: {
              email: email,
            },
            preferences: {
              language: 'en-US',
              timezone: 'UTC',
              notifications: {
                email: true,
                push: true,
                sms: false,
              },
            },
          };

          transaction.set(db.collection('users').doc(newUserRecord.uid), userDoc);

          // Update waitlist status if there's a matching entry
          if (invite.waitlistEntryId) {
            const waitlistRef = db.collection('waitlist').doc(invite.waitlistEntryId);
            const waitlistDoc = await transaction.get(waitlistRef);
            
            if (waitlistDoc.exists) {
              const waitlistData = waitlistDoc.data() as WaitlistDoc;
              if (waitlistData.email === email) {
                transaction.update(waitlistRef, {
                  status: 'accepted',
                  updatedAt: new Date(),
                  acceptedBy: newUserRecord.uid,
                });
              }
            }
          }

          // Mark invite as used
          transaction.update(inviteRef, {
            status: 'used',
            usedAt: new Date(),
            usedBy: newUserRecord.uid,
          });

          // Create audit log
          await createUserAuditLog(
            {
              uid: newUserRecord.uid,
              email: newUserRecord.email,
              customClaims: customClaims,
            },
            'user_created',
            newUserRecord.uid,
            userDoc as unknown as Record<string, unknown>
          );

          return {
            success: true,
            user: {
              uid: newUserRecord.uid,
              email: email,
              displayName: userDoc.displayName,
              roles: invite.role ? [invite.role] : ['viewer'],
              orgId: invite.orgId,
            },
            isNewUser: true,
          };
        } else {
          // Update existing user
          const existingClaims = userRecord!.customClaims || {};
          const existingRoles = existingClaims.roles || {};

          // Add new role/org to existing claims
          if (invite.orgId) {
            existingRoles[invite.orgId] = invite.role || 'viewer';
          } else {
            // Platform-level role
            const platformRoles = existingClaims.platformRoles || [];
            if (invite.role && !platformRoles.includes(invite.role)) {
              platformRoles.push(invite.role);
            }
            existingRoles.platformRoles = platformRoles;
          }

          await auth.setCustomUserClaims(userRecord!.uid, {
            ...existingClaims,
            roles: existingRoles,
          });

          // Update user document
          const userRef = db.collection('users').doc(userRecord!.uid);
          const userDoc = await transaction.get(userRef);
          
          if (userDoc.exists) {
            const currentUserData = userDoc.data() as UserDoc;
            const updatedRoles = [...currentUserData.roles];
            
            if (invite.role && !updatedRoles.includes(invite.role as any)) {
              updatedRoles.push(invite.role as any);
            }

            transaction.update(userRef, {
              roles: updatedRoles,
              lastSignIn: new Date(),
              ...(userData?.displayName && { displayName: userData.displayName }),
              ...(userData?.preferences && { preferences: userData.preferences }),
            });
          }

          // Update waitlist status if there's a matching entry
          if (invite.waitlistEntryId) {
            const waitlistRef = db.collection('waitlist').doc(invite.waitlistEntryId);
            const waitlistDoc = await transaction.get(waitlistRef);
            
            if (waitlistDoc.exists) {
              const waitlistData = waitlistDoc.data() as WaitlistDoc;
              if (waitlistData.email === email) {
                transaction.update(waitlistRef, {
                  status: 'accepted',
                  updatedAt: new Date(),
                  acceptedBy: userRecord!.uid,
                });
              }
            }
          }

          // Mark invite as used
          transaction.update(inviteRef, {
            status: 'used',
            usedAt: new Date(),
            usedBy: userRecord!.uid,
          });

          // Create audit log
          await createUserAuditLog(
            {
              uid: userRecord!.uid,
              email: userRecord!.email,
              customClaims: existingClaims,
            },
            'user_role_added',
            userRecord!.uid,
            { roles: existingRoles }
          );

          return {
            success: true,
            user: {
              uid: userRecord!.uid,
              email: email,
              displayName: userRecord!.displayName,
              roles: Object.values(existingRoles).flat(),
              orgId: invite.orgId,
            },
            isNewUser: false,
          };
        }
      });

      // Generate redirect URL
      const appUrl = publicAppUrl.value();
      const redirectUrl = `${appUrl}/dashboard?welcome=${isNewUser ? 'true' : 'false'}`;

      res.status(200).json({
        success: true,
        message: isNewUser 
          ? 'Account created successfully! Welcome to Calendado.'
          : 'Invitation accepted! Your account has been updated.',
        user: result.user,
        redirectUrl,
      });

    } catch (error: any) {
      console.error('Error consuming invite:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

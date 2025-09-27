/**
 * Audit logging helpers for Cloud Functions
 * 
 * Provides utilities for creating audit log entries
 * to track administrative actions and changes.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { AuthUser } from './authz';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorUid: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogResult {
  success: boolean;
  auditId?: string;
  error?: string;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(
  actor: AuthUser,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {},
  metadata?: Record<string, unknown>
): Promise<AuditLogResult> {
  try {
    const db = getFirestore();
    const auditId = db.collection('admin').doc('auditLogs').collection('entries').doc().id;
    
    const auditEntry: AuditLogEntry = {
      id: auditId,
      timestamp: new Date(),
      actorUid: actor.uid,
      actorEmail: actor.email,
      action,
      targetType,
      targetId,
      details,
      metadata
    };

    await db.collection('admin').doc('auditLogs').collection('entries').doc(auditId).set(auditEntry);

    return {
      success: true,
      auditId
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates an audit log entry for waitlist operations
 */
export async function createWaitlistAuditLog(
  actor: AuthUser,
  action: 'invite' | 'reject' | 'update',
  waitlistEntryId: string,
  details: Record<string, unknown> = {},
  metadata?: Record<string, unknown>
): Promise<AuditLogResult> {
  return createAuditLog(
    actor,
    `waitlist_${action}`,
    'waitlist_entry',
    waitlistEntryId,
    details,
    metadata
  );
}

/**
 * Creates an audit log entry for invite operations
 */
export async function createInviteAuditLog(
  actor: AuthUser,
  action: 'create' | 'update' | 'cancel',
  inviteId: string,
  details: Record<string, unknown> = {},
  metadata?: Record<string, unknown>
): Promise<AuditLogResult> {
  return createAuditLog(
    actor,
    `invite_${action}`,
    'invite',
    inviteId,
    details,
    metadata
  );
}

/**
 * Creates an audit log entry for organization operations
 */
export async function createOrgAuditLog(
  actor: AuthUser,
  action: string,
  orgId: string,
  details: Record<string, unknown> = {},
  metadata?: Record<string, unknown>
): Promise<AuditLogResult> {
  return createAuditLog(
    actor,
    `org_${action}`,
    'organization',
    orgId,
    details,
    metadata
  );
}

/**
 * Creates an audit log entry for user operations
 */
export async function createUserAuditLog(
  actor: AuthUser,
  action: string,
  targetUserId: string,
  details: Record<string, unknown> = {},
  metadata?: Record<string, unknown>
): Promise<AuditLogResult> {
  return createAuditLog(
    actor,
    `user_${action}`,
    'user',
    targetUserId,
    details,
    metadata
  );
}

/**
 * Helper to format audit log details for waitlist operations
 */
export function formatWaitlistDetails(
  entryId: string,
  status: string,
  email: string,
  additionalDetails: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    waitlistEntryId: entryId,
    status,
    email,
    ...additionalDetails
  };
}

/**
 * Helper to format audit log details for invite operations
 */
export function formatInviteDetails(
  inviteId: string,
  email: string,
  role: string,
  orgId?: string,
  additionalDetails: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    inviteId,
    email,
    role,
    orgId,
    ...additionalDetails
  };
}

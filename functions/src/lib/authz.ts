/**
 * Authorization helpers for Cloud Functions
 * 
 * Provides utilities for validating user permissions and roles
 * across different collections and operations.
 */

import { CallableRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';

export interface AuthUser {
  uid: string;
  email?: string;
  customClaims?: {
    platformAdmin?: boolean;
    roles?: Record<string, string>;
  };
}

export interface AuthorizationResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Validates that the request is authenticated and extracts user information
 */
export async function validateAuth(request: CallableRequest): Promise<AuthorizationResult> {
  try {
    if (!request.auth) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const auth = getAuth();
    const userRecord = await auth.getUser(request.auth.uid);
    
    return {
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        customClaims: userRecord.customClaims as any
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Authentication validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates that the user has platform admin privileges
 */
export async function validatePlatformAdmin(request: CallableRequest): Promise<AuthorizationResult> {
  const authResult = await validateAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.user!;
  
  if (!user.customClaims?.platformAdmin) {
    return {
      success: false,
      error: 'Platform admin privileges required'
    };
  }

  return authResult;
}

/**
 * Validates that the user has admin privileges (platform admin or org admin)
 */
export async function validateAdmin(request: CallableRequest, orgId?: string): Promise<AuthorizationResult> {
  const authResult = await validateAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.user!;
  
  // Platform admin has access to everything
  if (user.customClaims?.platformAdmin) {
    return authResult;
  }

  // Check org admin role if orgId is provided
  if (orgId && user.customClaims?.roles?.[orgId] === 'org_admin') {
    return authResult;
  }

  return {
    success: false,
    error: 'Admin privileges required'
  };
}

/**
 * Validates that the user has access to a specific organization
 */
export async function validateOrgAccess(request: CallableRequest, orgId: string): Promise<AuthorizationResult> {
  const authResult = await validateAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.user!;
  
  // Platform admin has access to everything
  if (user.customClaims?.platformAdmin) {
    return authResult;
  }

  // Check if user has any role in the organization
  const userRole = user.customClaims?.roles?.[orgId];
  if (!userRole) {
    return {
      success: false,
      error: `Access denied: User does not have access to organization ${orgId}`
    };
  }

  return authResult;
}

/**
 * Validates that the user has write access to a specific organization
 */
export async function validateOrgWriteAccess(request: CallableRequest, orgId: string): Promise<AuthorizationResult> {
  const authResult = await validateAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const user = authResult.user!;
  
  // Platform admin has access to everything
  if (user.customClaims?.platformAdmin) {
    return authResult;
  }

  // Check if user has write role in the organization
  const userRole = user.customClaims?.roles?.[orgId];
  const writeRoles = ['owner', 'org_admin', 'store_manager'];
  
  if (!userRole || !writeRoles.includes(userRole)) {
    return {
      success: false,
      error: `Write access denied: User role '${userRole}' does not have write access to organization ${orgId}`
    };
  }

  return authResult;
}

/**
 * Gets the user's role in a specific organization
 */
export function getUserOrgRole(user: AuthUser, orgId: string): string | null {
  return user.customClaims?.roles?.[orgId] || null;
}

/**
 * Checks if a user has a specific role in an organization
 */
export function hasOrgRole(user: AuthUser, orgId: string, role: string): boolean {
  return user.customClaims?.roles?.[orgId] === role;
}

/**
 * Checks if a user has any of the specified roles in an organization
 */
export function hasAnyOrgRole(user: AuthUser, orgId: string, roles: string[]): boolean {
  const userRole = user.customClaims?.roles?.[orgId];
  return userRole ? roles.includes(userRole) : false;
}

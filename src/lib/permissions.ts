import { getIdTokenResult, type IdTokenResult, type User } from 'firebase/auth';

export interface CustomClaims {
  roles?: string[] | string;
  platformAdmin?: boolean;
  admin?: boolean;
  isAdmin?: boolean;
  [key: string]: unknown;
}

/**
 * Checks if a user has platform admin privileges by examining their custom claims
 *
 * @param user - The Firebase user object
 * @returns Promise<boolean> - True if user has platform admin privileges
 *
 * @example
 * ```typescript
 * const isAdmin = await checkPlatformAdmin(user);
 * if (isAdmin) {
 *   // User has admin privileges
 * }
 * ```
 */
export async function checkPlatformAdmin(
  user: User,
  existingTokenResult?: IdTokenResult
): Promise<boolean> {
  try {
    const tokenResult = existingTokenResult ?? (await getIdTokenResult(user));
    const claims = tokenResult.claims as CustomClaims;

    console.log('🔍 Checking platform admin status for user:', user.uid);
    console.log('📋 Custom claims:', claims);

    // Check direct platform admin flag
    if (claims.platformAdmin === true) {
      console.log('✅ User has platformAdmin: true');
      return true;
    }

    // Check admin flags
    if (claims.admin === true || claims.isAdmin === true) {
      console.log('✅ User has admin/isAdmin: true');
      return true;
    }

    // Check roles
    if (claims.roles) {
      if (Array.isArray(claims.roles)) {
        const hasAdminRole =
          claims.roles.includes('superadmin') ||
          claims.roles.includes('platformAdmin') ||
          claims.roles.includes('admin');
        console.log(
          '📊 Roles array:',
          claims.roles,
          'Has admin role:',
          hasAdminRole
        );
        return hasAdminRole;
      }

      if (typeof claims.roles === 'string') {
        const hasAdminRole =
          claims.roles.includes('superadmin') ||
          claims.roles.includes('platformAdmin') ||
          claims.roles.includes('admin');
        console.log(
          '📝 Roles string:',
          claims.roles,
          'Has admin role:',
          hasAdminRole
        );
        return hasAdminRole;
      }
    }

    console.log('❌ User does not have platform admin privileges');
    return false;
  } catch (error) {
    console.error('🚨 Error checking platform admin status:', error);
    return false;
  }
}

/**
 * Checks if a user has any of the specified roles
 *
 * @param user - The Firebase user object
 * @param requiredRoles - Array of roles to check for
 * @returns Promise<boolean> - True if user has any of the required roles
 */
export async function checkUserRoles(
  user: User,
  requiredRoles: string[],
  existingTokenResult?: IdTokenResult
): Promise<boolean> {
  try {
    const tokenResult = existingTokenResult ?? (await getIdTokenResult(user));
    const claims = tokenResult.claims as CustomClaims;

    if (!claims.roles) {
      return false;
    }

    if (Array.isArray(claims.roles)) {
      return requiredRoles.some(role => claims.roles?.includes(role));
    }

    if (typeof claims.roles === 'string') {
      return requiredRoles.some(role => claims.roles?.includes(role));
    }

    return false;
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
}

/**
 * Gets all roles for a user from their custom claims
 *
 * @param user - The Firebase user object
 * @returns Promise<string[]> - Array of user roles
 */
export async function getUserRoles(
  user: User,
  existingTokenResult?: IdTokenResult
): Promise<string[]> {
  try {
    const tokenResult = existingTokenResult ?? (await getIdTokenResult(user));
    const claims = tokenResult.claims as CustomClaims;

    if (Array.isArray(claims.roles)) {
      return claims.roles;
    }

    if (typeof claims.roles === 'string') {
      return [claims.roles];
    }

    return [];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

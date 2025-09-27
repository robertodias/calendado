import type { User } from 'firebase/auth';

export type UserRole = 'superadmin' | 'admin' | 'support' | 'editor' | 'viewer';

export interface AuthUser extends User {
  roles: UserRole[];
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

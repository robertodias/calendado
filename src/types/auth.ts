import type { User } from 'firebase/auth';
import type { UserRole } from './shared';

export type { UserRole };

export interface AuthUser extends User {
  roles: UserRole[];
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

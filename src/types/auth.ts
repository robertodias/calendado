import type { User } from 'firebase/auth';
import type { UserRole } from '../../../functions/src/types/shared';

export interface AuthUser extends User {
  roles: UserRole[];
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

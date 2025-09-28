import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from '../firebase';
import type { UserRole, AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const createAuthUser = (
    firebaseUser: User,
    roles: UserRole[] = []
  ): AuthUser => ({
    ...firebaseUser,
    roles,
    hasRole: (requiredRoles: UserRole | UserRole[]) => {
      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      return rolesArray.some(role => roles.includes(role));
    },
  });

  const extractRolesFromToken = async (
    firebaseUser: User
  ): Promise<UserRole[]> => {
    try {
      const tokenResult = await getIdTokenResult(firebaseUser);
      const customClaims = tokenResult.claims;

      const roles = customClaims.roles as UserRole[] | undefined;
      const platformAdmin = customClaims.platformAdmin as boolean | undefined;

      // If user has platformAdmin: true, add superadmin role
      if (platformAdmin === true && (!roles || !roles.includes('superadmin'))) {
        const existingRoles = Array.isArray(roles) ? roles : [];
        return [...existingRoles, 'superadmin'];
      }

      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      console.error('Error extracting roles from token:', error);
      return [];
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    try {
      const result = await signInWithPopup(auth, provider);
      const roles = await extractRolesFromToken(result.user);
      setUser(createAuthUser(result.user, roles));
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Force refresh the ID token to get updated custom claims
      await auth.currentUser.getIdToken(true);
      const roles = await extractRolesFromToken(auth.currentUser);
      setUser(createAuthUser(auth.currentUser, roles));
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const roles = await extractRolesFromToken(firebaseUser);
        setUser(createAuthUser(firebaseUser, roles));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, AuthStateStatus, UserRole } from '../types/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  status: AuthStateStatus;
  error: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  isCitizen: boolean;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStateStatus>('INITIALIZING');
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);

        if (profile.isActive === false) {
          setStatus('INACTIVE');
          setError('Your account has been deactivated. Please contact support.');
          return;
        }
        setStatus('AUTHENTICATED');
      } else {
        // Controlled recovery path: default to CITIZEN profile if user doc is missing
        const fallbackProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || 'Citizen',
          email: firebaseUser.email || '',
          phone: '',
          role: 'CITIZEN',
          city: 'Hyderabad',
          district: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await setDoc(userRef, fallbackProfile);
        setUserProfile(fallbackProfile);
        setStatus('AUTHENTICATED');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setStatus('UNAUTHENTICATED');
        setError(null);
      }
    }, (err) => {
      console.error('Auth state listener error:', err);
      setError(err.message);
      setStatus('ERROR');
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setStatus('UNAUTHENTICATED');
    setError(null);
  };

  const resetPassword = async (email: string) => {
    await firebaseSendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const role = userProfile?.role || null;
  const isAuthenticated = status === 'AUTHENTICATED' && !!user;
  const isAdmin = isAuthenticated && role === 'ADMIN';
  const isVolunteer = isAuthenticated && role === 'VOLUNTEER';
  const isCitizen = isAuthenticated && (role === 'CITIZEN' || !role);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        status,
        error,
        role,
        isAuthenticated,
        isAdmin,
        isVolunteer,
        isCitizen,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reload,
  onAuthStateChanged,
} from 'firebase/auth';
import confetti from 'canvas-confetti';
import { auth, googleProvider, getFirebaseAuthErrorMessage } from '../services/firebase';

export interface ActivityItem {
  id: string;
  type: 'login' | 'register' | 'verification_sent' | 'verified' | 'profile_update' | 'password_change' | 'logout';
  title: string;
  description: string;
  timestamp: string;
  ipPlaceholder?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  resendCooldown: number;
  lastVerificationSentAt: number | null;
  activities: ActivityItem[];
  authError: { code?: string; message: string } | null;
  clearAuthError: () => void;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerificationStatus: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVITIES_KEY = 'authshield_user_activities';
const COOLDOWN_KEY = 'authshield_verification_cooldown';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [lastVerificationSentAt, setLastVerificationSentAt] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [authError, setAuthError] = useState<{ code?: string; message: string } | null>(null);

  // Load activities from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVITIES_KEY);
      if (stored) {
        setActivities(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load activities', e);
    }
  }, []);

  const addActivity = useCallback((type: ActivityItem['type'], title: string, description: string) => {
    const newItem: ActivityItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newItem, ...prev].slice(0, 30);
      try {
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save activity', e);
      }
      return updated;
    });
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsEmailVerified(currentUser.emailVerified);
      } else {
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<User> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const newUser = cred.user;

      // Update display name
      if (name.trim()) {
        await updateProfile(newUser, {
          displayName: name.trim(),
        });
      }

      // Send email verification immediately
      try {
        await sendEmailVerification(newUser);
        setLastVerificationSentAt(Date.now());
        setResendCooldown(60);
        addActivity('verification_sent', 'Verification Email Sent', `Sent verification link to ${email.trim()}`);
      } catch (verifErr) {
        console.warn('Initial email verification dispatch error:', verifErr);
      }

      addActivity('register', 'Account Created', `Created account with email ${email.trim()}`);
      setUser(newUser);
      setIsEmailVerified(newUser.emailVerified);
      return newUser;
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const signedInUser = cred.user;
      setUser(signedInUser);
      setIsEmailVerified(signedInUser.emailVerified);
      addActivity('login', 'User Signed In', `Authenticated via email/password`);
      return signedInUser;
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const googleUser = cred.user;
      setUser(googleUser);
      setIsEmailVerified(googleUser.emailVerified);
      addActivity('login', 'Google Sign In', `Authenticated via Google Account (${googleUser.email})`);
      return googleUser;
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to send a verification email.');
    }
    if (resendCooldown > 0) {
      throw new Error(`Please wait ${resendCooldown}s before requesting another verification email.`);
    }

    setAuthError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setLastVerificationSentAt(Date.now());
      setResendCooldown(60);
      addActivity('verification_sent', 'Verification Email Resent', `Verification email resent to ${auth.currentUser.email}`);
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await reload(auth.currentUser);
      const verified = auth.currentUser.emailVerified;
      const prevVerified = isEmailVerified;
      setIsEmailVerified(verified);
      
      if (verified && !prevVerified) {
        addActivity('verified', 'Email Verified', `Account email successfully verified!`);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return verified;
    } catch (err: any) {
      console.error('Error reloading user:', err);
      return false;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addActivity('password_change', 'Password Reset Requested', `Reset link sent to ${email.trim()}`);
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const updateUserProfile = async (name: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    setAuthError(null);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: photoURL || auth.currentUser.photoURL,
      });
      // Force refresh user state
      setUser({ ...auth.currentUser });
      addActivity('profile_update', 'Profile Updated', `Updated display name to "${name.trim()}"`);
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    setAuthError(null);
    try {
      await updatePassword(auth.currentUser, newPassword);
      addActivity('password_change', 'Password Changed', 'User account password was updated successfully');
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      const email = auth.currentUser?.email;
      await signOut(auth);
      setUser(null);
      setIsEmailVerified(false);
      if (email) {
        addActivity('logout', 'Signed Out', `User ${email} signed out`);
      }
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    setAuthError(null);
    try {
      const email = auth.currentUser.email;
      await deleteUser(auth.currentUser);
      setUser(null);
      setIsEmailVerified(false);
      addActivity('logout', 'Account Deleted', `Account ${email} was permanently deleted`);
    } catch (err: any) {
      const friendlyMessage = getFirebaseAuthErrorMessage(err);
      setAuthError({ code: err?.code, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isEmailVerified,
        resendCooldown,
        lastVerificationSentAt,
        activities,
        authError,
        clearAuthError,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resendVerificationEmail,
        checkEmailVerificationStatus,
        sendPasswordReset,
        updateUserProfile,
        updateUserPassword,
        logout,
        deleteAccount,
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

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyDfOQPcY8Yg52cHFXcSEc_6sFp2mKjPCko",
  authDomain: "fir-33d06.firebaseapp.com",
  projectId: "fir-33d06",
  storageBucket: "fir-33d06.firebasestorage.app",
  messagingSenderId: "149856087064",
  appId: "1:149856087064:web:6f82efa8f625e58dfc676d",
  measurementId: "G-Y72RYL8RT3"
};

const CONFIG_STORAGE_KEY = 'authshield_custom_firebase_config';

export function getActiveFirebaseConfig(): FirebaseConfigType {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom config, using default', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfigType): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function resetFirebaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  window.location.reload();
}

const activeConfig = getActiveFirebaseConfig();

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && activeConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in current environment
  });
}

export function getFirebaseAuthErrorMessage(errorOrCode: unknown): string {
  const code = typeof errorOrCode === 'string' 
    ? errorOrCode 
    : (errorOrCode as { code?: string })?.code || '';

  const rawMessage = (errorOrCode as { message?: string })?.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account is already registered with this email address. Please log in instead or use "Forgot Password".';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g. name@example.com).';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in your Firebase Console yet. Please enable "Email/Password" in the Authentication -> Sign-in method tab.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/user-not-found':
      return 'No account exists with this email address. Please check your spelling or register a new account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to too many failed attempts. Please wait a few minutes or reset your password.';
    case 'auth/requires-recent-login':
      return 'This action is sensitive and requires recent authentication. Please log out and log back in, then try again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in popup was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/expired-action-code':
      return 'The verification or reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'The verification or reset code is invalid or has already been used.';
    default:
      if (rawMessage.includes('EMAIL_NOT_FOUND')) {
        return 'No user found with this email.';
      }
      if (rawMessage.includes('INVALID_PASSWORD')) {
        return 'Incorrect password. Please try again.';
      }
      return rawMessage || 'An unexpected authentication error occurred. Please try again.';
  }
}

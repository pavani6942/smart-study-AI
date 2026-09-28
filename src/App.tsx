import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ConfigSettingsModal } from './components/ConfigSettingsModal';
import { Dashboard } from './components/Dashboard';
import { ShieldCheck, Mail, CheckCircle2, Lock, Sparkles, ExternalLink, KeyRound, Info } from 'lucide-react';
import { getActiveFirebaseConfig } from './services/firebase';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [prefilledForgotEmail, setPrefilledForgotEmail] = useState('');

  const config = getActiveFirebaseConfig();

  const handleOpenForgotPassword = (email?: string) => {
    setPrefilledForgotEmail(email || '');
    setIsForgotModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Initializing Firebase Auth...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      <Navbar onOpenConfig={() => setIsConfigModalOpen(true)} />

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      <main className="flex-1 flex flex-col">
        {user ? (
          <Dashboard />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Firebase Authentication Ready
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                    Secure User Management & Email Verification
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Production-grade registration and authentication flow configured with your Firebase project <span className="font-mono font-medium text-blue-600 dark:text-blue-400">fir-33d06</span>.
                  </p>
                </div>

                {/* Feature checklist */}
                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>
                      <strong>Email Verification Dispatch:</strong> Sends an official verification link on sign-up with live reload sync.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>
                      <strong>Password Strength Validation:</strong> Real-time rules & entropy meter to prevent compromised credentials.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <span>
                      <strong>Password Reset & Audit Trail:</strong> Secure recovery links and user management dashboard.
                    </span>
                  </div>
                </div>

                {/* Firebase config pill */}
                <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[11px] block">Connected Firebase Project</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      {config.projectId}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                  >
                    View Config
                  </button>
                </div>
              </div>

              {/* Right Form Card */}
              <div className="lg:col-span-6">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-gray-800 relative">
                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`py-2 rounded-lg transition cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`py-2 rounded-lg transition cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {authMode === 'login' ? (
                    <LoginForm
                      onSwitchToRegister={() => setAuthMode('register')}
                      onOpenForgotPassword={handleOpenForgotPassword}
                    />
                  ) : (
                    <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={prefilledForgotEmail}
      />

      <ConfigSettingsModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

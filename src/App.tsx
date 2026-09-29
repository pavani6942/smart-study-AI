import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ConfigSettingsModal } from './components/ConfigSettingsModal';
import { Dashboard } from './components/Dashboard';
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
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center p-6 text-[#18181a] font-mono-tech">
        <div className="w-12 h-12 border-4 border-[#18181a] border-t-[#0047ff] animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-bold">
          INITIALIZING_CORE_SYSTEMS...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#18181a] flex flex-col font-sans">
      <Navbar onOpenConfig={() => setIsConfigModalOpen(true)} />

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      <main className="flex-1 flex flex-col">
        {user ? (
          <Dashboard />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 md:p-12 grid-bg">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Industrial Descriptor */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-block px-3 py-1 bg-[#18181a] text-white font-mono-tech text-[10px] tracking-wider uppercase">
                  PROTOCOL: SECURE_AUTH
                </div>

                <div className="space-y-2">
                  <h1 className="font-display font-bold text-5xl sm:text-6xl uppercase tracking-tighter text-[#18181a] leading-[0.88]">
                    Identity<br />Gateway
                  </h1>
                  <div className="h-[2px] bg-[#18181a] w-12 my-4" />
                  <p className="font-mono-tech text-xs text-[#18181a]/70 leading-relaxed max-w-md">
                    Automated user management, credential validation, and cryptographic email verification powered by node{' '}
                    <span className="font-bold text-[#0047ff]">{config.projectId}</span>.
                  </p>
                </div>

                {/* Specs list */}
                <div className="space-y-2 font-mono-tech text-xs text-[#18181a]/80">
                  <div className="p-3 border border-[#18181a]/20 bg-white">
                    <span className="font-bold text-[#0047ff] block mb-0.5">01 // EMAIL_VERIFICATION</span>
                    Automatic link dispatch with real-time status synchronization
                  </div>

                  <div className="p-3 border border-[#18181a]/20 bg-white">
                    <span className="font-bold text-[#0047ff] block mb-0.5">02 // ENTROPY_ENFORCEMENT</span>
                    Multi-factor password strength analysis and hardened access rules
                  </div>

                  <div className="p-3 border border-[#18181a]/20 bg-white">
                    <span className="font-bold text-[#0047ff] block mb-0.5">03 // AUDIT_TELEMETRY</span>
                    Timestamped lifecycle tracking and protected resource shielding
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="font-mono-tech text-xs text-[#0047ff] hover:underline font-bold"
                  >
                    [INSPECT_NODE_CONFIG]
                  </button>
                </div>
              </div>

              {/* Right Column: Industrial Card Form */}
              <div className="lg:col-span-6">
                <div className="industrial-card p-6 sm:p-8">
                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 border-2 border-[#18181a] mb-6">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`py-3 font-display uppercase tracking-wider text-sm font-semibold transition cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-[#18181a] text-white'
                          : 'bg-white text-[#18181a] hover:bg-gray-100'
                      }`}
                    >
                      AUTHENTICATE
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`py-3 font-display uppercase tracking-wider text-sm font-semibold transition cursor-pointer border-l-2 border-[#18181a] ${
                        authMode === 'register'
                          ? 'bg-[#18181a] text-white'
                          : 'bg-white text-[#18181a] hover:bg-gray-100'
                      }`}
                    >
                      REGISTER
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

      {/* Footer */}
      <Footer />

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

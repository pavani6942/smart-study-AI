import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FirebaseConsoleAlert } from './FirebaseConsoleAlert';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onOpenForgotPassword: (email?: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onOpenForgotPassword,
}) => {
  const { signInWithEmail, signInWithGoogle, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load remembered email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('authshield_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError('ERROR: REQUIRED_FIELDS_EMPTY');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('authshield_remembered_email', email.trim());
      } else {
        localStorage.removeItem('authshield_remembered_email');
      }
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      setLocalError(err?.message || 'LOGIN_AUTHENTICATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearAuthError();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err?.message || 'GOOGLE_OAUTH_FAILED');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block mb-1">
          Identity Challenge
        </span>
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-[#18181a]">
          Authorize User
        </h2>
        <p className="font-mono-tech text-xs text-[#18181a]/70 mt-1">
          Provide credentials to access protected node resources
        </p>
      </div>

      {/* Console Alert if provider issue */}
      {authError && (
        <FirebaseConsoleAlert
          errorCode={authError.code}
          errorMessage={authError.message}
          onDismiss={clearAuthError}
        />
      )}

      {/* Local Error Banner */}
      {localError && !authError && (
        <div className="p-3 border-2 border-red-600 bg-red-50 text-red-900 font-mono-tech text-xs">
          {localError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
            Email Node Identifier
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18181a]/40" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@system.node"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-xs text-[#18181a] placeholder:text-[#18181a]/30 focus:outline-none focus:border-[#0047ff] transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60">
              Access Cipher
            </label>
            <button
              type="button"
              onClick={() => onOpenForgotPassword(email)}
              className="font-mono-tech text-[10px] text-[#0047ff] font-bold hover:underline cursor-pointer"
            >
              [FORGOT_CIPHER]
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18181a]/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-xs text-[#18181a] placeholder:text-[#18181a]/30 focus:outline-none focus:border-[#0047ff] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#18181a]/50 hover:text-[#18181a] p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none font-mono-tech text-[11px] text-[#18181a]/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-none accent-[#18181a] border-[#18181a]"
            />
            <span>PERSIST_NODE_IDENTITY</span>
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-[#18181a] hover:bg-[#0047ff] disabled:opacity-50 text-white font-display font-semibold uppercase tracking-wider text-base transition cursor-pointer text-center block"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              VERIFYING_CREDENTIALS...
            </span>
          ) : (
            'AUTHENTICATE_IDENTITY'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-[#18181a]/15 w-full" />
        <span className="bg-white px-3 font-mono-tech text-[10px] text-[#18181a]/50 uppercase tracking-widest relative">
          ALTERNATIVE_VECTOR
        </span>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full py-3 px-4 bg-transparent hover:bg-[#18181a] hover:text-white border-2 border-[#18181a] font-display font-semibold uppercase tracking-wider text-sm text-[#18181a] transition flex items-center justify-center gap-3 cursor-pointer"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>GOOGLE_AUTH_POPUP</span>
      </button>

      {/* Switch to Register */}
      <div className="pt-2 text-center font-mono-tech text-xs text-[#18181a]/60">
        NO_RECORD_FOUND?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#0047ff] font-bold hover:underline cursor-pointer"
        >
          INITIALIZE_REGISTRATION
        </button>
      </div>
    </div>
  );
};

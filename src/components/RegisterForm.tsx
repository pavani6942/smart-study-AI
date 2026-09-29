import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { FirebaseConsoleAlert } from './FirebaseConsoleAlert';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { signUpWithEmail, authError, clearAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!name.trim()) {
      setLocalError('ERROR: FULL_NAME_REQUIRED');
      return;
    }

    if (!email.trim()) {
      setLocalError('ERROR: VALID_EMAIL_REQUIRED');
      return;
    }

    if (password.length < 6) {
      setLocalError('ERROR: CIPHER_MINIMUM_6_CHARACTERS');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('ERROR: CIPHER_MISMATCH');
      return;
    }

    if (!agreeTerms) {
      setLocalError('ERROR: SECURITY_TERMS_UNACKNOWLEDGED');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, name.trim());
    } catch (err: any) {
      setLocalError(err?.message || 'ENROLLMENT_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block mb-1">
          Identity Provisioning
        </span>
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-[#18181a]">
          Register Identity
        </h2>
        <p className="font-mono-tech text-xs text-[#18181a]/70 mt-1">
          Provision node credentials and trigger automated email verification
        </p>
      </div>

      {/* Console Alert */}
      {authError && (
        <FirebaseConsoleAlert
          errorCode={authError.code}
          errorMessage={authError.message}
          onDismiss={clearAuthError}
        />
      )}

      {/* Local Error */}
      {localError && !authError && (
        <div className="p-3 border-2 border-red-600 bg-red-50 text-red-900 font-mono-tech text-xs">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
            Entity Legal / System Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-xs text-[#18181a] placeholder:text-[#18181a]/30 focus:outline-none focus:border-[#0047ff] transition"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
            Node Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18181a]/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@system.node"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-xs text-[#18181a] placeholder:text-[#18181a]/30 focus:outline-none focus:border-[#0047ff] transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
            Access Cipher (Password)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18181a]/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
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
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
            Confirm Access Cipher
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18181a]/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter cipher"
              className={`w-full pl-10 pr-10 py-3 bg-white border-2 font-mono-tech text-xs text-[#18181a] placeholder:text-[#18181a]/30 focus:outline-none transition ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-[#0047ff]'
                    : 'border-red-600'
                  : 'border-[#18181a]'
              }`}
            />
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="font-mono-tech text-[10px] text-red-600 mt-1">CIPHER_MISMATCH_DETECTED</p>
          )}
        </div>

        {/* Automatic verification alert */}
        <div className="p-3 bg-[#f8f7f4] border border-[#18181a]/20 font-mono-tech text-[11px] text-[#18181a]">
          <span className="text-[#0047ff] font-bold block mb-0.5">DISPATCH_DIRECTIVE:</span>
          An automated verification link will be broadcast to the registered address immediately upon record creation.
        </div>

        {/* Terms */}
        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none font-mono-tech text-[11px] text-[#18181a]/70">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded-none accent-[#18181a] border-[#18181a] mt-0.5"
            />
            <span>ACKNOWLEDGE_TERMS_AND_SECURITY_POLICIES</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-[#18181a] hover:bg-[#0047ff] disabled:opacity-50 text-white font-display font-semibold uppercase tracking-wider text-base transition cursor-pointer text-center block mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              PROVISIONING_IDENTITY...
            </span>
          ) : (
            'EXECUTE_REGISTRATION'
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-2 text-center font-mono-tech text-xs text-[#18181a]/60">
        ALREADY_PROVISIONED?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#0047ff] font-bold hover:underline cursor-pointer"
        >
          PROCEED_TO_AUTH
        </button>
      </div>
    </div>
  );
};

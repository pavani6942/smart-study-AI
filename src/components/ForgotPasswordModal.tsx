import React, { useState } from 'react';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('ERROR: EMAIL_REQUIRED');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
    } catch (err: any) {
      setError(err?.message || 'RESET_DISPATCH_FAILED');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedEmail(null);
    setError(null);
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white border-2 border-[#18181a] p-6 md:p-8 shadow-[8px_8px_0px_#18181a] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#18181a]/60 hover:text-[#18181a] p-1 border border-transparent hover:border-[#18181a] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedEmail ? (
          <div className="space-y-4">
            <span className="font-mono-tech text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
              STATUS: TRANSMISSION_SUCCESS
            </span>

            <h3 className="font-display font-bold text-3xl uppercase text-[#18181a]">
              Cipher Reset Dispatched
            </h3>

            <p className="font-mono-tech text-xs text-[#18181a]/80">
              A recovery token has been transmitted to node address:
            </p>

            <div className="font-mono-tech font-bold text-xs text-[#0047ff] bg-[#f8f7f4] p-3 border border-[#18181a]/20 break-all">
              {submittedEmail}
            </div>

            <div className="p-3 bg-[#18181a]/5 border border-[#18181a]/10 font-mono-tech text-[11px] text-[#18181a]/80 space-y-1">
              <div>• Click the link within the transmission to assign a new cipher.</div>
              <div>• Token expiration threshold: 3600 seconds.</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-1/2 py-2.5 border-2 border-[#18181a] font-display uppercase text-xs font-semibold hover:bg-gray-100"
              >
                RETRY_ADDRESS
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-[#18181a] text-white font-display uppercase text-xs font-semibold hover:bg-[#0047ff]"
              >
                RETURN_TO_AUTH
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block mb-1">
                Recovery Protocol
              </span>
              <h3 className="font-display font-bold text-3xl uppercase text-[#18181a]">
                Reset Cipher
              </h3>
              <p className="font-mono-tech text-xs text-[#18181a]/70 mt-1">
                Transmit a password reset link to your verified email
              </p>
            </div>

            {error && (
              <div className="p-3 border-2 border-red-600 bg-red-50 text-red-900 font-mono-tech text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
                  Registered Node Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@system.node"
                  className="w-full px-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-xs text-[#18181a] focus:outline-none focus:border-[#0047ff] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border-2 border-[#18181a] font-display uppercase text-xs font-semibold hover:bg-gray-100"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#18181a] hover:bg-[#0047ff] text-white font-display uppercase text-xs font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'DISPATCHING...' : 'DISPATCH_RESET_LINK'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

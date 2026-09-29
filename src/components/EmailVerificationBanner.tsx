import React, { useState } from 'react';
import { Mail, RefreshCw, Send, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveFirebaseConfig } from '../services/firebase';

export const EmailVerificationBanner: React.FC = () => {
  const {
    user,
    isEmailVerified,
    resendCooldown,
    resendVerificationEmail,
    checkEmailVerificationStatus,
  } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  if (!user || isEmailVerified) {
    return null;
  }

  const config = getActiveFirebaseConfig();

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      const verified = await checkEmailVerificationStatus();
      if (verified) {
        setMessage({
          type: 'success',
          text: 'VERIFICATION_SUCCESSFUL: Identity authenticated with node authority.',
        });
      } else {
        setMessage({
          type: 'info',
          text: 'STATUS_PENDING: Click the link received in your inbox.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'STATUS_CHECK_FAILED',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage({
        type: 'success',
        text: `TRANSMISSION_DISPATCHED to ${user.email}`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'DISPATCH_ERROR',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full bg-[#18181a] text-white border-b-2 border-[#18181a] px-6 py-3 font-mono-tech text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Info */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-amber-400 animate-ping rounded-full shrink-0" />
          <div>
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
              SECURITY_GATE: EMAIL_VERIFICATION_REQUIRED
            </span>
            <span className="text-white/80 text-[11px]">
              Confirmation dispatch pending for address: <strong className="text-white underline">{user.email}</strong>
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="bg-[#0047ff] hover:bg-blue-600 text-white font-display uppercase tracking-wider px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            I_HAVE_VERIFIED
          </button>

          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="border border-white/40 hover:border-white text-white font-display uppercase tracking-wider px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {resendCooldown > 0 ? `RETRY IN ${resendCooldown}S` : 'RESEND_EMAIL'}
          </button>

          <button
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="p-1.5 text-white/70 hover:text-white border border-white/20 transition cursor-pointer"
            title="Toggle diagnostic steps"
          >
            {showTroubleshoot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto mt-2 text-[11px] text-[#0047ff] font-bold">
          &gt; {message.text}
        </div>
      )}

      {showTroubleshoot && (
        <div className="max-w-7xl mx-auto mt-3 p-3 bg-black/40 border border-white/10 text-[11px] space-y-1 text-white/80">
          <div className="text-white font-bold uppercase">&gt; DIAGNOSTIC_CHECKLIST:</div>
          <div>1. Check SPAM/PROMOTIONS filter for sender: noreply@{config.projectId}.firebaseapp.com</div>
          <div>2. Verification action link triggers automatic handshake with Firebase Auth cloud node</div>
          <div>3. Once link is clicked in browser, hit [I_HAVE_VERIFIED] to refresh state</div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Mail, RefreshCw, Send, CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveFirebaseConfig } from '../services/firebase';

interface EmailVerificationBannerProps {
  onOpenHelp?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = () => {
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
          text: 'Success! Your email address has been verified. Full account access unlocked!',
        });
      } else {
        setMessage({
          type: 'info',
          text: 'Not verified yet. Please make sure you clicked the link in your verification email, then try again.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Failed to check verification status.',
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
        text: `Fresh verification email dispatched to ${user.email}! Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Could not resend email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-b border-amber-200 dark:border-amber-800/80 px-4 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Side Info */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-amber-950 dark:text-amber-200">
                Email Verification Required
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                Action Pending
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
              We sent a verification link to <strong className="font-mono">{user.email}</strong>. Please confirm your email to activate full security permissions.
            </p>
          </div>
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                I've Clicked The Link
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium shadow-xs disabled:opacity-50 transition"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-gray-500" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
              </>
            )}
          </button>

          <button
            onClick={() => setShowTroubleshoot(!showTroubleshoot)}
            className="p-1.5 text-amber-800 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded-lg text-xs transition"
            title="Troubleshooting tips"
          >
            {showTroubleshoot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {message && (
        <div className={`mt-2 max-w-7xl mx-auto p-2.5 rounded-lg text-xs flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
            : message.type === 'error'
            ? 'bg-red-100/90 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
            : 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : message.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          ) : (
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Accordion: Troubleshooting Help */}
      {showTroubleshoot && (
        <div className="mt-3 max-w-7xl mx-auto bg-white/80 dark:bg-gray-900/80 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 text-xs space-y-2 text-gray-700 dark:text-gray-300">
          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Didn't receive the verification email? Check these items:
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-1">
            <li>
              <strong>Check Spam / Junk:</strong> Automated verification emails from Firebase are often filtered into "Spam", "Junk", or "Promotions" tabs.
            </li>
            <li>
              <strong>Search Sender:</strong> In your mailbox search bar, type: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">noreply@{config.projectId}.firebaseapp.com</span>.
            </li>
            <li>
              <strong>Firebase Console Templates:</strong> You can inspect or customize the email template in the Firebase Console under <strong>Authentication → Templates</strong>.
            </li>
            <li>
              <strong>Once verified:</strong> Click <strong>"I've Clicked The Link"</strong> above to refresh and immediately update your dashboard state!
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

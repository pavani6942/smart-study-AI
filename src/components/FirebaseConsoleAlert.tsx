import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, X, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';
import { getActiveFirebaseConfig } from '../services/firebase';

interface FirebaseConsoleAlertProps {
  errorCode?: string;
  errorMessage?: string;
  onDismiss?: () => void;
}

export const FirebaseConsoleAlert: React.FC<FirebaseConsoleAlertProps> = ({
  errorCode,
  errorMessage,
  onDismiss,
}) => {
  const [copied, setCopied] = useState(false);
  const config = getActiveFirebaseConfig();
  const isOperationNotAllowed = errorCode === 'auth/operation-not-allowed';

  const copyProjectId = () => {
    navigator.clipboard.writeText(config.projectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const consoleProvidersUrl = `https://console.firebase.google.com/project/${config.projectId}/authentication/providers`;

  return (
    <div className={`p-4 border-2 font-mono-tech transition-all ${
      isOperationNotAllowed 
        ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-[4px_4px_0px_#d97706]' 
        : 'bg-red-50 border-red-600 text-red-950 shadow-[4px_4px_0px_#dc2626]'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
          {isOperationNotAllowed ? (
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
          )}
          <span>
            {isOperationNotAllowed
              ? 'ACTION_REQUIRED: ENABLE_AUTH_PROVIDER_IN_FIREBASE'
              : 'SECURITY_ALERT: AUTH_EXCEPTION'}
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[#18181a]/50 hover:text-[#18181a] p-0.5 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-2 text-xs leading-relaxed opacity-90 font-mono-tech">
        {errorMessage || (isOperationNotAllowed && 'NODE_RESPONSE: auth/operation-not-allowed. Email/Password sign-in provider is uninitialized on Firebase console.')}
      </div>

      {isOperationNotAllowed && (
        <div className="mt-3 bg-white p-3 border border-amber-600/30 text-xs space-y-2">
          <div className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            CONSOLE_ACTIVATION_PROTOCOL:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs text-[#18181a]">
            <li>Open node <strong className="font-mono bg-amber-100 px-1">{config.projectId}</strong></li>
            <li>Navigate to <strong>Authentication → Sign-in method</strong></li>
            <li>Enable <strong>Email/Password</strong> and commit changes</li>
          </ol>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <a
              href={consoleProvidersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18181a] hover:bg-[#0047ff] text-white font-display uppercase text-xs font-semibold transition"
            >
              OPEN_FIREBASE_CONSOLE
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={copyProjectId}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white text-[#18181a] border border-[#18181a] font-mono-tech text-xs hover:bg-gray-100 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED' : 'COPY_NODE_ID'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, CheckCircle2, ChevronRight, X, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';
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
  const consoleAuthSettingsUrl = `https://console.firebase.google.com/project/${config.projectId}/authentication/settings`;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isOperationNotAllowed 
        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 shadow-sm' 
        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          {isOperationNotAllowed ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>
            {isOperationNotAllowed
              ? 'Action Required: Enable Email/Password in Firebase Console'
              : 'Authentication Notice'}
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-2 text-xs md:text-sm leading-relaxed opacity-90">
        {errorMessage || (isOperationNotAllowed && 'Firebase returned "auth/operation-not-allowed". By default on new Firebase projects, you must enable the Email/Password sign-in provider in the Firebase Console.')}
      </div>

      {isOperationNotAllowed && (
        <div className="mt-3 bg-white/70 dark:bg-black/30 p-3 rounded-lg border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-2">
          <div className="font-semibold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick 30-Second Fix in Firebase Console:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>
              Open your project <span className="font-mono font-medium px-1 bg-amber-100 dark:bg-amber-900/50 rounded">{config.projectId}</span>
            </li>
            <li>Go to <strong>Authentication</strong> → <strong>Sign-in method</strong> tab</li>
            <li>Click <strong>Email/Password</strong> and switch the toggle to <strong>Enable</strong></li>
            <li>Click <strong>Save</strong>, then return here and retry!</li>
          </ol>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <a
              href={consoleProvidersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-xs shadow-xs transition"
            >
              Open Firebase Console Sign-in Providers
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={copyProjectId}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-xs hover:bg-gray-50 transition"
              title="Copy Project ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              {copied ? 'Copied ID' : 'Copy ID'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

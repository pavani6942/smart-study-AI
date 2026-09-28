import React from 'react';
import { ShieldCheck, Settings, ExternalLink, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveFirebaseConfig } from '../services/firebase';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const { user, isEmailVerified, logout } = useAuth();
  const config = getActiveFirebaseConfig();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                AuthShield
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                Firebase
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
              Secure Auth & Email Verification
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Project tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{config.projectId}</span>
          </div>

          {/* Firebase Console link */}
          <a
            href={`https://console.firebase.google.com/project/${config.projectId}/authentication`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Open Firebase Console"
          >
            <span>Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Config Settings Modal trigger */}
          <button
            onClick={onOpenConfig}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Firebase Config Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logged in User Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                  {isEmailVerified ? (
                    <span className="text-emerald-600 font-medium">Verified</span>
                  ) : (
                    <span className="text-amber-500 font-medium">Unverified</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

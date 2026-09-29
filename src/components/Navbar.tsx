import React from 'react';
import { Settings, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveFirebaseConfig } from '../services/firebase';

interface NavbarProps {
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig }) => {
  const { user, isEmailVerified, logout } = useAuth();
  const config = getActiveFirebaseConfig();

  return (
    <header className="border-b-2 border-[#18181a] bg-white px-6 md:px-12 py-4 flex items-center justify-between z-40 relative">
      {/* Brand */}
      <div className="flex items-baseline gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-2xl md:text-3xl uppercase tracking-tight text-[#18181a]">
            AuthShield
          </span>
          <span className="font-mono-tech text-[10px] md:text-xs text-[#0047ff] font-bold uppercase tracking-wider">
            SECURITY_LAYER v1.0.4
          </span>
        </div>
      </div>

      {/* Right User / Meta Block */}
      <div className="flex items-center gap-4">
        {/* Node info */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 border border-[#18181a]/20 bg-[#f8f7f4] font-mono-tech text-[11px] text-[#18181a]">
          <span className="w-2 h-2 rounded-full bg-[#0047ff] animate-pulse" />
          <span>NODE: {config.projectId}</span>
        </div>

        {/* Console link */}
        <a
          href={`https://console.firebase.google.com/project/${config.projectId}/authentication`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 font-mono-tech text-xs text-[#18181a]/70 hover:text-[#0047ff] py-1 px-2 border border-transparent hover:border-[#18181a]/20 transition"
          title="Open Firebase Console"
        >
          <span>CONSOLE</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Settings button */}
        <button
          onClick={onOpenConfig}
          className="p-2 border border-[#18181a]/20 hover:border-[#18181a] hover:bg-[#18181a] hover:text-white transition cursor-pointer text-[#18181a]"
          title="Configure Firebase Credentials"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Block if authenticated */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l-2 border-[#18181a]">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-xs text-[#18181a]">
                {user.displayName || user.email?.split('@')[0] || 'AUTHENTICATED_USER'}
              </div>
              <div className="font-mono-tech text-[10px] text-[#18181a]/60">
                {isEmailVerified ? (
                  <span className="text-[#0047ff] font-bold">VERIFIED_TRUE</span>
                ) : (
                  <span className="text-amber-600 font-bold">UNVERIFIED_PENDING</span>
                )}
              </div>
            </div>

            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || 'Felix'}`}
              alt="User Avatar"
              className="w-10 h-10 border-2 border-[#18181a] p-0.5 object-cover bg-white"
            />

            <button
              onClick={() => logout()}
              className="p-2 border border-[#18181a] hover:bg-[#18181a] hover:text-white transition text-[#18181a] cursor-pointer"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

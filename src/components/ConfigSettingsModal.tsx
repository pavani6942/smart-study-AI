import React, { useState } from 'react';
import { Settings, X, Copy, Check, RotateCcw, Save, ExternalLink } from 'lucide-react';
import { getActiveFirebaseConfig, saveFirebaseConfig, resetFirebaseConfig } from '../services/firebase';

interface ConfigSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigSettingsModal: React.FC<ConfigSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const currentConfig = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket);
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId);
  const [appId, setAppId] = useState(currentConfig.appId);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset to user default Firebase credentials?')) {
      resetFirebaseConfig();
    }
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(currentConfig, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white border-2 border-[#18181a] p-6 md:p-8 shadow-[8px_8px_0px_#18181a] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#18181a]/60 hover:text-[#18181a] p-1 border border-transparent hover:border-[#18181a] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block mb-1">
            System Infrastructure
          </span>
          <h3 className="font-display font-bold text-3xl uppercase text-[#18181a]">
            Firebase Node Config
          </h3>
          <p className="font-mono-tech text-xs text-[#18181a]/70 mt-1">
            Active credentials for authentication provider
          </p>
        </div>

        <div className="bg-[#f8f7f4] border-2 border-[#18181a] p-4 mb-4 font-mono-tech text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#18181a]/70 font-bold">PROJECT_ID:</span>
            <span className="text-[#0047ff] font-bold">
              {projectId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#18181a]/70 font-bold">AUTH_DOMAIN:</span>
            <span className="text-[#18181a]">
              {authDomain}
            </span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#18181a]/15 text-[11px]">
            <a
              href={`https://console.firebase.google.com/project/${projectId}/authentication`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0047ff] hover:underline font-bold inline-flex items-center gap-1"
            >
              CONSOLE_DIRECT <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleCopyJSON}
              className="text-[#18181a] hover:text-[#0047ff] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'JSON_COPIED' : 'COPY_RAW_JSON'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 font-mono-tech text-xs">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
              API_KEY
            </label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
              AUTH_DOMAIN
            </label>
            <input
              type="text"
              required
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
                PROJECT_ID
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
                MESSAGING_SENDER_ID
              </label>
              <input
                type="text"
                required
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
                APP_ID
              </label>
              <input
                type="text"
                required
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#18181a]/70 font-bold mb-1">
                STORAGE_BUCKET
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#18181a] font-mono-tech text-xs focus:border-[#0047ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-3 border-2 border-[#18181a] font-display uppercase text-xs font-semibold hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESTORE_DEFAULT
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 border-2 border-[#18181a] font-display uppercase text-xs font-semibold hover:bg-gray-100 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 bg-[#18181a] hover:bg-[#0047ff] text-white font-display uppercase text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                SAVE_AND_APPLY
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

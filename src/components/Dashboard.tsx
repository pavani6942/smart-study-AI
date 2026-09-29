import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Send,
  Loader2,
  ExternalLink,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveFirebaseConfig } from '../services/firebase';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo',
];

export const Dashboard: React.FC = () => {
  const {
    user,
    isEmailVerified,
    activities,
    resendCooldown,
    resendVerificationEmail,
    checkEmailVerificationStatus,
    updateUserProfile,
    updateUserPassword,
    logout,
    deleteAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROFILE_DETAILS' | 'SECURITY_PROTOCOL' | 'AUDIT_HISTORY'>('OVERVIEW');

  // Profile states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || AVATAR_OPTIONS[0]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verification checking state
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Copy feedback
  const [copiedUid, setCopiedUid] = useState(false);

  if (!user) return null;

  const config = getActiveFirebaseConfig();
  const creationDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toISOString().split('T')[0].replace(/-/g, '.')
    : '2026.09.26';
  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'N/A';
  const providerId = user.providerData?.[0]?.providerId === 'google.com' ? 'GOOGLE_OAUTH' : 'EMAIL_PASSWORD';

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      await updateUserProfile(displayName, selectedAvatar);
      setProfileMessage({ type: 'success', text: 'PROFILE_UPDATED_SUCCESSFULLY' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'PROFILE_UPDATE_FAILED' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'PASSWORD_MIN_LENGTH_VIOLATION: MIN 6 CHARACTERS' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'PASSWORD_MISMATCH: VERIFY BOTH ENTRIES' });
      return;
    }

    setPasswordSaving(true);
    try {
      await updateUserPassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'PASSWORD_UPDATED_AND_ENCRYPTED' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'PASSWORD_CHANGE_REJECTED' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setVerificationFeedback(null);
    try {
      const verified = await checkEmailVerificationStatus();
      if (verified) {
        setVerificationFeedback('EMAIL_SYNC_VERIFIED: Full clearance activated.');
      } else {
        setVerificationFeedback('EMAIL_SYNC_PENDING: Click the link inside the Firebase verification email.');
      }
    } catch (e: any) {
      setVerificationFeedback('ERROR: Verification polling interrupted.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationFeedback(null);
    try {
      await resendVerificationEmail();
      setVerificationFeedback(`VERIFICATION_DISPATCHED to ${user.email}`);
    } catch (err: any) {
      setVerificationFeedback(err?.message || 'DISPATCH_FAILURE: Could not resend email.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user.email) return;
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err: any) {
      alert(err?.message || 'TERMINATION_ERROR');
      setDeleting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col md:grid md:grid-cols-[280px_1fr_300px] lg:grid-cols-[320px_1fr_320px] overflow-hidden bg-[#f8f7f4]">
      {/* LEFT PANEL: NAVIGATION */}
      <aside className="border-r border-[#18181a]/10 p-6 md:p-8 flex flex-col bg-[#f8f7f4]">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 mb-4 block">
          Navigation
        </span>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full text-left font-semibold text-sm py-3 border-b-2 transition uppercase cursor-pointer block ${
              activeTab === 'OVERVIEW'
                ? 'text-[#0047ff] border-[#0047ff]'
                : 'text-[#18181a] border-transparent hover:text-[#0047ff]'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('PROFILE_DETAILS')}
            className={`w-full text-left font-semibold text-sm py-3 border-b-2 transition uppercase cursor-pointer block ${
              activeTab === 'PROFILE_DETAILS'
                ? 'text-[#0047ff] border-[#0047ff]'
                : 'text-[#18181a] border-transparent hover:text-[#0047ff]'
            }`}
          >
            PROFILE_DETAILS
          </button>
          <button
            onClick={() => setActiveTab('SECURITY_PROTOCOL')}
            className={`w-full text-left font-semibold text-sm py-3 border-b-2 transition uppercase cursor-pointer block ${
              activeTab === 'SECURITY_PROTOCOL'
                ? 'text-[#0047ff] border-[#0047ff]'
                : 'text-[#18181a] border-transparent hover:text-[#0047ff]'
            }`}
          >
            SECURITY_PROTOCOL
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_HISTORY')}
            className={`w-full text-left font-semibold text-sm py-3 border-b-2 transition uppercase cursor-pointer block ${
              activeTab === 'AUDIT_HISTORY'
                ? 'text-[#0047ff] border-[#0047ff]'
                : 'text-[#18181a] border-transparent hover:text-[#0047ff]'
            }`}
          >
            AUDIT_HISTORY
          </button>
        </nav>

        {/* Quick status summary in nav */}
        <div className="mt-8 p-4 border border-[#18181a]/15 bg-white text-xs space-y-2">
          <span className="font-mono-tech text-[9px] uppercase tracking-wider text-[#18181a]/50 block">
            VERIFICATION_FLAG
          </span>
          <div className="font-mono-tech font-bold text-xs flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
            <span>{isEmailVerified ? 'STATUS_VERIFIED' : 'ACTION_REQUIRED'}</span>
          </div>
          {!isEmailVerified && (
            <button
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="w-full mt-2 py-1.5 px-2 bg-[#18181a] text-white font-display uppercase text-xs hover:bg-[#0047ff] transition"
            >
              {checkingVerification ? 'SYNCING...' : 'SYNC_VERIFICATION'}
            </button>
          )}
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={() => logout()}
            className="w-full bg-transparent text-[#18181a] border-2 border-[#18181a] py-3 px-4 font-display font-semibold uppercase tracking-wider text-sm hover:bg-[#18181a] hover:text-white transition cursor-pointer text-center block"
          >
            TERMINATE_SESSION
          </button>
        </div>
      </aside>

      {/* CENTER PANEL: CORE CONTENT */}
      <section className="p-6 md:p-10 lg:p-12 grid-bg overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="max-w-3xl space-y-6">
            <div className="inline-block px-3 py-1 bg-[#18181a] text-white font-mono-tech text-[10px] tracking-wider uppercase">
              PROTOCOL: SECURE_AUTH
            </div>

            <h1
              style={{ color: '#171719' }}
              className="font-display font-bold text-5xl md:text-7xl uppercase tracking-tighter text-[#171719] leading-[0.85] my-4"
            >
              {isEmailVerified ? (
                <>
                  Verified<br />Identity
                </>
              ) : (
                <>
                  Unverified<br />Identity
                </>
              )}
            </h1>

            <div className="h-[2px] bg-[#18181a] w-12 my-6" />

            {/* Email verification pending notice if not verified */}
            {!isEmailVerified && (
              <div className="industrial-card p-6 bg-amber-50 border-amber-500 border-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono-tech text-[10px] uppercase tracking-wider text-amber-900 font-bold block">
                      SECURITY_WARNING: VERIFICATION_INCOMPLETE
                    </span>
                    <h3 className="font-display font-bold text-2xl uppercase text-[#18181a]">
                      Confirmation Link Dispatched
                    </h3>
                    <p className="text-xs text-[#18181a]/80 font-mono-tech">
                      A verification email was sent to <strong className="text-[#0047ff]">{user.email}</strong>. Please click the link inside your inbox.
                    </p>
                  </div>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingVerification || resendCooldown > 0}
                    className="bg-[#18181a] text-white px-4 py-2 font-display uppercase text-xs hover:bg-[#0047ff] transition shrink-0 disabled:opacity-50"
                  >
                    {resendingVerification ? 'SENDING...' : resendCooldown > 0 ? `WAIT ${resendCooldown}S` : 'RESEND_LINK'}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] text-amber-950 font-mono-tech">
                    Already clicked the link?
                  </span>
                  <button
                    onClick={handleCheckVerification}
                    disabled={checkingVerification}
                    className="border border-[#18181a] bg-white px-3 py-1 font-display uppercase text-xs font-semibold hover:bg-[#18181a] hover:text-white transition"
                  >
                    {checkingVerification ? 'CHECKING...' : 'I_HAVE_VERIFIED'}
                  </button>
                </div>
              </div>
            )}

            {/* User Descriptor Card */}
            <div className="industrial-card p-6 md:p-8">
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 mb-2 block">
                User Descriptor
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl uppercase text-[#18181a] mb-1">
                {user.displayName || user.email?.split('@')[0] || 'AUTHORIZED_ENTITY'}
              </h2>
              <div className="font-mono-tech text-sm font-bold text-[#0047ff]">
                {user.email}
              </div>

              <div className="border-t border-[#18181a]/10 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1">
                      Auth Provider
                    </span>
                    <div className="font-mono-tech font-bold text-sm text-[#18181a]">
                      {providerId}
                    </div>
                  </div>
                  <div>
                    <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1">
                      Creation Date
                    </span>
                    <div className="font-mono-tech font-bold text-sm text-[#18181a]">
                      {creationDate}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('PROFILE_DETAILS')}
                  style={{ color: '#ffffff' }}
                  className="w-full bg-[#18181a] text-white py-3.5 px-6 font-display font-semibold uppercase text-base hover:bg-[#0047ff] transition cursor-pointer text-center block"
                >
                  MODIFY_CREDENTIALS
                </button>
              </div>
            </div>

            {/* Protection Index & Verified Status grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  textDecorationLine: 'underline',
                  textAlign: 'justify',
                }}
                className="industrial-card p-6"
              >
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 mb-2 block">
                  Protection Index
                </span>
                <div className="font-display font-bold text-5xl text-[#18181a]">
                  {isEmailVerified ? '100%' : '65%'}
                </div>
                <div
                  style={{ borderColor: '#17171b' }}
                  className="font-mono-tech text-[11px] text-[#18181a]/60 mt-1"
                >
                  {isEmailVerified ? 'AUTHENTICATION_SECURE' : 'PENDING_EMAIL_VERIFICATION'}
                </div>
              </div>

              <div className="industrial-card-black p-6">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
                  Verified Status
                </span>
                <div className="font-display font-bold text-2xl text-white">
                  {isEmailVerified ? 'EMAIL_SYNC_TRUE' : 'EMAIL_SYNC_FALSE'}
                </div>
                <div className="font-mono-tech text-[11px] text-white/60 mt-1">
                  NODE: {config.projectId}
                </div>
              </div>
            </div>

            {verificationFeedback && (
              <div className="p-3 bg-[#18181a] text-white font-mono-tech text-xs border border-[#18181a] flex items-center justify-between">
                <span>{verificationFeedback}</span>
                <button
                  onClick={() => setVerificationFeedback(null)}
                  className="text-[#0047ff] hover:underline font-bold text-[10px]"
                >
                  [DISMISS]
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE DETAILS */}
        {activeTab === 'PROFILE_DETAILS' && (
          <div className="max-w-2xl space-y-6">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block">
              Configuration Module
            </span>
            <h1 className="font-display font-bold text-4xl uppercase text-[#18181a]">
              User Profile
            </h1>

            {profileMessage && (
              <div className={`p-3 font-mono-tech text-xs border-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                  : 'bg-red-50 border-red-600 text-red-900'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="industrial-card p-6 md:p-8 space-y-6">
              <div>
                <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-2">
                  Select Visual Identifier
                </span>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className={`w-14 h-14 p-1 border-2 transition cursor-pointer bg-white ${
                        selectedAvatar === avatarUrl
                          ? 'border-[#0047ff] shadow-[4px_4px_0px_#0047ff]'
                          : 'border-[#18181a]/30 hover:border-[#18181a]'
                      }`}
                    >
                      <img src={avatarUrl} alt="Avatar seed" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
                  Display Identifier (Full Name)
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Pogiri Pavani"
                  className="w-full px-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-sm text-[#18181a] focus:outline-none focus:border-[#0047ff] transition"
                />
              </div>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
                  Registered Node Address (Email)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-4 py-3 bg-[#f8f7f4] border-2 border-[#18181a]/30 font-mono-tech text-sm text-[#18181a]/60 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full bg-[#18181a] text-white py-3.5 px-6 font-display font-semibold uppercase text-base hover:bg-[#0047ff] transition cursor-pointer"
              >
                {profileSaving ? 'SAVING_CHANGES...' : 'APPLY_PROFILE_MUTATIONS'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY PROTOCOL */}
        {activeTab === 'SECURITY_PROTOCOL' && (
          <div className="max-w-2xl space-y-6">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block">
              Cryptographic Module
            </span>
            <h1 className="font-display font-bold text-4xl uppercase text-[#18181a]">
              Security Protocol
            </h1>

            {passwordMessage && (
              <div className={`p-3 font-mono-tech text-xs border-2 ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                  : 'bg-red-50 border-red-600 text-red-900'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="industrial-card p-6 md:p-8 space-y-5">
              <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block">
                Update Cipher Phrase (Password)
              </span>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-sm text-[#18181a] focus:outline-none focus:border-[#0047ff] transition"
                />
              </div>

              <div>
                <label className="font-mono-tech text-[10px] uppercase tracking-wider text-[#18181a]/60 block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 bg-white border-2 border-[#18181a] font-mono-tech text-sm text-[#18181a] focus:outline-none focus:border-[#0047ff] transition"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full bg-[#18181a] text-white py-3.5 px-6 font-display font-semibold uppercase text-base hover:bg-[#0047ff] transition cursor-pointer"
              >
                {passwordSaving ? 'HASHING_CIPHER...' : 'COMMIT_PASSWORD_UPDATE'}
              </button>
            </form>

            {/* Danger zone */}
            <div className="industrial-card p-6 border-red-600 border-2 bg-red-50/40">
              <span className="font-mono-tech text-[10px] uppercase tracking-wider text-red-700 block mb-1 font-bold">
                CRITICAL_ACTION_ZONE
              </span>
              <h3 className="font-display font-bold text-2xl uppercase text-[#18181a]">
                Purge Account Record
              </h3>
              <p className="text-xs text-[#18181a]/80 font-mono-tech my-2">
                Permanently eliminate user identity and revoke cloud authentication tokens on node {config.projectId}.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="mt-2 bg-red-600 text-white font-display uppercase px-5 py-2.5 text-sm hover:bg-red-700 transition cursor-pointer"
              >
                PURGE_IDENTITY
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT HISTORY */}
        {activeTab === 'AUDIT_HISTORY' && (
          <div className="max-w-3xl space-y-6">
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 block">
              Telemetry Log
            </span>
            <div className="flex items-baseline justify-between">
              <h1 className="font-display font-bold text-4xl uppercase text-[#18181a]">
                Audit History
              </h1>
              <span className="font-mono-tech text-xs bg-[#18181a] text-white px-2 py-1">
                COUNT: {activities.length}
              </span>
            </div>

            <div className="industrial-card p-4 space-y-2">
              {activities.length === 0 ? (
                <div className="font-mono-tech text-xs text-[#18181a]/60 py-6 text-center">
                  NO_TELEMETRY_LOGGED_YET
                </div>
              ) : (
                <div className="divide-y divide-[#18181a]/10 font-mono-tech text-xs">
                  {activities.map((act) => (
                    <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-[#18181a] uppercase">
                          [{act.type}] {act.title}
                        </div>
                        <div className="text-[#18181a]/70 text-[11px] mt-0.5">
                          {act.description}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#18181a]/50 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* RIGHT PANEL: INFRASTRUCTURE & METADATA */}
      <aside className="border-l border-[#1a141d] p-6 md:p-8 flex flex-col gap-6 bg-[#f8f7f4]">
        {/* Infrastructure UID */}
        <div>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 mb-2 block">
            Infrastructure
          </span>
          <div className="industrial-card p-4 bg-white">
            <div className="font-mono-tech text-xs font-bold text-[#18181a] break-all">
              UID: {user.uid}
            </div>
            <button
              onClick={handleCopyUid}
              className="mt-2 text-[10px] font-mono-tech text-[#0047ff] hover:underline flex items-center gap-1 font-bold"
            >
              {copiedUid ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedUid ? 'COPIED_TO_CLIPBOARD' : 'COPY_UID_HASH'}
            </button>
          </div>
        </div>

        {/* Project Mapping */}
        <div>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#18181a]/60 mb-2 block">
            Project Mapping
          </span>
          <p className="text-xs font-mono-tech leading-relaxed text-[#18181a]/70">
            All authentication flows are processed via the primary Firebase node at{' '}
            <span className="font-bold text-[#0047ff]">{config.authDomain}</span>.
          </p>
          <a
            href={`https://console.firebase.google.com/project/${config.projectId}/authentication`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center bg-transparent text-[#18181a] border-2 border-[#18181a] py-2.5 px-4 font-display font-semibold uppercase text-xs hover:bg-[#18181a] hover:text-white transition"
          >
            CONSOLE_ACCESS
          </a>
        </div>

        {/* System Integrity */}
        <div className="mt-auto bg-[#18181a]/5 border border-[#18181a]/10 p-4">
          <span className="font-mono-tech text-[9px] uppercase tracking-[0.2em] text-[#18181a]/60 block mb-1">
            System Integrity
          </span>
          <div className="font-mono-tech font-bold text-xs text-[#18181a]">
            ACTIVE_SHIELD_V1
          </div>
          <div className="font-mono-tech text-[10px] text-[#18181a]/60 mt-1">
            System reports 0 vulnerabilities.
          </div>
        </div>
      </aside>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border-2 border-[#18181a] p-6 shadow-[8px_8px_0px_#18181a] space-y-4">
            <span className="font-mono-tech text-[10px] text-red-600 font-bold uppercase tracking-wider block">
              WARNING: DESTRUCTIVE_OPERATION
            </span>
            <h3 className="font-display font-bold text-2xl uppercase text-[#18181a]">
              Purge User Identity
            </h3>
            <p className="font-mono-tech text-xs text-[#18181a]/80">
              Type <strong className="text-[#0047ff]">{user.email}</strong> to confirm identity deletion:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={user.email || ''}
              className="w-full px-3 py-2 border-2 border-[#18181a] font-mono-tech text-xs focus:outline-none"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="w-1/2 py-2 border-2 border-[#18181a] font-display uppercase text-xs font-semibold hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== user.email || deleting}
                onClick={handleDeleteAccount}
                className="w-1/2 py-2 bg-red-600 text-white font-display uppercase text-xs font-semibold hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? 'PURGING...' : 'CONFIRM_PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

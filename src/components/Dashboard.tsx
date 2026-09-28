import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  Clock,
  Key,
  LogOut,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Send,
  AlertCircle,
  Copy,
  Lock,
  History,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
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

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'security' | 'activity'>('overview');
  
  // Profile edit states
  const [isEditingName, setIsEditingName] = useState(false);
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
  const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
  const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
  const providerId = user.providerData?.[0]?.providerId || 'password';

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
      setIsEditingName(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await updateUserPassword(newPassword);
      setPasswordMessage({ type: 'success', text: 'Password successfully changed!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'Could not update password.' });
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
        setVerificationFeedback('Email is verified! Security tier elevated to Verified.');
      } else {
        setVerificationFeedback('Still pending. Click the link in your email to verify.');
      }
    } catch (e: any) {
      setVerificationFeedback('Error checking verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationFeedback(null);
    try {
      await resendVerificationEmail();
      setVerificationFeedback(`Verification email resent to ${user.email}!`);
    } catch (err: any) {
      setVerificationFeedback(err?.message || 'Failed to resend email.');
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
      alert(err?.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Profile Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.photoURL || selectedAvatar}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 object-cover"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white ${
                isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {isEmailVerified ? <Check className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || 'Firebase User'}
                </h1>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Email
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Unverified Email
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-medium">
                  Provider: {providerId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  UID: <span className="font-mono">{user.uid.slice(0, 10)}...</span>
                  <button
                    onClick={handleCopyUid}
                    className="hover:text-gray-800 dark:hover:text-gray-200 p-0.5"
                    title="Copy full UID"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            {!isEmailVerified && (
              <button
                onClick={handleCheckVerification}
                disabled={checkingVerification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                {checkingVerification ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Check Email Status
              </button>
            )}

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {verificationFeedback && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span>{verificationFeedback}</span>
            <button
              onClick={() => setVerificationFeedback(null)}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Overview & Security
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Key className="w-4 h-4" />
          Password & Auth
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <History className="w-4 h-4" />
          Audit & Activities
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 & 2: Verification Status and Account Health */}
          <div className="md:col-span-2 space-y-6">
            {/* Email Verification Card */}
            <div className={`p-6 rounded-2xl border ${
              isEmailVerified
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isEmailVerified
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    {isEmailVerified ? <ShieldCheck className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {isEmailVerified ? 'Email Verification Confirmed' : 'Email Verification Incomplete'}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {isEmailVerified
                        ? 'Your email address has been authenticated via Firebase. You have full trusted access to protected operations and data.'
                        : 'Your email address has not been confirmed yet. A verification email was generated for this account.'}
                    </p>
                  </div>
                </div>

                {!isEmailVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingVerification || resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shadow-xs disabled:opacity-50 transition shrink-0 cursor-pointer"
                  >
                    {resendingVerification ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend Link'}
                  </button>
                )}
              </div>

              {!isEmailVerified && (
                <div className="mt-4 pt-4 border-t border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    How to complete verification:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Open your mailbox (<span className="font-mono font-medium">{user.email}</span>)</li>
                    <li>Look for email from <span className="font-mono">noreply@{config.projectId}.firebaseapp.com</span></li>
                    <li>Click the confirmation link</li>
                    <li>Return here and click the <strong>"Check Email Status"</strong> button above</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Account Details Metadata */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Account Timestamps & Identifiers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Account Created:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {creationTime}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Last Sign In:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {lastSignInTime}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Firebase Project ID:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {config.projectId}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Auth Domain:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {config.authDomain}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Security Score & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Health
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <span>Email Verification</span>
                  {isEmailVerified ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <span>Firebase Auth Provider</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <span>Session State</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active & Synced
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <a
                  href={`https://console.firebase.google.com/project/${config.projectId}/authentication/users`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium transition"
                >
                  View User in Firebase Console
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Profile Settings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update your display name and avatar stored on Firebase Auth profile
            </p>
          </div>

          {profileMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200'
            }`}>
              {profileMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarUrl)}
                    className={`w-12 h-12 rounded-xl p-1 border-2 transition cursor-pointer ${
                      selectedAvatar === avatarUrl
                        ? 'border-blue-600 scale-105 shadow-xs'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Email address is tied to your Firebase Auth identity.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-2xl">
          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Change Account Password</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update your Firebase authentication password
              </p>
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200'
              }`}>
                {passwordMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-900/60 space-y-3">
            <h3 className="text-base font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Danger Zone: Delete Account
            </h3>
            <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed">
              Permanently delete this user record from Firebase Authentication. This action is irreversible.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Activity & Audit Log */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Security & Audit History</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Timestamped records of authentication and verification lifecycle events
              </p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-mono">
              {activities.length} records
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No recent security activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      act.type === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : act.type === 'verification_sent'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                        : act.type === 'password_change'
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                    }`}>
                      {act.type === 'verified' ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : act.type === 'verification_sent' ? (
                        <Mail className="w-4 h-4" />
                      ) : act.type === 'password_change' ? (
                        <Key className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {act.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {act.description}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 shrink-0 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete User Account</h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              This will immediately delete this user account from Firebase Auth (<span className="font-mono">{user.email}</span>).
              To confirm, type your email address below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={user.email || ''}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== user.email || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

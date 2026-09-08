import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  Cloud,
  CheckCircle2,
  Lock,
  LogOut,
  LogIn,
  Database,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { loginWithGoogle, logoutUser } from "../firebase";
import firebaseConfig from "../../firebase-applet-config.json";

interface CloudSyncPanelProps {
  currentUser: User | null;
  memoryCount: number;
  isSyncing: boolean;
  onManualSync: () => void;
}

export const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({
  currentUser,
  memoryCount,
  isSyncing,
  onManualSync,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-neutral-900">
                Firebase Cloud Firestore Database
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE & PROVISIONED</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Persistent cloud storage for your architecture decisions, anti-regressions, and context budgets.
            </p>
          </div>
        </div>

        {/* User Auth Action */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-neutral-50 border border-neutral-200 py-1.5 px-3 rounded-lg text-xs">
              <div className="text-right">
                <span className="font-bold text-neutral-900 block leading-tight">
                  {currentUser.displayName || "Developer"}
                </span>
                <span className="text-[11px] text-neutral-500">{currentUser.email}</span>
              </div>
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-neutral-300"
                />
              )}
              <button
                onClick={handleSignOut}
                className="p-1.5 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              id="btn-firebase-google-signin"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Sign in with Google to Sync</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
          <strong>Authentication Notice:</strong> {authError}
        </div>
      )}

      {/* Database Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center space-x-1.5 text-neutral-500 font-medium">
            <Database className="w-3.5 h-3.5 text-neutral-700" />
            <span>Firebase Project</span>
          </div>
          <span className="font-mono text-neutral-900 font-bold block mt-1 truncate">
            {firebaseConfig.projectId}
          </span>
          <span className="text-[10px] text-neutral-400">Enterprise Firestore instance</span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center space-x-1.5 text-neutral-500 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-neutral-700" />
            <span>Target Database ID</span>
          </div>
          <span className="font-mono text-neutral-900 font-bold block mt-1 truncate">
            {firebaseConfig.firestoreDatabaseId}
          </span>
          <span className="text-[10px] text-neutral-400">Isolated database namespace</span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-neutral-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security Rules</span>
            </div>
            <span className="font-bold text-neutral-900 block mt-1">
              Zero-Trust ABAC Deployed
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-500">
            <span>Owner-isolated reads & writes</span>
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="inline-flex items-center space-x-1 text-neutral-800 hover:text-neutral-950 font-semibold"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

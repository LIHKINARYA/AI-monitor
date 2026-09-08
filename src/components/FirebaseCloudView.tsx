import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  Cloud,
  Database,
  ShieldCheck,
  HardDrive,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Code,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import { auth, loginWithGoogle, logoutUser, testConnection } from "../firebase";
import {
  saveMemoryToFirestore,
  deleteMemoryFromFirestore,
  fetchUserCompactionHistory,
  CompactionRecord,
} from "../services/firestoreSync";
import { MemoryItem } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

interface FirebaseCloudViewProps {
  currentUser: User | null;
  memories: MemoryItem[];
  onAddMemory: (mem: Omit<MemoryItem, "id" | "createdAt" | "embeddingVector">) => void;
  onDeleteMemory?: (id: string) => void;
}

export const FirebaseCloudView: React.FC<FirebaseCloudViewProps> = ({
  currentUser,
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [compactionHistory, setCompactionHistory] = useState<CompactionRecord[]>([]);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "cloud-memories" | "rules" | "history" | "hosting"
  >("overview");

  // Verify connection on view mount
  useEffect(() => {
    testConnection().then((ok) => setConnectionOk(ok));
  }, []);

  // Fetch compaction logs if user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchUserCompactionHistory(currentUser.uid)
        .then((records) => setCompactionHistory(records || []))
        .catch(() => {});
    }
  }, [currentUser]);

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

  const handleSyncLocalToCloud = async () => {
    if (!currentUser) {
      setAuthError("Please sign in with Google to sync memories to your Cloud Firestore.");
      return;
    }
    setIsSyncingAll(true);
    setSyncStatus(null);
    try {
      for (const m of memories) {
        await saveMemoryToFirestore(currentUser.uid, m);
      }
      setSyncStatus(`Successfully synchronized ${memories.length} architectural memories to Firestore!`);
    } catch (err: any) {
      setAuthError(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white border border-neutral-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-400 text-neutral-950 rounded-md">
                FIREBASE HOSTED
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Google Cloud Firestore & Authentication
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 tracking-tight">
              Cloud Persistence & Multi-Device Synchronization
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Provisioned for your account with isolated enterprise database security rules. Architectural memories and anti-regression invariants persist across machines, Claude Code CLI instances, and VS Code workspaces.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-neutral-800/80 border border-neutral-700 p-2 rounded-xl text-xs">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-amber-400"
                  />
                )}
                <div className="text-left">
                  <span className="font-bold text-neutral-100 block">
                    {currentUser.displayName || "Developer"}
                  </span>
                  <span className="text-[11px] text-amber-300 font-mono">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs rounded-lg transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2"
                id="btn-firebase-login-banner"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                ) : (
                  <LogIn className="w-4 h-4 text-neutral-950" />
                )}
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {authError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {syncStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
          <button
            onClick={() => setSyncStatus(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cloud Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Firebase Project</span>
            <Database className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xs font-bold font-mono text-neutral-900 mt-2 truncate">
            {firebaseConfig.projectId}
          </p>
          <span className="text-[11px] text-emerald-600 flex items-center space-x-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Enterprise Active</span>
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Firestore Database ID</span>
            <HardDrive className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xs font-bold font-mono text-neutral-900 mt-2 truncate">
            {firebaseConfig.firestoreDatabaseId}
          </p>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Strict subcollection isolation
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Security Rules Engine</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-neutral-900 mt-2">
            Zero-Trust ABAC
          </p>
          <span className="text-[11px] text-neutral-500 block mt-1">
            Owner verification: request.auth.uid
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">Account Status</span>
            <Cloud className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-neutral-900 mt-2 truncate">
            {currentUser ? currentUser.email : "Not signed in"}
          </p>
          <span className="text-[11px] text-neutral-500 block mt-1">
            {currentUser ? "Real-time sync enabled" : "Local-only cache"}
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex space-x-2 border-b border-neutral-200 bg-white px-4 py-2 rounded-xl text-xs">
        {[
          { id: "overview", label: "Cloud Sync & Storage Hub", icon: Cloud },
          { id: "hosting", label: "Public Access & Firebase Hosting", icon: Globe },
          { id: "cloud-memories", label: `Persisted Memories (${memories.length})`, icon: Layers },
          { id: "rules", label: "Deployed Firestore Rules", icon: ShieldCheck },
          { id: "history", label: "Compaction History Audit", icon: HardDrive },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex items-center space-x-2 px-3 py-1.5 font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-neutral-400"}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW & ACTIONS */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cloud Operations */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-neutral-900" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Cloud Database Synchronization
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-medium">
                {connectionOk ? "Connection Verified" : "Connecting..."}
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              MemGovernor uses a hybrid architecture: during local development, Claude Code and the MCP server access fast local in-memory/JSON states. When you sign in with your Google account, your architectural memory tree and anti-regression invariants sync automatically to <strong>Google Cloud Firestore</strong>.
            </p>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  Sync All Local Memories to Cloud Firestore:
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  {memories.length} records ready
                </span>
              </div>

              <p className="text-[11px] text-neutral-500">
                Pushes all active architectural milestones, anti-regression invariants, and episodic decisions into your isolated path <code>users/&#123;uid&#125;/memories</code>.
              </p>

              <button
                onClick={handleSyncLocalToCloud}
                disabled={isSyncingAll || !currentUser}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                {isSyncingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Writing to Cloud Firestore...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {currentUser
                        ? `Push ${memories.length} Memories to Firestore`
                        : "Sign in with Google to Enable Sync"}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-neutral-800">
                Active Firestore Database Paths:
              </h4>
              <div className="space-y-1.5 font-mono text-xs text-neutral-700">
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <span>/users/{currentUser?.uid || "{userId}"}</span>
                  <span className="text-[10px] text-neutral-400 font-sans">User profile & preferences</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <span>/users/{currentUser?.uid || "{userId}"}/memories</span>
                  <span className="text-[10px] text-neutral-400 font-sans">Architectural invariants & DAG nodes</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <span>/users/{currentUser?.uid || "{userId}"}/compaction_sessions</span>
                  <span className="text-[10px] text-neutral-400 font-sans">Token compaction audit logs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Connection Details */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-neutral-900" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Client Configuration
                </h3>
              </div>
              <button
                onClick={() =>
                  copyText(JSON.stringify(firebaseConfig, null, 2), "cfg")
                }
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center space-x-1"
              >
                {copiedId === "cfg" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === "cfg" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Project ID</span>
                <span className="font-mono font-bold text-neutral-800">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Auth Domain</span>
                <span className="font-mono text-neutral-800 truncate max-w-[200px]">{firebaseConfig.authDomain}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">OAuth Client ID</span>
                <span className="font-mono text-neutral-800 truncate max-w-[200px]">
                  {firebaseConfig.oAuthClientId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Admin Account</span>
                <span className="font-mono text-neutral-800">nikhilarya72@gmail.com</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Firestore Edition</span>
                <span className="font-bold text-emerald-600">Enterprise Free Tier</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-neutral-700 block mb-1">
                Raw Client Configuration JSON:
              </span>
              <pre className="bg-neutral-950 text-neutral-200 font-mono text-[10px] p-3 rounded-lg overflow-x-auto border border-neutral-800 leading-relaxed max-h-48">
                {JSON.stringify(firebaseConfig, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CLOUD MEMORIES */}
      {activeSubTab === "cloud-memories" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Cloud Synchronized Memories ({memories.length})
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every memory item is encrypted in transit and isolated by user ID via Firebase Security Rules.
              </p>
            </div>

            {currentUser && (
              <button
                onClick={handleSyncLocalToCloud}
                disabled={isSyncingAll}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin text-amber-400" : ""}`} />
                <span>Re-Sync All to Cloud</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      m.type === "ANTI_REGRESSION"
                        ? "bg-rose-100 text-rose-800"
                        : m.type === "SEMANTIC"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {m.type}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{m.createdAt}</span>
                </div>

                <h4 className="text-xs font-bold text-neutral-900">{m.title}</h4>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {m.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 text-[10px]">
                  <div className="flex flex-wrap gap-1">
                    {(m.tags || []).map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-neutral-200/70 text-neutral-700 rounded font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {currentUser && (
                    <button
                      onClick={async () => {
                        await deleteMemoryFromFirestore(currentUser.uid, m.id);
                        if (onDeleteMemory) onDeleteMemory(m.id);
                      }}
                      className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete from Firestore"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEPLOYED RULES */}
      {activeSubTab === "rules" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Deployed Firestore Security Rules (Zero-Trust ABAC)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Enforces user ownership, prevents cross-tenant leaks, and locks down admin operations to <code>nikhilarya72@gmail.com</code>.
              </p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded font-mono">
              LIVE ON CLOUD
            </span>
          </div>

          <pre className="bg-neutral-950 text-neutral-200 font-mono text-xs p-4 rounded-xl border border-neutral-800 overflow-x-auto leading-relaxed max-h-96">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global default deny
    match /{document=**} {
      allow read, write: if false;
    }

    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }

    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    function isAdmin() {
      return request.auth != null && 
        request.auth.token.email == 'nikhilarya72@gmail.com' && 
        request.auth.token.email_verified == true;
    }

    // Isolated User Profile
    match /users/{userId} {
      allow get: if isOwner(userId) || isAdmin();
      allow list: if false;
      allow create, update: if isOwner(userId) && isValidId(userId);
      allow delete: if isOwner(userId) || isAdmin();

      // Isolated User Architectural Memories
      match /memories/{memoryId} {
        allow get, list: if isOwner(userId) || isAdmin();
        allow create, update: if isOwner(userId) && isValidId(memoryId);
        allow delete: if isOwner(userId) || isAdmin();
      }

      // Compaction Session History
      match /compaction_sessions/{sessionId} {
        allow get, list: if isOwner(userId) || isAdmin();
        allow create: if isOwner(userId) && isValidId(sessionId);
        allow delete: if isOwner(userId) || isAdmin();
      }
    }
  }
}`}
          </pre>
        </div>
      )}

      {/* SUBTAB 4: COMPACTION AUDIT LOGS */}
      {activeSubTab === "history" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Cloud Compaction Session History
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Persistent audit trail of token compressions performed by Claude Code or Gemini Flash.
              </p>
            </div>
          </div>

          {compactionHistory.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <HardDrive className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs">No compaction session records in Cloud Firestore yet.</p>
              <p className="text-[11px] text-neutral-500">
                Run a context compaction from the Context Compressor tab to log history here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {compactionHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{rec.activeGoal}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{rec.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-neutral-600">
                    <span>Engine: <strong className="text-neutral-800 font-mono">{rec.engine}</strong></span>
                    <span>•</span>
                    <span>Tokens: <strong className="text-neutral-800 font-mono">{rec.originalTokens} → {rec.compressedTokens}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold font-mono">
                      -{Math.round((1 - rec.compressedTokens / rec.originalTokens) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: PUBLIC ACCESS & FIREBASE HOSTING */}
      {activeSubTab === "hosting" && (
        <div className="space-y-6">
          {/* Live Public URL Card */}
          <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-neutral-900">
                      Live Public Application URL (Active Now)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>PUBLIC & GLOBALLY ACCESSIBLE</span>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Anyone on any browser, smartphone, or computer can visit this URL right now without needing an AI Studio account.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyText(
                      "https://ais-pre-iesizduzhhoof3bm3ybhlj-647244447205.asia-southeast1.run.app",
                      "puburl"
                    )
                  }
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  {copiedId === "puburl" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === "puburl" ? "Copied Link!" : "Copy Public Link"}</span>
                </button>
                <a
                  href="https://ais-pre-iesizduzhhoof3bm3ybhlj-647244447205.asia-southeast1.run.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Public App</span>
                </a>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-950 text-neutral-100 rounded-xl font-mono text-xs flex items-center justify-between overflow-x-auto border border-neutral-800">
              <span className="text-emerald-400 select-all truncate">
                https://ais-pre-iesizduzhhoof3bm3ybhlj-647244447205.asia-southeast1.run.app
              </span>
              <span className="text-[10px] text-neutral-400 font-sans ml-4 shrink-0">
                SSL Secured • Cloud Run
              </span>
            </div>
          </div>

          {/* Firebase Hosting Setup Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-neutral-900" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Deploy to Firebase Hosting (.web.app)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  CONFIG GENERATED
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                The configuration files <code>firebase.json</code> and <code>.firebaserc</code> have been pre-created and tuned in your workspace linked to project <strong>affable-state-txjsq</strong>.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-900 block">
                    Step 1: Build the production bundle
                  </span>
                  <div className="p-2 bg-neutral-950 text-neutral-200 font-mono text-xs rounded border border-neutral-800 flex items-center justify-between">
                    <code>npm run build</code>
                    <button
                      onClick={() => copyText("npm run build", "cmd1")}
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedId === "cmd1" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-900 block">
                    Step 2: Deploy to Firebase Hosting CDN
                  </span>
                  <div className="p-2 bg-neutral-950 text-neutral-200 font-mono text-xs rounded border border-neutral-800 flex items-center justify-between">
                    <code>npx firebase-tools deploy --only hosting</code>
                    <button
                      onClick={() =>
                        copyText("npx firebase-tools deploy --only hosting", "cmd2")
                      }
                      className="text-neutral-400 hover:text-white"
                    >
                      {copiedId === "cmd2" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-neutral-800">Target Firebase Hosting URL:</span>
                <p className="font-mono text-amber-700 font-semibold">
                  https://affable-state-txjsq.web.app
                </p>
                <p className="text-[11px] text-neutral-500">
                  Firebase automatically issues free SSL certificates and connects to global edge CDNs.
                </p>
              </div>
            </div>

            {/* Right Column: firebase.json Preview */}
            <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-neutral-900" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    firebase.json
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">SPA Rewrites Enabled</span>
              </div>

              <pre className="bg-neutral-950 text-neutral-200 font-mono text-xs p-3.5 rounded-lg border border-neutral-800 overflow-x-auto leading-relaxed">
{`{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}`}
              </pre>

              <div className="pt-2 text-xs text-neutral-600 space-y-1">
                <span className="font-bold text-neutral-800">Custom Domains:</span>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  In your Firebase Console, navigate to <strong>Hosting &gt; Add custom domain</strong> to connect your own domain (e.g. <code>memgovernor.yourdomain.com</code>) with zero server configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

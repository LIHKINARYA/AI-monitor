import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { Navbar } from "./components/Navbar";
import { ContextCompressor } from "./components/ContextCompressor";
import { MemoryExplorer } from "./components/MemoryExplorer";
import { DecisionGraph } from "./components/DecisionGraph";
import { TokenBudgetMeter } from "./components/TokenBudgetMeter";
import { ArchitectureGuide } from "./components/ArchitectureGuide";
import { ExtensionExportModal } from "./components/ExtensionExportModal";
import { McpClaudeConnector } from "./components/McpClaudeConnector";
import { FirebaseCloudView } from "./components/FirebaseCloudView";
import { INITIAL_MEMORIES } from "./data/sampleData";
import { MemoryItem, MemoryType } from "./types";
import { generateLocalEmbedding } from "./utils/tokenEstimator";
import { auth, testConnection } from "./firebase";
import {
  subscribeToUserMemories,
  saveMemoryToFirestore,
  deleteMemoryFromFirestore,
  recordCompactionSession,
  syncUserProfile,
} from "./services/firestoreSync";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("compressor");
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [totalTokensSaved, setTotalTokensSaved] = useState<number>(142800);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check health, Gemini connection & Firebase connection on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey !== undefined) {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch(() => {});

    // Test Firestore connection as mandated by skill
    testConnection().catch((err) => {
      console.warn("Firestore testConnection note:", err);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (e) {
          console.error("Failed to sync user profile:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to User Cloud Memories when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserMemories(currentUser.uid, (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setMemories(cloudItems);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleIncrementTokensSaved = (tokens: number) => {
    setTotalTokensSaved((prev) => prev + tokens);
  };

  const handleAddMemory = async (
    newMem: Omit<MemoryItem, "id" | "createdAt" | "embeddingVector">
  ) => {
    const id = `mem-${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString().split("T")[0];
    const embeddingVector = generateLocalEmbedding(
      `${newMem.title} ${newMem.content} ${(newMem.tags || []).join(" ")}`
    );

    const memoryItem: MemoryItem = {
      ...newMem,
      id,
      createdAt,
      embeddingVector,
      userId: currentUser?.uid,
    };

    setMemories((prev) => [memoryItem, ...prev]);

    // If signed into Firebase, persist to Firestore
    if (currentUser) {
      try {
        await saveMemoryToFirestore(currentUser.uid, memoryItem);
      } catch (err) {
        console.error("Error saving memory to Firestore:", err);
      }
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (currentUser) {
      try {
        await deleteMemoryFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error("Error deleting memory from Firestore:", err);
      }
    }
  };

  const handleSaveFromCompressor = (
    title: string,
    content: string,
    type: "EPISODIC" | "ANTI_REGRESSION"
  ) => {
    handleAddMemory({
      title,
      content,
      type,
      tags: ["session-governed", type.toLowerCase()],
      confidence: 0.96,
      preventLoopsCount: type === "ANTI_REGRESSION" ? 1 : 0,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 font-sans antialiased flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        totalTokensSaved={totalTokensSaved}
        onOpenExport={() => setIsExportModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "compressor" && (
          <ContextCompressor
            onSaveToMemoryStore={handleSaveFromCompressor}
            onIncrementTokensSaved={handleIncrementTokensSaved}
          />
        )}

        {activeTab === "mcp" && <McpClaudeConnector />}

        {activeTab === "memory" && (
          <MemoryExplorer
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === "graph" && <DecisionGraph />}

        {activeTab === "budget" && <TokenBudgetMeter />}

        {activeTab === "firebase" && (
          <FirebaseCloudView
            currentUser={currentUser}
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === "guide" && <ArchitectureGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-neutral-800">MemGovernor</span>
            <span>•</span>
            <span>Hierarchical Memory & Context Governor for AI Agents</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("firebase")}
              className="hover:text-neutral-900 transition-colors font-medium text-amber-600"
            >
              Firebase Cloud Status
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className="hover:text-neutral-900 transition-colors"
            >
              Why Vector DB Alone Fails
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              VS Code / MCP Config
            </button>
            <span>MIT / Apache 2.0</span>
          </div>
        </div>
      </footer>

      {/* Export / Install Modal */}
      <ExtensionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

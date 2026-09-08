import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ContextCompressor } from "./components/ContextCompressor";
import { MemoryExplorer } from "./components/MemoryExplorer";
import { DecisionGraph } from "./components/DecisionGraph";
import { TokenBudgetMeter } from "./components/TokenBudgetMeter";
import { ArchitectureGuide } from "./components/ArchitectureGuide";
import { ExtensionExportModal } from "./components/ExtensionExportModal";
import { McpClaudeConnector } from "./components/McpClaudeConnector";
import { MemoryItem } from "./types";
import { generateLocalEmbedding } from "./utils/tokenEstimator";
import {
  loadLocalMemories,
  saveLocalMemories,
  loadLocalTokensSaved,
  saveLocalTokensSaved,
  resetLocalMemoriesToDefaults,
  importLocalDataFromJSON,
} from "./services/localStorage";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("compressor");
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [totalTokensSaved, setTotalTokensSaved] = useState<number>(() => loadLocalTokensSaved());
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [memories, setMemories] = useState<MemoryItem[]>(() => loadLocalMemories());

  // Check backend health & Gemini status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey !== undefined) {
          setHasGeminiKey(data.hasGeminiKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleIncrementTokensSaved = (tokens: number) => {
    setTotalTokensSaved((prev) => {
      const updated = prev + tokens;
      saveLocalTokensSaved(updated);
      return updated;
    });
  };

  const handleAddMemory = (
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
    };

    setMemories((prev) => {
      const updated = [memoryItem, ...prev];
      saveLocalMemories(updated);
      return updated;
    });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveLocalMemories(updated);
      return updated;
    });
  };

  const handleResetMemories = () => {
    const defaults = resetLocalMemoriesToDefaults();
    setMemories(defaults);
  };

  const handleImportMemories = (jsonText: string) => {
    const res = importLocalDataFromJSON(jsonText);
    if (res.success) {
      setMemories(loadLocalMemories());
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
            onResetMemories={handleResetMemories}
            onImportMemories={handleImportMemories}
          />
        )}

        {activeTab === "graph" && <DecisionGraph />}

        {activeTab === "budget" && <TokenBudgetMeter />}

        {activeTab === "guide" && <ArchitectureGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-neutral-800">MemGovernor</span>
            <span>•</span>
            <span>Hierarchical Memory & Context Governor for AI Agents</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Local-Only Storage Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("memory")}
              className="hover:text-neutral-900 transition-colors font-medium text-emerald-700"
            >
              Local Memory Store ({memories.length})
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

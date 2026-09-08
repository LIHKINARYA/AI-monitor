import React, { useState, useMemo } from "react";
import { MemoryItem, MemoryType } from "../types";
import {
  generateLocalEmbedding,
  cosineSimilarity,
  hybridSearchScore,
} from "../utils/tokenEstimator";
import {
  Search,
  Plus,
  Tag,
  ShieldCheck,
  History,
  BrainCircuit,
  Sparkles,
  Check,
  Copy,
  SlidersHorizontal,
  FileText,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface MemoryExplorerProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, "id" | "createdAt" | "embeddingVector">) => void;
  onDeleteMemory?: (id: string) => void;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<MemoryType>("EPISODIC");
  const [newTags, setNewTags] = useState("");
  const [newSourceFile, setNewSourceFile] = useState("");

  // Live Agent Context Synthesis Test State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisOutput, setSynthesisOutput] = useState<{
    injectedContext: string;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [copiedInjection, setCopiedInjection] = useState(false);

  // Compute search ranking using vector cosine similarity + lexical matching
  const rankedMemories = useMemo(() => {
    let list = [...memories];

    // Filter by type
    if (selectedTypeFilter !== "ALL") {
      list = list.filter((m) => m.type === selectedTypeFilter);
    }

    if (!searchQuery.trim()) {
      return list.map((m) => ({ ...m, score: undefined }));
    }

    const queryVec = generateLocalEmbedding(searchQuery);

    const scored = list.map((m) => {
      const vec = m.embeddingVector || generateLocalEmbedding(`${m.title} ${m.content} ${m.tags.join(" ")}`);
      const score = hybridSearchScore(searchQuery, `${m.title} ${m.content}`, queryVec, vec);
      return {
        ...m,
        score,
      };
    });

    // Sort by highest hybrid match score
    return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [memories, searchQuery, selectedTypeFilter]);

  const handleTestAgentRetrieval = async () => {
    if (!searchQuery.trim()) return;
    setIsSynthesizing(true);
    setSynthesisOutput(null);

    try {
      const response = await fetch("/api/semantic-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          memories: rankedMemories.slice(0, 5),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSynthesisOutput({
          injectedContext: data.injectedContext,
          confidence: data.confidence,
          reasoning: data.reasoning,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onAddMemory({
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      tags: tagsArray.length > 0 ? tagsArray : ["general"],
      confidence: 0.95,
      sourceFile: newSourceFile.trim() || undefined,
      preventLoopsCount: newType === "ANTI_REGRESSION" ? 1 : 0,
    });

    // Reset
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setNewSourceFile("");
    setIsAddingNew(false);
  };

  const copyInjection = () => {
    if (!synthesisOutput) return;
    navigator.clipboard.writeText(synthesisOutput.injectedContext);
    setCopiedInjection(true);
    setTimeout(() => setCopiedInjection(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-900">Local Vector & Episodic Memory Store</h2>
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                {memories.length} Active Records
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Provides the agent with long-term memory across sessions. Hybrid Vector (Cosine) + BM25 keyword matching runs locally in-editor without external cloud vendor locks.
            </p>
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors self-start shadow-xs"
            id="btn-add-memory"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? "Cancel" : "Add Memory Entry"}</span>
          </button>
        </div>

        {/* Search & Query Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by natural language query (e.g., 'Why do we use cookies for auth?' or 'Prisma pool fix')..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <button
            onClick={handleTestAgentRetrieval}
            disabled={isSynthesizing || !searchQuery.trim()}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shrink-0"
            id="btn-test-retrieval"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isSynthesizing ? "Synthesizing with Gemini..." : "Synthesize Context Injection"}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex items-center space-x-2 text-xs overflow-x-auto pb-1">
          <span className="text-neutral-500 font-medium text-[11px] flex items-center space-x-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {[
            { id: "ALL", label: "All Types" },
            { id: "ANTI_REGRESSION", label: "Anti-Regression Directives" },
            { id: "EPISODIC", label: "Episodic Decisions" },
            { id: "SEMANTIC", label: "Semantic Architecture" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTypeFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap transition-colors ${
                selectedTypeFilter === tab.id
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Result Card (if triggered) */}
      {synthesisOutput && (
        <div className="bg-neutral-900 text-white border border-neutral-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Synthesized Prompt Context Injection Block
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-neutral-400">
                Confidence: <strong className="text-emerald-400">{(synthesisOutput.confidence * 100).toFixed(0)}%</strong>
              </span>
              <button
                onClick={copyInjection}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-medium rounded flex items-center space-x-1"
              >
                {copiedInjection ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedInjection ? "Copied" : "Copy to Clipboard"}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-300 italic">{synthesisOutput.reasoning}</p>

          <pre className="bg-neutral-950 p-3 rounded-lg text-xs font-mono text-neutral-200 border border-neutral-800 overflow-x-auto whitespace-pre-wrap">
            {synthesisOutput.injectedContext}
          </pre>
        </div>
      )}

      {/* Add New Memory Drawer/Modal Form */}
      {isAddingNew && (
        <form onSubmit={handleCreateSubmit} className="bg-neutral-50 border border-neutral-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Add New Long-Term Agent Memory</h3>
            <span className="text-xs text-neutral-500">Auto-calculates vector embedding on save</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Memory Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as MemoryType)}
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              >
                <option value="EPISODIC">EPISODIC (Decision / Bug Fix / Milestone)</option>
                <option value="ANTI_REGRESSION">ANTI_REGRESSION (Forbidden Pattern)</option>
                <option value="SEMANTIC">SEMANTIC (Repo Architecture / Invariant)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Always use HttpOnly cookies"
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Source File (Optional)</label>
              <input
                type="text"
                value={newSourceFile}
                onChange={(e) => setNewSourceFile(e.target.value)}
                placeholder="e.g. src/middleware/auth.ts"
                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Memory Content / Invariant Rule</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Explain the decision, why the alternative was rejected, or the exact rule to enforce..."
              rows={3}
              className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="auth, security, cookies, express"
              className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
            >
              Commit to Local Vector Index
            </button>
          </div>
        </form>
      )}

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankedMemories.map((mem) => {
          const isAnti = mem.type === "ANTI_REGRESSION";
          const isEpisodic = mem.type === "EPISODIC";
          const isSemantic = mem.type === "SEMANTIC";

          return (
            <div
              key={mem.id}
              className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                isAnti
                  ? "border-amber-200 hover:border-amber-300"
                  : isEpisodic
                  ? "border-blue-200 hover:border-blue-300"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div>
                {/* Card Header: Type Badge + Score */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    {isAnti && <ShieldCheck className="w-4 h-4 text-amber-600" />}
                    {isEpisodic && <History className="w-4 h-4 text-blue-600" />}
                    {isSemantic && <BrainCircuit className="w-4 h-4 text-purple-600" />}

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isAnti
                          ? "bg-amber-100 text-amber-800"
                          : isEpisodic
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {mem.type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Similarity Score (when searching) */}
                  {mem.score !== undefined ? (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        mem.score > 0.6
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {(mem.score * 100).toFixed(0)}% Vector Match
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-mono">{mem.createdAt}</span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-neutral-900">{mem.title}</h4>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">{mem.content}</p>

                {mem.sourceFile && (
                  <div className="mt-2 flex items-center space-x-1 text-[11px] text-neutral-500 font-mono">
                    <FileText className="w-3 h-3 text-neutral-400" />
                    <span>{mem.sourceFile}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Tags & Prevented Loops */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1 flex-wrap gap-1">
                  {mem.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {mem.preventLoopsCount && mem.preventLoopsCount > 0 ? (
                  <span
                    className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap"
                    title="Number of times this anti-regression memory stopped an agent from entering an error loop"
                  >
                    Loops Blocked: {mem.preventLoopsCount}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

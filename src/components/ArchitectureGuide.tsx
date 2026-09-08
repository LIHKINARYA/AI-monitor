import React from "react";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileCode2,
  Database,
  Terminal,
} from "lucide-react";

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      {/* Hero Thesis */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
          <Brain className="w-3.5 h-3.5" />
          <span>Architectural Analysis & Research Thesis</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Why a Raw Vector Database in VS Code is Insufficient — And the Tri-Tier Solution
        </h1>

        <p className="text-sm text-neutral-600 leading-relaxed">
          Many developers instinctively try to solve AI coding agent memory by embedding local files into Chroma, Pinecone, or SQLite-vss. While vector similarity is useful for static code search, it fundamentally fails when applied to autonomous multi-turn agent task execution.
        </p>
      </div>

      {/* The 3 Fatal Flaws of Raw Vector DBs in Coding Agents */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>The Three Fatal Flaws of Raw Vector DBs in Agent Workflows</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Flaw 1: Temporal Blindness
            </span>
            <h3 className="text-sm font-bold text-neutral-900">No Sense of State Change</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Vector search retrieves chunks based purely on text similarity. It cannot distinguish between the deprecated code you refactored 10 minutes ago and the active new architecture, frequently hallucinating obsolete patterns.
            </p>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Flaw 2: "Lost in the Middle"
            </span>
            <h3 className="text-sm font-bold text-neutral-900">Context Window Starvation</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Dumping 10 retrieved vector snippets into an already bloated 80,000-token conversation containing compiler logs causes LLM attention degradation. Studies show retrieval accuracy drops up to 48% when context exceeds 65% capacity.
            </p>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Flaw 3: Causal Amnesia
            </span>
            <h3 className="text-sm font-bold text-neutral-900">Circular Regression Loops</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Vector DBs store what code *is*, but never store what *failed*. When an agent tries an approach, fails a unit test, and moves on, without episodic memory it will inevitably re-try the exact same broken fix 6 turns later.
            </p>
          </div>
        </div>
      </div>

      {/* The Better Approach: Tri-Tier Memory Architecture */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-neutral-900" />
            <h2 className="text-lg font-bold text-neutral-900">
              The Better Approach: The Tri-Tier Hierarchical Governor
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Separates memory into three distinct operational tiers matched to latency, durability, and causal scope.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tier 1 */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>Tier 1: Hot Working Memory & Token Window Governor</span>
              </span>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                Ephemeral • 2k-8k Tokens
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Actively governs the sliding context window. Strips repetitive terminal output, compiler frames, and folds unmodified method bodies via AST analysis. Keeps the agent under the 65% attention threshold so model reasoning stays sharp.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Tier 2: Warm Episodic Decision Graph & Anti-Regressions</span>
              </span>
              <span className="text-[11px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-semibold">
                Task Session Scope • Causal Milestones
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Maintains a chronological DAG of attempted hypotheses, test outputs, root-cause fixes, and explicit <strong>Anti-Regression Guardrails</strong> (e.g. <em>"Auth was switched to HttpOnly cookies; never re-generate Bearer tokens"</em>). Stops circular debugging loops.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-purple-600" />
                <span>Tier 3: Cold Semantic Vector Store (Local-First)</span>
              </span>
              <span className="text-[11px] font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                Repository Lifetime • Local SQLite / Embeddings
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Stores enduring architectural decisions, API contracts, domain concepts, and project guidelines. Queried via Hybrid Search (BM25 keyword overlap + Cosine vector similarity) only when relevant to the active sub-goal.
            </p>
          </div>
        </div>
      </div>

      {/* How It Integrates into Developer Workflows */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <span>Real-World Integration in VS Code & Claude Code</span>
        </h2>

        <p className="text-xs text-neutral-300 leading-relaxed">
          MemGovernor is designed to be completely non-intrusive. It exposes standard <strong>Model Context Protocol (MCP)</strong> endpoints so modern coding agents (Cursor, Windsurf, Claude Code, Roo Code, Cline) can natively call:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-amber-400 block font-bold">mcp:retrieve_memory</span>
            <span className="text-neutral-400 text-[11px]">Searches hybrid vector index for past decisions & invariants</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-emerald-400 block font-bold">mcp:commit_milestone</span>
            <span className="text-neutral-400 text-[11px]">Records completed sub-task & anti-regression guardrail</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-blue-400 block font-bold">mcp:compress_context</span>
            <span className="text-neutral-400 text-[11px]">Compacts verbose build logs and folds untouched files</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-purple-400 block font-bold">mcp:get_budget_plan</span>
            <span className="text-neutral-400 text-[11px]">Allocates token slots dynamically based on model window</span>
          </div>
        </div>
      </div>
    </div>
  );
};

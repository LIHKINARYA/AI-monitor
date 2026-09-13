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
  Zap,
  RefreshCw,
  TrendingDown,
  Lock,
  GitBranch,
  Sliders,
} from "lucide-react";

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      {/* Hero Header */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
          <Brain className="w-3.5 h-3.5" />
          <span>System Architecture & Problem Diagnosis</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          The Core Issues in AI Coding Agents — And The Approach We Follow
        </h1>

        <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
          Modern AI coding tools like <strong>Claude Code, Cursor, Windsurf, and Cline</strong> are remarkably capable at individual code transformations. However, in extended multi-turn engineering sessions, they suffer from four critical systemic failures: <strong>Context Window Rot</strong>, <strong>Circular Doom Loops</strong>, <strong>Silent Prompt Cache Invalidation</strong>, and <strong>Cross-Session Amnesia</strong>.
        </p>
      </div>

      {/* SECTION 1: THE FOUR CRITICAL ISSUES WE ARE SOLVING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>The Four Core Issues We Are Solving</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">Agent Failure Modes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issue 1 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Issue 1 • Attention Degradation
              </span>
              <span className="text-[11px] text-neutral-400">Context Window Rot</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              "Lost in the Middle" & Context Saturation
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              As multi-turn coding sessions accumulate hundreds of lines of terminal output, compiler traces, and redundant file dumps, context balloons past 80,000+ tokens. Research shows that LLM instruction-following accuracy drops up to <strong>48%</strong> when context exceeds 65% capacity. The agent begins hallucinating, forgetting user constraints, and dropping critical requirements.
            </p>
          </div>

          {/* Issue 2 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Issue 2 • Causal Amnesia
              </span>
              <span className="text-[11px] text-neutral-400">Circular Failure Loops</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Repetitive Retries & Agent Doom Loops
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Coding agents possess no chronological record of what failed in earlier turns. When a command or test fails, the agent attempts an ad-hoc fix, fails again, and within 2–3 turns circles back to retry the exact same broken patch. These runaway doom loops burn thousands of tokens without making progress and require manual developer aborts.
            </p>
          </div>

          {/* Issue 3 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Issue 3 • Economic Inefficiency
              </span>
              <span className="text-[11px] text-neutral-400">Silent Cache Invalidation</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Broken Prompt Caching (10x Token Cost Spikes)
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Anthropic Prompt Caching offers a <strong>90% discount</strong> ($0.30 vs $3.00/MTok) and 80% latency reduction when the prompt prefix exceeds 1,024 tokens. However, common developer habits—like injecting runtime timestamps (<code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">Date.now()</code>), random UUIDs, or mid-session edits to 300+ line <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">CLAUDE.md</code> files—silently break the cache prefix on every turn.
            </p>
          </div>

          {/* Issue 4 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Issue 4 • Continuity Loss
              </span>
              <span className="text-[11px] text-neutral-400">Cross-Session Drift</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              Session Amnesia & Regression On Restart
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              When developers quit the terminal, switch git branches, or resume tomorrow, the agent's working memory evaporates. The developer must re-paste instructions, and the agent frequently re-introduces previously resolved bugs (anti-regressions), breaking already verified architectural agreements.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE APPROACH WE ARE FOLLOWING */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-neutral-900" />
            <h2 className="text-lg font-bold text-neutral-900">
              The Approach We Are Following: MemGovernor Architecture
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            A comprehensive, local-first engineering framework designed around five coordinated pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Approach 1: Tri-Tier Memory Architecture */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>Pillar 1: Tri-Tier Hierarchical Context Architecture</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded font-semibold">
                Hot • Warm • Cold
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Instead of treating memory as a single unstructured text buffer, MemGovernor stratifies context into three operational tiers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                <span className="text-xs font-bold text-amber-700 block">Tier 1: Hot Working Context</span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Sliding-window compactor. Strips repetitive terminal output and folds unmodified method bodies via AST analysis to keep active context under 60% capacity.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                <span className="text-xs font-bold text-blue-700 block">Tier 2: Warm Episodic DAG</span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Chronological Directed Acyclic Graph storing attempted hypotheses, test outcomes, and active <strong>Anti-Regression Guardrails</strong> (e.g. <em>"Never revert to Bearer tokens"</em>).
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                <span className="text-xs font-bold text-purple-700 block">Tier 3: Cold Semantic Store</span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Local-first persistent store for long-term architectural patterns, domain rules, and schemas, retrieved on-demand via hybrid search rather than permanently stuffing prompt prefixes.
                </p>
              </div>
            </div>
          </div>

          {/* Approach 2: Prompt Cache Optimization */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Pillar 2: Anthropic Prompt Caching Alignment & Stable Prefix Protocol</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                90% Cost Reduction
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              MemGovernor structures the prompt prefix to strictly meet the Anthropic 1,024-token cache threshold while enforcing a deterministic hierarchy: <code className="text-neutral-800 bg-neutral-200 px-1 py-0.5 rounded font-mono text-[11px]">Tools Schema → Static Invariants → Dynamic History</code>. It scans for and strips volatile cache-busters (runtime timestamps, volatile session hashes), ensuring every turn achieves a cache hit ($0.30/MTok instead of $3.00/MTok) with ~80% faster TTFT.
            </p>
          </div>

          {/* Approach 3: Doom-Loop Circuit Breaker */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Pillar 3: Automated Doom-Loop Circuit Breaker</span>
              </span>
              <span className="text-[11px] font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-semibold">
                Turn-2 Interception
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              MemGovernor continuously inspects tool executions and file operations. If the agent repeats an identical failing command or cycles between reading the same files without making productive edits, MemGovernor trips an automated circuit breaker at Turn 2, halts the agent before context is burned, logs an <code className="text-neutral-800 bg-neutral-200 px-1 py-0.5 rounded font-mono text-[11px]">INTERCEPTION</code> node, and injects actionable corrective guidance.
            </p>
          </div>

          {/* Approach 4: Rules Offloader & Session Handoff */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-blue-600" />
                <span>Pillar 4: Rules Bloat Offloading & Structured Session Handoff (plan.md)</span>
              </span>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-semibold">
                Zero-Loss Resumes
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Oversized 300+ line <code className="text-neutral-800 bg-neutral-200 px-1 py-0.5 rounded font-mono text-[11px]">CLAUDE.md</code> files are automatically linted: large API interfaces and changelogs are offloaded into MemGovernor's persistent memory, generating a lean &lt;60-line directive file with on-demand MCP query hooks. Additionally, structured <code className="text-neutral-800 bg-neutral-200 px-1 py-0.5 rounded font-mono text-[11px]">plan.md</code> handoff snapshots preserve active goals, blockers, and anti-regressions for instant resumes with <code className="text-neutral-800 bg-neutral-200 px-1 py-0.5 rounded font-mono text-[11px]">claude --resume</code>.
            </p>
          </div>

          {/* Approach 5: Native Model Context Protocol (MCP) Standard */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-neutral-800" />
                <span>Pillar 5: Standard Model Context Protocol (MCP) Integration</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded font-semibold">
                13 Native Tools • Local-First
              </span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Rather than requiring proprietary cloud dashboards or SaaS subscriptions, MemGovernor runs locally on your machine via the open <strong>Model Context Protocol (MCP)</strong>. Claude Code, Cursor, Windsurf, and Cline connect directly to the local JSON-RPC endpoint to retrieve memories, check invariants, audit caches, and log decision nodes seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: COMPARISON MATRIX */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Side-by-Side Comparison: Traditional Agent Behavior vs. MemGovernor</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4 text-rose-700">Unmanaged Coding Agent</th>
                <th className="py-3 px-4 text-emerald-700">MemGovernor Managed Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              <tr>
                <td className="py-3 px-4 font-semibold text-neutral-900">Context Management</td>
                <td className="py-3 px-4 text-neutral-600">
                  Unbounded accumulation of compiler logs & files; degrades after 65% capacity.
                </td>
                <td className="py-3 px-4 text-emerald-800 font-medium bg-emerald-50/40">
                  Active sliding-window compaction & AST method folding; strictly stays under 60%.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-neutral-900">Failure Handling</td>
                <td className="py-3 px-4 text-neutral-600">
                  Blind retries; oscillates between identical broken fixes in infinite doom loops.
                </td>
                <td className="py-3 px-4 text-emerald-800 font-medium bg-emerald-50/40">
                  Automated Circuit Breaker halts loops at Turn 2; logs episodic causal failure nodes.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-neutral-900">Prompt Caching</td>
                <td className="py-3 px-4 text-neutral-600">
                  Prefix broken by runtime timestamps & random session IDs; 100% full token pricing.
                </td>
                <td className="py-3 px-4 text-emerald-800 font-medium bg-emerald-50/40">
                  Verified ≥1,024 prefix with stable ordering; locks in 90% Anthropic cache discount.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-neutral-900">Project Directives</td>
                <td className="py-3 px-4 text-neutral-600">
                  Bloated 300+ line CLAUDE.md files re-injected on every turn, burning context.
                </td>
                <td className="py-3 px-4 text-emerald-800 font-medium bg-emerald-50/40">
                  Schemas offloaded to local memory; clean &lt;60 line directive file with on-demand MCP retrieval.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-neutral-900">Session Resumes</td>
                <td className="py-3 px-4 text-neutral-600">
                  Total amnesia upon restart; developer must repeatedly re-prompt past decisions.
                </td>
                <td className="py-3 px-4 text-emerald-800 font-medium bg-emerald-50/40">
                  Standardized <code className="font-mono text-[11px]">plan.md</code> zero-loss handover with active invariants and blockers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: NATIVE MCP TOOL REFERENCE */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>Operational MCP Tool Suite (13 Available Tools)</span>
          </h2>
          <span className="text-xs font-mono text-neutral-400">Model Context Protocol 2024-11-05</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          MemGovernor exposes its capabilities directly to Claude Code and editor agents through 13 standardized local MCP tools:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono pt-1">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-amber-400 block font-bold">memgovernor_analyze_prompt_cache</span>
            <span className="text-neutral-400 text-[11px]">Audits 1,024-token prefix, detects volatile invalidators & audits 90% savings</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-amber-400 block font-bold">memgovernor_optimize_rules</span>
            <span className="text-neutral-400 text-[11px]">Lints oversized CLAUDE.md & offloads bulky schemas to local memory</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-amber-400 block font-bold">memgovernor_detect_doom_loop</span>
            <span className="text-neutral-400 text-[11px]">Circuit breaker halting repeated tool failures & file ping-pong loops</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-emerald-400 block font-bold">memgovernor_create_session_handoff</span>
            <span className="text-neutral-400 text-[11px]">Generates zero-loss plan.md with active invariants & next milestones</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-emerald-400 block font-bold">memgovernor_check_anti_regression</span>
            <span className="text-neutral-400 text-[11px]">Guards against re-introducing previously resolved architectural bugs</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-blue-400 block font-bold">memgovernor_compress_context</span>
            <span className="text-neutral-400 text-[11px]">Compacts compiler frames, trims logs & folds unmodified code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

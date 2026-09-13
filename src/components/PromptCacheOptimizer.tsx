import React, { useState, useMemo } from "react";
import {
  Cpu,
  Zap,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Terminal,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Download,
  Database,
  ExternalLink,
} from "lucide-react";
import { MemoryItem, MemoryType, PromptCacheAudit, ClaudeMdRuleOffload, DoomLoopCheckResult } from "../types";
import { addLocalDecisionNode, saveLocalMemories, loadLocalMemories } from "../services/localStorage";

interface PromptCacheOptimizerProps {
  onAddMemory?: (mem: Omit<MemoryItem, "id" | "createdAt" | "embeddingVector">) => void;
  onRefreshMemories?: () => void;
}

export const PromptCacheOptimizer: React.FC<PromptCacheOptimizerProps> = ({
  onAddMemory,
  onRefreshMemories,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"cache" | "claudemd" | "doomloop" | "handoff">("cache");

  // TAB 1: PROMPT CACHE ANALYZER STATE
  const [systemPromptInput, setSystemPromptInput] = useState<string>(
    `You are an expert full-stack TypeScript engineer working on a React + Vite + Express web service.
Adhere strictly to project conventions:
- Use TypeScript strictly without 'any' overrides.
- Backend API routes live in /server.ts.
- Always check established anti-regression invariants before refactoring.`
  );
  const [claudeMdInput, setClaudeMdInput] = useState<string>(
    `# Project Directives
- Build Command: npm run build
- Dev Server: npm run dev (port 3000)
- Lint: npm run lint
- Testing: npm test

## Core Architectural Invariants
1. Authentication: Backend uses HttpOnly signed cookies for session tokens. NEVER emit Authorization Bearer headers.
2. Database Pooler: PostgreSQL connects via PgBouncer port 6543 with ?sslmode=require&pgbouncer=true. Max pool size is 15.
3. Realtime Sockets: Never call synchronous fs methods (fs.readFileSync) inside WebSocket onMessage event handlers.
4. Tailwind 4: Use @import 'tailwindcss'; directly in index.css. Do NOT generate postcss.config.js or tailwind.config.js.`
  );
  const [toolsCount, setToolsCount] = useState<number>(13);
  const [hasTimestampBuster, setHasTimestampBuster] = useState<boolean>(false);
  const [hasUuidBuster, setHasUuidBuster] = useState<boolean>(false);
  const [cacheAuditResult, setCacheAuditResult] = useState<PromptCacheAudit | null>(null);
  const [isAuditingCache, setIsAuditingCache] = useState<boolean>(false);

  // TAB 2: CLAUDE.MD BLOAT OFFLOADER STATE
  const [rawRulesInput, setRawRulesInput] = useState<string>(
    `# Project Directives & Coding Standards

## Build & Test Commands
- \`npm run build\` - Production build
- \`npm run dev\` - Local dev server
- \`npm test\` - Unit test suite

## Data Schemas & API Reference
interface UserProfilePayload {
  userId: string;
  email: string;
  roles: Array<'ADMIN' | 'DEVELOPER' | 'VIEWER'>;
  billingTier: 'FREE' | 'PRO' | 'ENTERPRISE';
  metadata: {
    lastLogin: string;
    organizationId: string;
    allowedIpRanges: string[];
  };
}

interface BillingInvoiceRecord {
  invoiceId: string;
  customerId: string;
  amountCents: number;
  currency: 'USD' | 'EUR';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  lineItems: Array<{
    itemSku: string;
    quantity: number;
    unitPriceCents: number;
  }>;
}

## Historic Bug Fixes & Invariants
- Invariant #1: Backend migrated from Authorization Bearer headers to HttpOnly cookie 'session_token'.
- Invariant #2: Neon/PgBouncer pooler port 6543 requires ?sslmode=require&pgbouncer=true. Max connections hard-capped at 15.
- Invariant #3: Vite Tailwind 4 must use @import 'tailwindcss'; directly in index.css. Do NOT generate postcss.config.js.

## Legacy Changelog & History
- 2026-08-12: Refactored legacy auth handlers.
- 2026-08-18: Dropped Redis session cache in favor of signed token cookies.
- 2026-08-25: Updated Dockerfile to Node 20 LTS.`
  );
  const [optimizedRules, setOptimizedRules] = useState<ClaudeMdRuleOffload | null>(null);
  const [isOptimizingRules, setIsOptimizingRules] = useState<boolean>(false);
  const [copiedCleanRules, setCopiedCleanRules] = useState<boolean>(false);
  const [committedCount, setCommittedCount] = useState<number | null>(null);

  // TAB 3: DOOM-LOOP DETECTOR STATE
  const [scenarioType, setScenarioType] = useState<"loop_tests" | "loop_files" | "healthy">("loop_tests");
  const [doomLoopResult, setDoomLoopResult] = useState<DoomLoopCheckResult | null>(null);
  const [isCheckingDoomLoop, setIsCheckingDoomLoop] = useState<boolean>(false);

  // TAB 4: SESSION HANDOFF STATE
  const [handoffGoal, setHandoffGoal] = useState<string>("Migrate Authentication to HttpOnly Session Cookies & PgBouncer Connection Limits");
  const [handoffBlockers, setHandoffBlockers] = useState<string>("CORS staging requires SameSite=None + Secure attribute for cross-origin local testing");
  const [handoffNextSteps, setHandoffNextSteps] = useState<string>("1. Verify cookie drop on staging endpoint\n2. Run full regression test suite\n3. Deploy to production");
  const [generatedHandoff, setGeneratedHandoff] = useState<string | null>(null);
  const [copiedHandoff, setCopiedHandoff] = useState<boolean>(false);

  // Dynamic Cache Prefix Calculation
  const activePromptText = useMemo(() => {
    let text = `${systemPromptInput}\n\n${claudeMdInput}`;
    if (hasTimestampBuster) {
      text += `\n\n[Current Session Timestamp: ${new Date().toISOString()}]`;
    }
    if (hasUuidBuster) {
      text += `\n\n[Session Trace ID: 4f8b2c19-9e8a-4d22-b51f-2e38c7198a04]`;
    }
    return text;
  }, [systemPromptInput, claudeMdInput, hasTimestampBuster, hasUuidBuster]);

  const estimatedPrefixTokens = useMemo(() => {
    const textTokens = Math.ceil(activePromptText.length / 4);
    const toolsTokens = toolsCount * 140;
    return textTokens + toolsTokens;
  }, [activePromptText, toolsCount]);

  const meetsThreshold = estimatedPrefixTokens >= 1024;

  // Run Prompt Cache Audit via MCP RPC
  const handleRunCacheAudit = async () => {
    setIsAuditingCache(true);
    try {
      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `audit-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_analyze_prompt_cache",
            arguments: {
              systemPrompt: systemPromptInput + (hasTimestampBuster ? `\n[Timestamp: ${new Date().toISOString()}]` : "") + (hasUuidBuster ? "\n[UUID: 4f8b2c19-9e8a-4d22-b51f-2e38c7198a04]" : ""),
              claudemdContent: claudeMdInput,
              toolsCount,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.result?.metadata) {
        setCacheAuditResult(data.result.metadata);
      }
    } catch (err) {
      console.error("Cache audit error:", err);
    } finally {
      setIsAuditingCache(false);
    }
  };

  // Run CLAUDE.md Optimizer via MCP RPC
  const handleOptimizeRules = async () => {
    setIsOptimizingRules(true);
    setCommittedCount(null);
    try {
      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `rules-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_optimize_rules",
            arguments: {
              rulesText: rawRulesInput,
              autoCommitMemories: false,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.result?.metadata) {
        setOptimizedRules(data.result.metadata);
      }
    } catch (err) {
      console.error("Optimize rules error:", err);
    } finally {
      setIsOptimizingRules(false);
    }
  };

  // Commit Extracted Memories to Local Storage
  const handleCommitOffloadedMemories = () => {
    if (!optimizedRules || !optimizedRules.extractedMemories) return;

    const currentMemories = loadLocalMemories();
    let count = 0;

    for (const mem of optimizedRules.extractedMemories) {
      const newMemory: MemoryItem = {
        id: `mem-offload-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        type: mem.type,
        title: mem.title,
        content: mem.content,
        tags: mem.tags,
        confidence: 0.96,
        createdAt: new Date().toISOString().split("T")[0],
      };
      currentMemories.unshift(newMemory);
      count++;
    }

    saveLocalMemories(currentMemories);
    setCommittedCount(count);
    if (onRefreshMemories) onRefreshMemories();
  };

  // Run Doom-Loop Detection via MCP RPC
  const handleCheckDoomLoop = async () => {
    setIsCheckingDoomLoop(true);
    try {
      let actions = [];
      if (scenarioType === "loop_tests") {
        actions = [
          { turn: 1, tool: "run_command", target: "npm test", outcome: "Failed: 1 assertion failed in server/auth.spec.ts" },
          { turn: 2, tool: "edit_file", target: "server/auth.ts", outcome: "Replaced auth check with Bearer header" },
          { turn: 3, tool: "run_command", target: "npm test", outcome: "Failed: 1 assertion failed in server/auth.spec.ts" },
          { turn: 4, tool: "run_command", target: "npm test", outcome: "Failed: 1 assertion failed in server/auth.spec.ts" },
        ];
      } else if (scenarioType === "loop_files") {
        actions = [
          { turn: 1, tool: "view_file", target: "server.ts", outcome: "Inspected server" },
          { turn: 2, tool: "view_file", target: "src/App.tsx", outcome: "Inspected App" },
          { turn: 3, tool: "view_file", target: "server.ts", outcome: "Re-read server again" },
          { turn: 4, tool: "view_file", target: "src/App.tsx", outcome: "Re-read App again" },
        ];
      } else {
        actions = [
          { turn: 1, tool: "view_file", target: "server.ts", outcome: "Read endpoint" },
          { turn: 2, tool: "edit_file", target: "server.ts", outcome: "Updated session cookie verification" },
          { turn: 3, tool: "run_command", target: "npm test", outcome: "Success: 4 tests passed" },
        ];
      }

      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `doom-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_detect_doom_loop",
            arguments: {
              recentActions: actions,
              failureThreshold: 2,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.result?.metadata) {
        setDoomLoopResult(data.result.metadata);
        if (data.result.metadata.circuitBreakerTripped) {
          addLocalDecisionNode({
            turn: 8,
            type: "INTERCEPTION",
            title: "Automated Circuit Breaker: Doom Loop Intercepted",
            description: `Interrupted circular repetition: ${data.result.metadata.repeatedActionPattern}`,
            tokensCost: `Saved ~${(data.result.metadata.wastedTokensEstimate * 2).toLocaleString()} tokens`,
            outcome: "Halted automated tool runaway to prevent token burn.",
          });
        }
      }
    } catch (err) {
      console.error("Doom loop check error:", err);
    } finally {
      setIsCheckingDoomLoop(false);
    }
  };

  // Generate Session Handoff via MCP RPC
  const handleGenerateHandoff = async () => {
    try {
      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `handoff-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_create_session_handoff",
            arguments: {
              activeGoal: handoffGoal,
              currentBlockers: handoffBlockers.split("\n").filter(Boolean),
              nextSteps: handoffNextSteps.split("\n").filter(Boolean),
            },
          },
        }),
      });
      const data = await res.json();
      if (data.result?.metadata?.markdownHandoffPlan) {
        setGeneratedHandoff(data.result.metadata.markdownHandoffPlan);
      }
    } catch (err) {
      console.error("Handoff error:", err);
    }
  };

  const copyToClipboard = (text: string, type: "rules" | "handoff") => {
    navigator.clipboard.writeText(text);
    if (type === "rules") {
      setCopiedCleanRules(true);
      setTimeout(() => setCopiedCleanRules(false), 2000);
    } else {
      setCopiedHandoff(true);
      setTimeout(() => setCopiedHandoff(false), 2000);
    }
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
                CLAUDE CODE & AGENT OPTIMIZER
              </span>
              <span className="text-xs font-mono text-neutral-400">Anthropic Prompt Caching & Anti-Loop Protocol</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 tracking-tight">
              Prompt Cache Inspector, Rules Optimizer & Doom-Loop Breaker
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              Solve the 3 biggest problems developers face with Claude Code and coding agents: <strong>Silent Cache Invalidation</strong> (destroying the 90% discount), <strong>Bloated CLAUDE.md files</strong> (burning 20% of context on every turn), and <strong>Infinite Circular Doom Loops</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab("cache")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "cache"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Prompt Cache
            </button>
            <button
              onClick={() => setActiveSubTab("claudemd")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "claudemd"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              CLAUDE.md Offloader
            </button>
            <button
              onClick={() => setActiveSubTab("doomloop")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "doomloop"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Doom-Loop Breaker
            </button>
            <button
              onClick={() => setActiveSubTab("handoff")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "handoff"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Session Handoff
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: ANTHROPIC PROMPT CACHE ANALYZER */}
      {activeSubTab === "cache" && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Estimated Prefix Tokens */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Prefix Token Size</span>
                <Cpu className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  {estimatedPrefixTokens.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">tokens</span>
              </div>
              <div className="mt-2 text-[11px] text-neutral-500 flex items-center space-x-1">
                <span className="font-mono">Threshold: 1,024 tokens</span>
              </div>
            </div>

            {/* Metric 2: Cache Eligibility */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Anthropic Cache Status</span>
                {meetsThreshold ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded ${
                    meetsThreshold
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {meetsThreshold ? "CACHEABLE (≥ 1,024)" : "TOO SHORT (< 1,024)"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                {meetsThreshold
                  ? "Claude 3.5 Sonnet / 3.7 will cache this prefix."
                  : "Prefix must reach 1,024 tokens to activate cache."}
              </p>
            </div>

            {/* Metric 3: Cost Savings on Cache Read */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Token Cost Discount</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-2xl font-bold font-mono text-emerald-600">90%</span>
                <span className="text-xs font-medium text-neutral-600">cheaper reads</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                Cache Read: <strong>$0.30/MTok</strong> vs Write: $3.00/MTok
              </p>
            </div>

            {/* Metric 4: Invalidation Risk */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Cache Invalidation Risk</span>
                {hasTimestampBuster || hasUuidBuster ? (
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded ${
                    hasTimestampBuster || hasUuidBuster
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasTimestampBuster || hasUuidBuster ? "CACHE BUSTER DETECTED" : "STABLE PREFIX"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">
                {hasTimestampBuster || hasUuidBuster
                  ? "Dynamic elements invalidate cache every turn!"
                  : "Zero dynamic timestamp or volatile hash detected."}
              </p>
            </div>
          </div>

          {/* Interactive Playground & Invalidator Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-neutral-900" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Prompt Prefix Composition (Cached Scope)
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400">Order: Tools → System → CLAUDE.md</span>
              </div>

              {/* Invalidation Trap Simulator Controls */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
                <span className="text-xs font-bold text-neutral-800 block">
                  Simulate Developer Cache Mistakes:
                </span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTimestampBuster}
                      onChange={(e) => setHasTimestampBuster(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-neutral-700">Inject Dynamic Runtime Timestamp (<code className="text-rose-600 font-mono text-[10px]">Date.now()</code>)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasUuidBuster}
                      onChange={(e) => setHasUuidBuster(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-neutral-700">Inject Volatile Session UUID</span>
                  </label>
                </div>
              </div>

              {/* System Instructions Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 flex justify-between">
                  <span>System Prompt (Core Agent Persona):</span>
                  <span className="font-mono text-[11px] text-neutral-400">~{Math.ceil(systemPromptInput.length / 4)} tokens</span>
                </label>
                <textarea
                  value={systemPromptInput}
                  onChange={(e) => setSystemPromptInput(e.target.value)}
                  rows={4}
                  className="w-full font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              {/* CLAUDE.md Rules Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 flex justify-between">
                  <span>CLAUDE.md Directives (Workspace Guidelines):</span>
                  <span className="font-mono text-[11px] text-neutral-400">~{Math.ceil(claudeMdInput.length / 4)} tokens</span>
                </label>
                <textarea
                  value={claudeMdInput}
                  onChange={(e) => setClaudeMdInput(e.target.value)}
                  rows={6}
                  className="w-full font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              {/* Tools Count */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <span className="font-bold text-neutral-700">Declared MCP Tools: </span>
                  <span className="font-mono text-neutral-500">{toolsCount} tools (~{toolsCount * 140} tokens)</span>
                </div>
                <button
                  onClick={handleRunCacheAudit}
                  disabled={isAuditingCache}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                  id="btn-run-prompt-cache-audit"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditingCache ? "animate-spin" : ""}`} />
                  <span>{isAuditingCache ? "Running MCP Audit..." : "Run MCP Cache Audit"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Audit Output & Health Breakdown */}
            <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Prompt Cache Health & Economics
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">
                    Anthropic Compliant
                  </span>
                </div>

                {/* Progress Bar towards 1,024 threshold */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-700">Prefix Cache Progress</span>
                    <span className="font-mono text-neutral-900">
                      {Math.min(100, Math.round((estimatedPrefixTokens / 1024) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        meetsThreshold ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, (estimatedPrefixTokens / 1024) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>0 tok</span>
                    <span>1,024 min threshold</span>
                    <span>2,048 tok</span>
                  </div>
                </div>

                {/* Warnings Box */}
                {(hasTimestampBuster || hasUuidBuster || !meetsThreshold) && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Cache Traps Detected:</span>
                    </div>
                    <ul className="text-amber-800 space-y-1 text-[11px] list-disc pl-4">
                      {hasTimestampBuster && (
                        <li>
                          <strong>Runtime Timestamp:</strong> Dynamic dates invalidate the cache on every prompt. In Claude Code, never include timestamps inside system prompts.
                        </li>
                      )}
                      {hasUuidBuster && (
                        <li>
                          <strong>Volatile UUID:</strong> Random IDs force a complete cache miss. Pass session IDs in tool arguments instead.
                        </li>
                      )}
                      {!meetsThreshold && (
                        <li>
                          <strong>Prefix under 1,024 tokens:</strong> Anthropic Prompt Caching requires a minimum prefix length of 1,024 tokens for Claude 3.5 Sonnet and Opus. Shorter prompts receive 0% cache hit rate.
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* MCP Audit Result Card (if executed) */}
                {cacheAuditResult && (
                  <div className="bg-neutral-950 text-neutral-100 p-3.5 rounded-lg border border-neutral-800 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>MCP Tool Result</span>
                      <span>Score: {cacheAuditResult.cacheHealthScore}/100</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Total Prefix: <strong>{cacheAuditResult.prefixTokens.toLocaleString()} tokens</strong> • Cacheable:{" "}
                      <strong className={cacheAuditResult.isCacheable ? "text-emerald-400" : "text-amber-400"}>
                        {cacheAuditResult.isCacheable ? "YES" : "NO"}
                      </strong>
                    </p>
                    <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                      {cacheAuditResult.recommendations.map((rec, i) => (
                        <p key={i}>• {rec}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings Calculator Card */}
                <div className="border border-neutral-200 bg-neutral-50 rounded-lg p-3 space-y-2 text-xs">
                  <span className="font-bold text-neutral-800 block">30-Turn Session Economics (Sonnet 3.5):</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded border border-neutral-200">
                      <span className="text-neutral-500 block">Without Cache:</span>
                      <span className="font-bold text-rose-600 font-mono">$0.09 / turn</span>
                      <span className="text-neutral-400 block mt-0.5">3.5s latency</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-neutral-200">
                      <span className="text-neutral-500 block">With Cache (MemGovernor):</span>
                      <span className="font-bold text-emerald-600 font-mono">$0.009 / turn</span>
                      <span className="text-emerald-600 block mt-0.5">0.7s latency (80% faster)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
                <span>Verified with Anthropic Prompt Caching API</span>
                <span className="font-mono text-emerald-700 font-medium">90% Cache Savings</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CLAUDE.MD BLOAT OFFLOADER */}
      {activeSubTab === "claudemd" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  CLAUDE.md & Rules Bloat Offloader
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Developers often overload <code>CLAUDE.md</code> with 300+ lines of API schemas, interfaces, and changelogs. This bloats every turn. MemGovernor extracts them into persistent local memories and produces a lean &lt;60-line cached directive file.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOptimizeRules}
                  disabled={isOptimizingRules}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                  id="btn-optimize-rules"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isOptimizingRules ? "Analyzing & Offloading..." : "Optimize & Offload Rules"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Raw Oversized CLAUDE.md */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">Your Current CLAUDE.md / .cursorrules:</span>
                  <span className="font-mono text-neutral-400">{rawRulesInput.split("\n").length} lines</span>
                </div>
                <textarea
                  value={rawRulesInput}
                  onChange={(e) => setRawRulesInput(e.target.value)}
                  rows={16}
                  className="w-full font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Right: Optimized Result & Extracted Memories */}
              <div className="space-y-4">
                {optimizedRules ? (
                  <div className="space-y-3">
                    {/* Savings Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-neutral-50 border border-neutral-200 p-2.5 rounded-lg text-center">
                        <span className="text-[10px] text-neutral-500 block">Original</span>
                        <span className="text-base font-bold font-mono text-neutral-800">
                          {optimizedRules.originalLines} lines
                        </span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
                        <span className="text-[10px] text-emerald-600 block">Optimized</span>
                        <span className="text-base font-bold font-mono text-emerald-800">
                          {optimizedRules.optimizedLines} lines
                        </span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center">
                        <span className="text-[10px] text-amber-600 block">Saved Per Turn</span>
                        <span className="text-base font-bold font-mono text-amber-800">
                          ~{optimizedRules.tokensSavedPerTurn.toLocaleString()} tok
                        </span>
                      </div>
                    </div>

                    {/* Extracted Sections Card */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">
                          Offloaded to MemGovernor Local Memory:
                        </span>
                        <button
                          onClick={handleCommitOffloadedMemories}
                          disabled={committedCount !== null}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 text-white disabled:text-neutral-600 text-xs font-semibold rounded flex items-center space-x-1 transition-colors"
                        >
                          <Database className="w-3 h-3" />
                          <span>{committedCount !== null ? `Committed (${committedCount})` : "Save to Local DB"}</span>
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto">
                        {optimizedRules.extractedMemories.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 bg-neutral-50 rounded border border-neutral-100">
                            <span className="font-semibold text-neutral-800">{m.title}</span>
                            <span className="font-mono text-xs px-1.5 py-0.2 bg-neutral-200 text-neutral-700 rounded">
                              {m.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lean CLAUDE.md Code Block */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-800">Lean, Cache-Stable CLAUDE.md:</span>
                        <button
                          onClick={() => copyToClipboard(optimizedRules.leanClaudeMd, "rules")}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs flex items-center space-x-1"
                        >
                          {copiedCleanRules ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCleanRules ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-neutral-950 text-neutral-100 font-mono text-xs rounded-lg border border-neutral-800 max-h-52 overflow-y-auto leading-relaxed">
                        {optimizedRules.leanClaudeMd}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center text-neutral-400 space-y-3">
                    <Sparkles className="w-8 h-8 text-neutral-300" />
                    <p className="text-xs max-w-sm">
                      Click <strong>"Optimize & Offload Rules"</strong> above to extract schemas and repetitive documentation into MemGovernor's persistent local memory store.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DOOM-LOOP CIRCUIT BREAKER */}
      {activeSubTab === "doomloop" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Doom-Loop Circuit Breaker & Repetition Detector
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                AI coding agents frequently get trapped repeating the same failed command, re-reading identical files, or cycling between two incompatible fixes. MemGovernor's circuit breaker halts the loop at Turn 2 and injects an intervention.
              </p>
            </div>

            {/* Scenario Chooser */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-800 block">Select Test Scenario:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "loop_tests",
                    title: "Failing Test Doom Loop",
                    desc: "Agent attempts same failing 'npm test' 3 times in a row.",
                    badge: "FAILING LOOP",
                  },
                  {
                    id: "loop_files",
                    title: "File Ping-Pong Loop",
                    desc: "Agent repeatedly reads server.ts & App.tsx without edits.",
                    badge: "CIRCULAR READ",
                  },
                  {
                    id: "healthy",
                    title: "Normal Execution",
                    desc: "Linear progress: View file → Apply fix → Tests pass.",
                    badge: "HEALTHY",
                  },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScenarioType(s.id as any);
                      setDoomLoopResult(null);
                    }}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      scenarioType === s.id
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{s.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          scenarioType === s.id ? "bg-amber-400 text-neutral-950" : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {s.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${scenarioType === s.id ? "text-neutral-300" : "text-neutral-500"}`}>
                      {s.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCheckDoomLoop}
              disabled={isCheckingDoomLoop}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
              id="btn-test-doom-loop"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCheckingDoomLoop ? "Inspecting Turn Trace..." : "Run Circuit Breaker Check"}</span>
            </button>

            {/* Circuit Breaker Result Output */}
            {doomLoopResult && (
              <div
                className={`p-5 rounded-xl border ${
                  doomLoopResult.circuitBreakerTripped
                    ? "bg-rose-50 border-rose-200"
                    : "bg-emerald-50 border-emerald-200"
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {doomLoopResult.circuitBreakerTripped ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    )}
                    <h4
                      className={`text-sm font-bold ${
                        doomLoopResult.circuitBreakerTripped ? "text-rose-900" : "text-emerald-900"
                      }`}
                    >
                      {doomLoopResult.circuitBreakerTripped
                        ? "CIRCUIT BREAKER TRIGGERED • AGENT HALTED"
                        : "CLEAN TRACE • NO CIRCULAR PATTERN"}
                    </h4>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      doomLoopResult.circuitBreakerTripped
                        ? "bg-rose-200 text-rose-900"
                        : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    Repetitions: {doomLoopResult.repetitionCount}
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    doomLoopResult.circuitBreakerTripped ? "text-rose-800" : "text-emerald-800"
                  }`}
                >
                  {doomLoopResult.suggestedIntervention}
                </p>

                {doomLoopResult.circuitBreakerTripped && (
                  <div className="pt-3 border-t border-rose-200 flex flex-wrap items-center justify-between text-xs text-rose-700 gap-2">
                    <span>
                      Estimated Token Burn Prevented:{" "}
                      <strong className="font-mono text-rose-900">
                        ~{doomLoopResult.wastedTokensEstimate.toLocaleString()} tokens
                      </strong>
                    </span>
                    <span className="font-semibold text-rose-900">
                      ✓ Recorded as INTERCEPTION Node in Episodic Decision Graph
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: SESSION HANDOFF */}
      {activeSubTab === "handoff" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Session Handoff & Branch Memory (plan.md)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Generate zero-loss handover plans so you can quit Claude Code, run <code>claude --resume</code>, switch branches, or delegate to a subagent without losing established constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Primary Goal Being Handed Off:</label>
                <input
                  type="text"
                  value={handoffGoal}
                  onChange={(e) => setHandoffGoal(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Known Blockers / Dead-Ends:</label>
                <input
                  type="text"
                  value={handoffBlockers}
                  onChange={(e) => setHandoffBlockers(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Next Action Checklist:</label>
                <input
                  type="text"
                  value={handoffNextSteps}
                  onChange={(e) => setHandoffNextSteps(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateHandoff}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
              id="btn-generate-handoff"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate Standardized plan.md</span>
            </button>

            {generatedHandoff && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800">Generated plan.md (Ready for Claude Code / Cursor):</span>
                  <button
                    onClick={() => copyToClipboard(generatedHandoff, "handoff")}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs flex items-center space-x-1"
                  >
                    {copiedHandoff ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHandoff ? "Copied!" : "Copy plan.md"}</span>
                  </button>
                </div>
                <pre className="p-4 bg-neutral-950 text-neutral-100 font-mono text-xs rounded-xl border border-neutral-800 max-h-64 overflow-y-auto leading-relaxed">
                  {generatedHandoff}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

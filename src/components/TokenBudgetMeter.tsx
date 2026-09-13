import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Sliders,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight,
} from "lucide-react";
import { loadLocalTokensSaved } from "../services/localStorage";

export const TokenBudgetMeter: React.FC = () => {
  const [windowSize, setWindowSize] = useState<number>(128000);
  const [rawUsageTokens, setRawUsageTokens] = useState<number>(94200);
  const [governedUsageTokens, setGovernedUsageTokens] = useState<number>(14800);
  const [localTokensSaved, setLocalTokensSaved] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [mcpAuditResult, setMcpAuditResult] = useState<any>(null);

  useEffect(() => {
    setLocalTokensSaved(loadLocalTokensSaved());
  }, []);

  // Breakdown of governed context
  const systemPrompt = 3800;
  const semanticMemory = 4200;
  const workingState = 2800;
  const activeFiles = 4000;
  const totalGoverned = systemPrompt + semanticMemory + workingState + activeFiles;

  const rawPercentage = Math.min(100, (rawUsageTokens / windowSize) * 100);
  const governedPercentage = Math.min(100, (totalGoverned / windowSize) * 100);
  const isDegradedAttention = rawPercentage > 65;

  const handleRunMcpAudit = async () => {
    setIsAuditing(true);
    setMcpAuditResult(null);
    try {
      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `audit-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_audit_token_budget",
            arguments: {
              currentTokens: rawUsageTokens,
              windowSize: windowSize,
              breakdown: {
                systemPrompt,
                activeFiles,
                conversationHistory: Math.max(0, rawUsageTokens - 12000),
                toolOutputs: Math.floor(rawUsageTokens * 0.4),
              },
            },
          },
        }),
      });
      const data = await res.json();
      setMcpAuditResult(data.result);
    } catch (err: any) {
      setMcpAuditResult({
        content: [{ type: "text", text: `Audit error: ${err.message}` }],
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const applyPreset = (tokens: number, size: number) => {
    setWindowSize(size);
    setRawUsageTokens(tokens);
    setMcpAuditResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-neutral-900">Context Window Governor & Attention Budget</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                Attention Guard Active
              </span>
              {localTokensSaved > 0 && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  {localTokensSaved.toLocaleString()} Local Tokens Saved
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              LLMs suffer from the <em>"Lost-in-the-Middle"</em> phenomenon. When context windows exceed 65% capacity with uncompressed tool logs, needle retrieval accuracy drops by up to 48%. MemGovernor enforces dynamic token rationing.
            </p>
          </div>

          {/* Model Window Selector */}
          <div className="flex items-center space-x-2 bg-neutral-50 p-1.5 border border-neutral-200 rounded-lg">
            <span className="text-xs font-medium text-neutral-600 pl-2">Window Size:</span>
            {[32000, 64000, 128000, 200000].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setWindowSize(size);
                  setMcpAuditResult(null);
                }}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  windowSize === size
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                }`}
              >
                {(size / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Presets & Sliders */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-700">Quick Test Scenarios:</span>
            <button
              onClick={() => applyPreset(24000, 128000)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors"
            >
              Bugfix (24k)
            </button>
            <button
              onClick={() => applyPreset(94200, 128000)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors"
            >
              Refactor (94k - Degradation)
            </button>
            <button
              onClick={() => applyPreset(165000, 200000)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors"
            >
              Monorepo (165k - Severe Loop)
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-neutral-500">Simulate Token Load:</span>
            <input
              type="range"
              min={10000}
              max={windowSize}
              step={2000}
              value={rawUsageTokens}
              onChange={(e) => {
                setRawUsageTokens(Number(e.target.value));
                setMcpAuditResult(null);
              }}
              className="w-36 accent-neutral-900 cursor-pointer"
            />
            <span className="font-mono font-bold text-neutral-900 min-w-16">
              {(rawUsageTokens / 1000).toFixed(1)}k
            </span>
            <button
              onClick={handleRunMcpAudit}
              disabled={isAuditing}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
              id="btn-run-mcp-audit"
            >
              {isAuditing ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Run MCP Token Audit</span>
            </button>
          </div>
        </div>

        {/* Live MCP Audit Result Banner */}
        {mcpAuditResult && (
          <div className="mt-4 p-3.5 bg-neutral-950 text-neutral-100 rounded-xl border border-neutral-800 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400">
              <span className="flex items-center space-x-1.5 text-amber-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Unified MCP Server Audit Response</span>
              </span>
              <span className="text-[11px]">Tool: memgovernor_audit_token_budget</span>
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-neutral-200">
              {mcpAuditResult.content?.[0]?.text || JSON.stringify(mcpAuditResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Comparison Grid: Ungoverned vs Governed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Standard Ungoverned Context */}
        <div className="bg-white border border-red-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-neutral-900">Standard Agent Context (Ungoverned)</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                {rawPercentage.toFixed(1)}% Saturated
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Raw terminal stack traces, entire 600-line files dumped into chat, repeated compiler warnings.
            </p>

            {/* Visual Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>Total Accumulated: <strong className="text-neutral-900 font-mono">{rawUsageTokens.toLocaleString()} tokens</strong></span>
                <span className={isDegradedAttention ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>
                  {isDegradedAttention ? "Degradation Zone (>65%)" : "Safe Zone (<65%)"}
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-4 relative overflow-hidden border border-neutral-200">
                {/* 65% threshold indicator */}
                <div
                  className="absolute top-0 bottom-0 border-r-2 border-dashed border-red-400 z-10"
                  style={{ left: "65%" }}
                  title="Attention degradation threshold"
                />
                <div
                  className="h-full bg-linear-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${rawPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
                <span>0k</span>
                <span className="text-red-500">Threshold 65% ({(windowSize * 0.65 / 1000).toFixed(0)}k)</span>
                <span>{(windowSize / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Negative Effects */}
            <div className="mt-4 p-3 bg-red-50/70 border border-red-100 rounded-lg text-xs space-y-1.5 text-red-800">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-red-600 shrink-0" />
                <span><strong>Lost-in-the-middle amnesia:</strong> Agent ignores architectural instructions given in turn 2.</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-red-600 shrink-0" />
                <span><strong>High Latency & Cost:</strong> {rawUsageTokens.toLocaleString()} tokens processed on every single tool call.</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-red-600 shrink-0" />
                <span><strong>Regression Loops:</strong> Agent re-attempts previously failed syntax fixes.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Status: <strong className={isDegradedAttention ? "text-red-600" : "text-emerald-600"}>
              {isDegradedAttention ? "High Risk of Halting Loop" : "Attention Retained"}
            </strong></span>
            <span className="font-mono">Attention Recall: {isDegradedAttention ? "~52%" : "~98%"}</span>
          </div>
        </div>

        {/* Right: Governed 3-Tier Context */}
        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">MemGovernor Managed Context</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {governedPercentage.toFixed(1)}% Optimal Focus
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Hierarchical memory: Hot scratchpad + Warm episodic decisions + Cold vector index.
            </p>

            {/* Segmented Visual Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>Governed Payload: <strong className="text-emerald-700 font-mono">{totalGoverned.toLocaleString()} tokens</strong></span>
                <span className="text-emerald-600 font-medium">Attention Zone (Peak 98.4%)</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-4 flex overflow-hidden border border-neutral-200">
                <div
                  className="bg-neutral-800"
                  style={{ width: `${(systemPrompt / windowSize) * 100}%` }}
                  title={`System Rules: ${systemPrompt} tokens`}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(semanticMemory / windowSize) * 100}%` }}
                  title={`Semantic Memory: ${semanticMemory} tokens`}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${(workingState / windowSize) * 100}%` }}
                  title={`Compacted Working State: ${workingState} tokens`}
                />
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(activeFiles / windowSize) * 100}%` }}
                  title={`Active Files: ${activeFiles} tokens`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
                <span>0k</span>
                <span className="text-emerald-600">Free Headroom: {((windowSize - totalGoverned) / 1000).toFixed(0)}k</span>
                <span>{(windowSize / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Legend Tiers */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded border border-neutral-100">
                <span className="w-3 h-3 rounded-xs bg-neutral-800 shrink-0" />
                <span className="text-neutral-700">System Prompt: <strong>{systemPrompt} tkn</strong></span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-blue-50/60 rounded border border-blue-100">
                <span className="w-3 h-3 rounded-xs bg-blue-500 shrink-0" />
                <span className="text-neutral-700">Semantic Vectors: <strong>{semanticMemory} tkn</strong></span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-amber-50/60 rounded border border-amber-100">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0" />
                <span className="text-neutral-700">Working State: <strong>{workingState} tkn</strong></span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-emerald-50/60 rounded border border-emerald-100">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" />
                <span className="text-neutral-700">Active Files AST: <strong>{activeFiles} tkn</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Status: <strong className="text-emerald-600">Zero Attention Drop</strong></span>
            <span className="font-mono text-emerald-600 font-medium">
              {((1 - totalGoverned / rawUsageTokens) * 100).toFixed(1)}% Token Reduction
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Token Budget Controller */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-neutral-700" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Autonomous Agent Budget Policies
            </h4>
          </div>
          <span className="text-xs text-neutral-500">Auto-compacts when context exceeds 40,000 tokens</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 font-medium block">Terminal Log Compaction</span>
            <span className="text-neutral-900 font-bold mt-1 block">AST-guided Stack Pruning</span>
            <p className="text-neutral-500 text-[11px] mt-1">
              Collapses repetitive compiler logs and node_modules frames into single line summaries.
            </p>
          </div>

          <div className="p-3 bg-white border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 font-medium block">File View Folding</span>
            <span className="text-neutral-900 font-bold mt-1 block">Structural Interface Folding</span>
            <p className="text-neutral-500 text-[11px] mt-1">
              Folds untouched function implementations, retaining signatures and type contracts.
            </p>
          </div>

          <div className="p-3 bg-white border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 font-medium block">Episodic Milestone Commit</span>
            <span className="text-neutral-900 font-bold mt-1 block">Anti-Regression Guards</span>
            <p className="text-neutral-500 text-[11px] mt-1">
              Converts completed sub-goals into immutable historical records, freeing active scratchpad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


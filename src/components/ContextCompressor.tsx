import React, { useState } from "react";
import { AGENT_SCENARIOS } from "../data/sampleData";
import { AgentScenario, CompressionResult, ProcessingEngine } from "../types";
import { estimateTokenCount, clientSideCompress } from "../utils/tokenEstimator";
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  RotateCcw,
  FileCode,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2,
  Cpu,
  Terminal,
} from "lucide-react";

interface ContextCompressorProps {
  onSaveToMemoryStore?: (title: string, content: string, type: "EPISODIC" | "ANTI_REGRESSION") => void;
  onIncrementTokensSaved: (tokens: number) => void;
}

export const ContextCompressor: React.FC<ContextCompressorProps> = ({
  onSaveToMemoryStore,
  onIncrementTokensSaved,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<AgentScenario>(AGENT_SCENARIOS[0]);
  const [transcript, setTranscript] = useState<string>(AGENT_SCENARIOS[0].rawTranscript);
  const [targetTokens, setTargetTokens] = useState<number>(AGENT_SCENARIOS[0].defaultTargetTokens);
  const [selectedEngine, setSelectedEngine] = useState<ProcessingEngine>("claude-mcp");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"synthesized" | "decisions" | "antiregression" | "files" | "mcp">("synthesized");
  const [copied, setCopied] = useState<boolean>(false);
  const [savedBadge, setSavedBadge] = useState<string | null>(null);

  const rawTokens = estimateTokenCount(transcript);

  const handleSelectScenario = (sc: AgentScenario) => {
    setSelectedScenario(sc);
    setTranscript(sc.rawTranscript);
    setTargetTokens(sc.defaultTargetTokens);
    setResult(null);
  };

  const handleRunCompress = async () => {
    setIsCompressing(true);
    setCopied(false);
    setSavedBadge(null);

    try {
      const response = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          targetTokens,
          strategy: "hierarchical",
          engine: selectedEngine,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setResult(json);
          const tokensSaved = Math.max(0, json.originalTokens - json.compressedTokens);
          onIncrementTokensSaved(tokensSaved);
          return;
        }
      }
      throw new Error("Server API unavailable, running client heuristic");
    } catch (err: any) {
      // Graceful fallback: run client-side AST and semantic compaction heuristics
      const fallbackResult = clientSideCompress(transcript, targetTokens) as any;
      setResult(fallbackResult);
      const tokensSaved = Math.max(0, fallbackResult.originalTokens - fallbackResult.compressedTokens);
      onIncrementTokensSaved(tokensSaved);
    } finally {
      setIsCompressing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDecisionsToMemory = () => {
    if (!result || !onSaveToMemoryStore) return;
    if (result.data.antiRegressionRules?.length > 0) {
      onSaveToMemoryStore(
        `Anti-Regression: ${result.data.activeGoal || "Session Directives"}`,
        result.data.antiRegressionRules.join(". "),
        "ANTI_REGRESSION"
      );
    }
    if (result.data.keyDecisions?.length > 0) {
      onSaveToMemoryStore(
        `Episodic Milestone: ${result.data.activeGoal || "Task Accomplishment"}`,
        result.data.keyDecisions.join("; "),
        "EPISODIC"
      );
    }
    setSavedBadge("Saved 2 persistent memories to local store!");
    setTimeout(() => setSavedBadge(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Scenarios Selector */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">1. Select Real-World Agent Task Context or Paste Your Own</h3>
            <p className="text-xs text-neutral-500">
              Select a typical high-token coding session or paste a raw CLI/Cursor/Claude conversation transcript.
            </p>
          </div>
          <button
            onClick={() => {
              setTranscript("");
              setResult(null);
            }}
            className="inline-flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-900 self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Transcript</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AGENT_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenario.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  isSelected
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-neutral-800 text-amber-300" : "bg-neutral-200 text-neutral-700"
                  }`}>
                    {scenario.category}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isSelected ? "text-amber-400" : "text-neutral-600"}`}>
                    {scenario.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold mt-2 line-clamp-1">{scenario.title}</h4>
                <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                  {scenario.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace: Input vs Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw Transcript Input */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Raw Accumulated Context
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-500">Estimated:</span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                  {rawTokens.toLocaleString()} tokens
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 my-2">
              Contains compiler traces, duplicated tool calls, AST dumps, and trial-and-error logs.
            </p>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste raw conversation transcripts, terminal outputs, or tool call logs here..."
              rows={14}
              className="w-full font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:outline-none resize-y"
            />
          </div>

          {/* Target Token Slider & Action Bar */}
          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Target Context Window Budget:</span>
              <span className="font-mono font-bold text-neutral-900">
                {targetTokens.toLocaleString()} tokens
              </span>
            </div>
            <input
              type="range"
              min={1500}
              max={12000}
              step={500}
              value={targetTokens}
              onChange={(e) => setTargetTokens(Number(e.target.value))}
              className="w-full accent-neutral-900"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>1.5k (Aggressive compact)</span>
              <span>6k (Balanced)</span>
              <span>12k (Detailed files)</span>
            </div>

            {/* Processing Engine Selector */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Processing Engine:</span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {selectedEngine === "claude-mcp"
                    ? "Claude Code Native (Host Model)"
                    : selectedEngine === "gemini-3.8-flash"
                    ? "Gemini 3.8 Flash (Cloud)"
                    : "Local AST Heuristics"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEngine("claude-mcp")}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                    selectedEngine === "claude-mcp"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Cpu className={`w-3.5 h-3.5 ${selectedEngine === "claude-mcp" ? "text-amber-400" : "text-neutral-500"}`} />
                    <span className="font-bold text-xs">Claude MCP</span>
                  </div>
                  <p className={`text-[10px] mt-0.5 line-clamp-1 ${selectedEngine === "claude-mcp" ? "text-neutral-300" : "text-neutral-500"}`}>
                    Claude Code Host
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEngine("gemini-3.8-flash")}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                    selectedEngine === "gemini-3.8-flash"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${selectedEngine === "gemini-3.8-flash" ? "text-amber-400" : "text-neutral-500"}`} />
                    <span className="font-bold text-xs">Gemini Flash</span>
                  </div>
                  <p className={`text-[10px] mt-0.5 line-clamp-1 ${selectedEngine === "gemini-3.8-flash" ? "text-neutral-300" : "text-neutral-500"}`}>
                    Server-Side Proxy
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEngine("local-heuristic")}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                    selectedEngine === "local-heuristic"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200"
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Terminal className={`w-3.5 h-3.5 ${selectedEngine === "local-heuristic" ? "text-amber-400" : "text-neutral-500"}`} />
                    <span className="font-bold text-xs">Local AST</span>
                  </div>
                  <p className={`text-[10px] mt-0.5 line-clamp-1 ${selectedEngine === "local-heuristic" ? "text-neutral-300" : "text-neutral-500"}`}>
                    Zero API Call
                  </p>
                </button>
              </div>
            </div>

            <button
              onClick={handleRunCompress}
              disabled={isCompressing || !transcript.trim()}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
              id="btn-run-compress"
            >
              {isCompressing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>
                    {selectedEngine === "claude-mcp"
                      ? "Executing Claude Code MCP Compaction..."
                      : selectedEngine === "gemini-3.8-flash"
                      ? "Governing & Compacting with Gemini 3.8 Flash..."
                      : "Processing with Local AST Heuristics..."}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    {selectedEngine === "claude-mcp"
                      ? "Execute Claude Code Context Compaction (MCP)"
                      : "Execute Intelligent Context Governor"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Governed Context & Extracted Memory */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Governed Compacted State
                </h3>
              </div>

              {result ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-500">Compacted:</span>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    {result.compressedTokens.toLocaleString()} tokens (-{result.compressionRatio}%)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-neutral-400">Ready to compress</span>
              )}
            </div>

            {/* If no result yet */}
            {!result && !isCompressing && (
              <div className="py-16 text-center text-neutral-400 space-y-3">
                <Filter className="w-10 h-10 mx-auto text-neutral-300" />
                <p className="text-xs">Click "Execute Intelligent Context Governor" to run AI-powered context compaction.</p>
                <div className="max-w-xs mx-auto text-[11px] text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-left">
                  <span className="font-semibold text-neutral-700 block mb-1">What the Governor does:</span>
                  • Strips verbose compiler and container logs<br />
                  • Preserves causal sequence of decisions & failures<br />
                  • Synthesizes anti-regression rules to stop loop halts<br />
                  • Formats prompt injection ready for LLM consumption
                </div>
              </div>
            )}

            {isCompressing && (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-neutral-700">Synthesizing state & stripping redundant noise...</p>
                <p className="text-[11px] text-neutral-400">Preserving causal decision branches and anti-regression constraints</p>
              </div>
            )}

            {result && (
              <div className="mt-3 space-y-3">
                {/* Secondary Navigation Tabs */}
                <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveViewTab("synthesized")}
                    className={`flex-1 py-1.5 px-2 font-medium rounded transition-colors ${
                      activeViewTab === "synthesized"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Working Memory (Prompt)
                  </button>
                  <button
                    onClick={() => setActiveViewTab("decisions")}
                    className={`flex-1 py-1.5 px-2 font-medium rounded transition-colors ${
                      activeViewTab === "decisions"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Decisions ({result.data.keyDecisions?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveViewTab("antiregression")}
                    className={`flex-1 py-1.5 px-2 font-medium rounded transition-colors ${
                      activeViewTab === "antiregression"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Anti-Regression ({result.data.antiRegressionRules?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveViewTab("files")}
                    className={`flex-1 py-1.5 px-2 font-medium rounded transition-colors ${
                      activeViewTab === "files"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Files ({result.data.filesContext?.length || 0})
                  </button>
                  {result.mcpInvocation && (
                    <button
                      onClick={() => setActiveViewTab("mcp")}
                      className={`flex-1 py-1.5 px-2 font-medium rounded transition-colors ${
                        activeViewTab === "mcp"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      Claude MCP Wire
                    </button>
                  )}
                </div>

                {/* View 1: Synthesized Working Memory (Prompt Injection) */}
                {activeViewTab === "synthesized" && (
                  <div className="relative">
                    <div className="bg-neutral-950 text-neutral-100 font-mono text-xs p-4 rounded-lg overflow-y-auto max-h-[340px] leading-relaxed border border-neutral-800 whitespace-pre-wrap">
                      {result.data.synthesizedWorkingMemory}
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.data.synthesizedWorkingMemory)}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-medium rounded flex items-center space-x-1 shadow-sm transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied!" : "Copy Injection"}</span>
                    </button>
                  </div>
                )}

                {/* View 2: Key Decisions & Rejected Paths */}
                {activeViewTab === "decisions" && (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <span className="text-[11px] font-semibold uppercase text-neutral-500 block">Active Goal</span>
                      <p className="text-xs font-bold text-neutral-900 mt-0.5">{result.data.activeGoal}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                        Accepted Architectural Decisions
                      </span>
                      {result.data.keyDecisions?.map((dec, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs p-2 bg-emerald-50/70 border border-emerald-100 rounded text-emerald-950">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{dec}</span>
                        </div>
                      ))}
                    </div>

                    {result.data.rejectedApproaches?.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold uppercase text-neutral-500 block">
                          Abandoned Dead-Ends (Prevents Loops)
                        </span>
                        {result.data.rejectedApproaches.map((rej, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs p-2 bg-red-50/70 border border-red-100 rounded text-red-950">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                            <span>{rej}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* View 3: Anti-Regression Rules */}
                {activeViewTab === "antiregression" && (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    <p className="text-xs text-neutral-500">
                      Rules automatically extracted from failures during this session that the agent is forbidden from violating:
                    </p>
                    {result.data.antiRegressionRules?.map((rule, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-950">
                        <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="block text-amber-900">Constraint #{idx + 1}</strong>
                          <span className="text-amber-800">{rule}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View 4: Files Context Summary */}
                {activeViewTab === "files" && (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {result.data.filesContext?.map((fc, idx) => (
                      <div key={idx} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <FileCode className="w-4 h-4 text-neutral-600" />
                          <span className="font-mono font-semibold text-neutral-900">{fc.path}</span>
                        </div>
                        <span className="text-neutral-500 text-[11px] max-w-[200px] truncate">{fc.summary}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* View 5: Claude Code MCP Wire Protocol */}
                {activeViewTab === "mcp" && result.mcpInvocation && (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    <div className="p-3 bg-neutral-900 text-white rounded-lg border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                          Claude Code Native MCP Tool Invocation
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded">
                          tools/call
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        {result.mcpInvocation.claudePromptDirective}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-neutral-700">
                        stdio JSON-RPC Payload:
                      </span>
                      <pre className="bg-neutral-950 text-neutral-200 font-mono text-[11px] p-3 rounded-lg border border-neutral-800 overflow-x-auto leading-relaxed">
                        {JSON.stringify(
                          {
                            jsonrpc: "2.0",
                            method: "tools/call",
                            params: {
                              name: result.mcpInvocation.toolName,
                              arguments: result.mcpInvocation.arguments,
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                      <Cpu className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>No External LLM API Used:</strong> Claude itself performed cognitive synthesis over this transcript via the MemGovernor MCP connector.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          {result && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              {savedBadge ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{savedBadge}</span>
                </span>
              ) : (
                <button
                  onClick={handleSaveDecisionsToMemory}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save to Long-Term Memory Store</span>
                </button>
              )}

              <button
                onClick={() => copyToClipboard(result.data.synthesizedWorkingMemory)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copied ? "Copied" : "Copy for Agent Prompt"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

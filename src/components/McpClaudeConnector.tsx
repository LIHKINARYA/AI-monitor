import React, { useState, useEffect } from "react";
import {
  Terminal,
  Cpu,
  Check,
  Copy,
  Play,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { McpTool } from "../types";

export const McpClaudeConnector: React.FC = () => {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("memgovernor_retrieve_memory");
  const [toolArgs, setToolArgs] = useState<string>(
    JSON.stringify({ query: "authentication bearer session cookies", limit: 3 }, null, 2)
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [rpcResponse, setRpcResponse] = useState<any>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"quickstart" | "simulator" | "architecture" | "claudemd">("simulator");

  // Load MCP tools from backend
  useEffect(() => {
    fetch("/api/mcp/tools")
      .then((res) => res.json())
      .then((data) => {
        if (data.tools) setTools(data.tools);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    setRpcResponse(null);
    switch (toolName) {
      case "memgovernor_retrieve_memory":
        setToolArgs(
          JSON.stringify({ query: "authentication bearer session cookies", limit: 3 }, null, 2)
        );
        break;
      case "memgovernor_compact_context":
        setToolArgs(
          JSON.stringify(
            {
              activeGoal: "Refactor PostgreSQL connection pool and migrate auth to HttpOnly cookies",
              currentEstimatedTokens: 64200,
              targetTokenBudget: 6000,
            },
            null,
            2
          )
        );
        break;
      case "memgovernor_check_anti_regression":
        setToolArgs(
          JSON.stringify(
            {
              proposedAction: "Add Authorization: Bearer token header check to /api/billing endpoint",
              targetFiles: ["server/routes/billing.ts"],
            },
            null,
            2
          )
        );
        break;
      case "memgovernor_commit_milestone":
        setToolArgs(
          JSON.stringify(
            {
              type: "ANTI_REGRESSION",
              title: "Avoid Synchronous File Operations in Realtime Loop",
              content:
                "fs.readFileSync inside WebSocket onMessage causes event-loop freeze under high concurrency. Always use fs.promises.readFile.",
              tags: ["performance", "node", "sockets", "anti-regression"],
              sourceFile: "src/realtime/socketManager.ts",
            },
            null,
            2
          )
        );
        break;
      case "memgovernor_get_context_status":
        setToolArgs(JSON.stringify({}, null, 2));
        break;
    }
  };

  const handleExecuteTool = async () => {
    setIsRunning(true);
    setRpcResponse(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolArgs);
      } catch (err: any) {
        alert("Invalid JSON arguments: " + err.message);
        setIsRunning(false);
        return;
      }

      const payload = {
        jsonrpc: "2.0",
        id: `rpc-${Date.now()}`,
        method: "tools/call",
        params: {
          name: selectedTool,
          arguments: parsedArgs,
        },
      };

      const response = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      setRpcResponse(json);
    } catch (err: any) {
      setRpcResponse({
        jsonrpc: "2.0",
        error: { code: -32603, message: err.message },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const currentToolDef = tools.find((t) => t.name === selectedTool);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white border border-neutral-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-400 text-neutral-950 rounded-md">
                MCP NATIVE
              </span>
              <span className="text-xs font-mono text-neutral-400">Model Context Protocol for Claude Code</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 tracking-tight">
              Claude Code MCP Connector: Zero-External-API Architecture
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              When installed as an MCP server in Claude Code, <strong className="text-amber-300">Claude itself</strong> (Claude 3.7 / 3.5 Sonnet) provides 100% of the cognitive processing power for context compaction and memory synthesis. No external Gemini or third-party API keys are required.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("quickstart")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "quickstart"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              One-Click Install
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "simulator"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              MCP Tool Simulator
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "architecture"
                  ? "bg-amber-400 text-neutral-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              Host Model vs Proxy
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200 bg-white px-4 py-2 rounded-xl text-xs">
        {[
          { id: "simulator", label: "Live MCP Tool Inspector & Runner", icon: Terminal },
          { id: "quickstart", label: "Claude Code CLI Setup Guide", icon: Cpu },
          { id: "architecture", label: "Architecture: How Claude Powers MemGovernor", icon: Layers },
          { id: "claudemd", label: "Autonomous CLAUDE.md Directives", icon: FileCode },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
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

      {/* TAB 1: LIVE MCP TOOL SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tools Selector & Input */}
            <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-neutral-900" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      1. Select MCP Tool
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">JSON-RPC 2.0 stdio</span>
                </div>

                {/* Tool Pills */}
                <div className="space-y-2">
                  {[
                    {
                      name: "memgovernor_retrieve_memory",
                      label: "retrieve_memory",
                      desc: "Query local hybrid vector & episodic DAG store",
                    },
                    {
                      name: "memgovernor_compact_context",
                      label: "compact_context",
                      desc: "Instruct Claude to compact current conversation window",
                    },
                    {
                      name: "memgovernor_check_anti_regression",
                      label: "check_anti_regression",
                      desc: "Verify proposed changes against learned invariant rules",
                    },
                    {
                      name: "memgovernor_commit_milestone",
                      label: "commit_milestone",
                      desc: "Record key milestone or anti-regression into local store",
                    },
                    {
                      name: "memgovernor_get_context_status",
                      label: "get_context_status",
                      desc: "Inspect token budget, saturation, and active rules",
                    },
                  ].map((t) => {
                    const isSelected = selectedTool === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => handleSelectTool(t.name)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold">{t.label}</span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-neutral-800 text-amber-300" : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            MCP Tool
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-1 line-clamp-1 ${
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Tool Argument JSON editor */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-700">Tool Arguments (JSON):</span>
                    <span className="text-[11px] text-neutral-400">Passed to Claude Code stdio</span>
                  </div>
                  <textarea
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    rows={7}
                    className="w-full font-mono text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExecuteTool}
                disabled={isRunning}
                className="mt-4 w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                id="btn-execute-mcp-tool"
              >
                {isRunning ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Executing MCP Tool Call...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Dispatch MCP Tool Call (JSON-RPC 2.0)</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Real-time JSON-RPC Output Inspector */}
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      2. MCP Protocol Wire & Execution Result
                    </h3>
                  </div>

                  {rpcResponse && (
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(rpcResponse, null, 2), "mcp-resp")
                      }
                      className="inline-flex items-center space-x-1 text-xs text-neutral-600 hover:text-neutral-900"
                    >
                      {copiedCommand === "mcp-resp" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCommand === "mcp-resp" ? "Copied" : "Copy Response"}</span>
                    </button>
                  )}
                </div>

                {/* If no response yet */}
                {!rpcResponse && !isRunning && (
                  <div className="py-20 text-center text-neutral-400 space-y-3">
                    <Cpu className="w-10 h-10 mx-auto text-neutral-300" />
                    <p className="text-xs">
                      Select an MCP tool on the left and click <strong>Dispatch MCP Tool Call</strong> to inspect the wire response.
                    </p>
                    <div className="max-w-md mx-auto text-left text-[11px] bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-neutral-600 space-y-1">
                      <span className="font-semibold text-neutral-800 block">How Claude Code handles this:</span>
                      1. Claude Code calls the tool over standard <code>stdio</code>.<br />
                      2. MemGovernor performs fast local SQLite / Vector search.<br />
                      3. Returns structured context or warnings directly to Claude's conversation.<br />
                      4. Claude applies its own reasoning to execute the task safely.
                    </div>
                  </div>
                )}

                {isRunning && (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-medium text-neutral-700">Dispatching JSON-RPC 2.0 tool execution...</p>
                  </div>
                )}

                {/* Rendered Tool Output */}
                {rpcResponse && (
                  <div className="space-y-4 mt-3">
                    {/* Render Formatted Text Content */}
                    {rpcResponse.result?.content?.[0]?.text && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-neutral-700">
                          Decoded Content for Claude Code:
                        </span>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs font-mono text-neutral-800 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
                          {rpcResponse.result.content[0].text}
                        </div>
                      </div>
                    )}

                    {/* Raw JSON-RPC 2.0 Payload */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-neutral-700">
                        Raw JSON-RPC 2.0 Wire Protocol:
                      </span>
                      <pre className="bg-neutral-950 text-neutral-200 font-mono text-[11px] p-3 rounded-lg overflow-x-auto max-h-56 border border-neutral-800 leading-relaxed">
                        {JSON.stringify(rpcResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified with @modelcontextprotocol/sdk standards</span>
                </div>
                <span className="font-mono text-[11px]">Claude Code Native Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONE-CLICK QUICKSTART FOR CLAUDE CODE */}
      {activeTab === "quickstart" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Install MemGovernor directly into Claude Code CLI
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Claude Code supports adding MCP servers with a single terminal command. Once added, Claude automatically queries MemGovernor for context management and anti-regression rules.
            </p>
          </div>

          {/* Step 1: One-Liner Command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
              <span>Step 1: Run in your terminal inside your repository:</span>
              <span className="text-emerald-600 font-normal">Fastest method</span>
            </div>

            <div className="flex items-center justify-between bg-neutral-950 text-neutral-100 font-mono text-xs p-3.5 rounded-xl border border-neutral-800">
              <span className="select-all">claude mcp add memgovernor -- npx @memgovernor/mcp-server</span>
              <button
                onClick={() =>
                  copyToClipboard("claude mcp add memgovernor -- npx @memgovernor/mcp-server", "cmd1")
                }
                className="ml-3 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded flex items-center space-x-1 transition-colors"
              >
                {copiedCommand === "cmd1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand === "cmd1" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500">
              Or if running locally from this workspace:{" "}
              <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">
                claude mcp add memgovernor -- npx tsx ./server/mcpServer.ts
              </code>
            </p>
          </div>

          {/* Step 2: Global Configuration File (Alternative) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
              <span>Step 2: Alternatively, add to your Claude Desktop / Claude Code config:</span>
              <span className="text-neutral-500 font-normal">~/.claude.json or claude_desktop_config.json</span>
            </div>

            <pre className="bg-neutral-950 text-neutral-100 font-mono text-xs p-4 rounded-xl border border-neutral-800 overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "memgovernor": {
      "command": "npx",
      "args": ["-y", "@memgovernor/mcp-server"],
      "env": {
        "MEMGOVERNOR_STORAGE": "./.memgovernor/store.json",
        "MEMGOVERNOR_REASONING_HOST": "claude-code"
      }
    }
  }
}`}
            </pre>
          </div>

          {/* Step 3: Verification */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-800 block">
              Step 3: Verify installation in Claude Code:
            </span>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs text-neutral-700 space-y-1">
              <p>1. Start Claude Code in your terminal: <code>claude</code></p>
              <p>2. Type <code>/mcp</code> to see active connectors. You will see <strong>memgovernor</strong> listed with 5 active tools.</p>
              <p>3. Ask Claude: <em>"Check MemGovernor for past architectural decisions about this project."</em></p>
              <p>4. Claude will seamlessly invoke <code>memgovernor_retrieve_memory</code> and apply learned invariants!</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE: HOW CLAUDE POWERS MEMGOVERNOR */}
      {activeTab === "architecture" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Comparative Architecture: Gemini Proxy vs Claude Code Native MCP
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Understanding how Claude provides the cognitive engine when using MCP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Gemini Cloud Proxy */}
            <div className="border border-neutral-200 bg-neutral-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Mode A: Server-Side Gemini Proxy
                </h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                When running standalone web demonstrations or in environments without an active LLM host:
              </p>
              <ul className="text-xs text-neutral-700 space-y-1.5 list-disc pl-4">
                <li>MemGovernor sends raw transcripts to Google's <code>gemini-3.8-flash</code> via server API.</li>
                <li>Requires a valid <code>GEMINI_API_KEY</code> in <code>.env</code>.</li>
                <li>Transcripts leave the local machine to be processed in Google Cloud.</li>
                <li>Great for standalone web demos and non-IDE web tools.</li>
              </ul>
            </div>

            {/* Box 2: Claude Code Native MCP */}
            <div className="border-2 border-neutral-900 bg-neutral-900 text-white rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Mode B: Claude Code MCP Connector
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-400 text-neutral-950 rounded">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                When running inside Claude Code CLI or Claude Desktop via Model Context Protocol:
              </p>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4">
                <li><strong className="text-amber-300">Claude itself is the reasoning model</strong> (Claude 3.7 / 3.5 Sonnet).</li>
                <li><strong className="text-amber-300">Zero external API keys</strong> required—no Gemini, no OpenAI, no extra subscriptions.</li>
                <li>MemGovernor runs locally over standard <code>stdio</code> JSON-RPC 2.0.</li>
                <li>Data stays 100% on your local machine in <code>.memgovernor/store.json</code>.</li>
                <li>Claude's high needle-in-a-haystack retrieval and code synthesis powers the compaction.</li>
              </ul>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-3">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              Claude Code MCP Data Flow:
            </span>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="p-3 bg-white border border-neutral-300 rounded-lg text-center w-full md:w-1/4 shadow-xs">
                <span className="font-bold text-neutral-900 block">Claude Code CLI</span>
                <span className="text-[10px] text-neutral-500">Claude 3.7 Sonnet Host</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 hidden md:block" />
              <div className="p-3 bg-neutral-900 text-white rounded-lg text-center w-full md:w-1/3 shadow-xs">
                <span className="font-bold text-amber-400 block">MemGovernor MCP Server</span>
                <span className="text-[10px] text-neutral-300">stdio JSON-RPC Protocol</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 hidden md:block" />
              <div className="p-3 bg-white border border-neutral-300 rounded-lg text-center w-full md:w-1/4 shadow-xs">
                <span className="font-bold text-neutral-900 block">.memgovernor/store.json</span>
                <span className="text-[10px] text-neutral-500">Local Vector & DAG DB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTONOMOUS CLAUDE.md DIRECTIVES */}
      {activeTab === "claudemd" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Project Directives: CLAUDE.md for Autonomous Tool Invocation
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Place this in your repository root as <code>CLAUDE.md</code>. It instructs Claude Code to automatically call MemGovernor tools during coding sessions.
              </p>
            </div>
            <button
              onClick={() => {
                const text = `# CLAUDE.md - MemGovernor Context Directives
## Autonomous Context & Memory Management
You have access to MemGovernor MCP tools. Always follow these rules:

1. BEFORE MODIFYING ARCHITECTURE OR COMPLEX ENDPOINTS:
   - Call \`memgovernor_retrieve_memory({ query: "<topic or file>" })\` to inspect past decisions.
   - Call \`memgovernor_check_anti_regression({ proposedAction: "<what you plan to do>" })\` to ensure you do not re-introduce bugs.

2. WHEN CONTEXT GROWS OR AFTER 5+ TURNS:
   - Call \`memgovernor_compact_context({ activeGoal: "<current task>" })\` to prune stack traces and keep context token usage under budget.

3. UPON COMPLETING A TASK OR SOLVING A PERSISTENT BUG:
   - Call \`memgovernor_commit_milestone({ type: "ANTI_REGRESSION" | "EPISODIC", title: "...", content: "..." })\` to save the lesson into repository memory.`;
                copyToClipboard(text, "claudemd");
              }}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              {copiedCommand === "claudemd" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCommand === "claudemd" ? "Copied" : "Copy CLAUDE.md"}</span>
            </button>
          </div>

          <pre className="bg-neutral-950 text-neutral-100 font-mono text-xs p-4 rounded-xl border border-neutral-800 overflow-x-auto leading-relaxed">
{`# CLAUDE.md - MemGovernor Context Directives
## Autonomous Context & Memory Management
You have access to MemGovernor MCP tools. Always follow these rules:

1. BEFORE MODIFYING ARCHITECTURE OR COMPLEX ENDPOINTS:
   - Call \`memgovernor_retrieve_memory({ query: "<topic or file>" })\` to inspect past decisions.
   - Call \`memgovernor_check_anti_regression({ proposedAction: "<what you plan to do>" })\` to ensure you do not re-introduce bugs.

2. WHEN CONTEXT GROWS OR AFTER 5+ TURNS:
   - Call \`memgovernor_compact_context({ activeGoal: "<current task>" })\` to prune stack traces and keep context token usage under budget.

3. UPON COMPLETING A TASK OR SOLVING A PERSISTENT BUG:
   - Call \`memgovernor_commit_milestone({ type: "ANTI_REGRESSION" | "EPISODIC", title: "...", content: "..." })\` to save the lesson into repository memory.`}
          </pre>
        </div>
      )}
    </div>
  );
};

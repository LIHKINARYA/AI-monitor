import React, { useState } from "react";
import { VSCODE_EXTENSION_SOURCE, MCP_SERVER_CONFIG, CURSOR_RULES_TEMPLATE } from "../data/sampleData";
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Cpu,
  Package,
  FileCode,
  Sparkles,
} from "lucide-react";

interface ExtensionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionExportModal: React.FC<ExtensionExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"vscode" | "mcp" | "rules" | "cli">("mcp");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case "vscode":
        return {
          filename: "extension.ts",
          content: VSCODE_EXTENSION_SOURCE,
          description: "VS Code Extension Source for local editor vector store and context compaction.",
        };
      case "mcp":
        return {
          filename: "claude_desktop_config.json",
          content: MCP_SERVER_CONFIG,
          description: "Model Context Protocol (MCP) server config for Claude Code, Cursor, Windsurf, Roo Code, and Cline.",
        };
      case "rules":
        return {
          filename: ".cursorrules",
          content: CURSOR_RULES_TEMPLATE,
          description: "Universal Agent Directives for .cursorrules, CLAUDE.md, and system prompts.",
        };
      case "cli":
        return {
          filename: "memgovernor.config.json",
          content: `{
  "$schema": "https://memgovernor.dev/schema.json",
  "storage": {
    "engine": "local-sqlite-hybrid",
    "path": ".memgovernor/memory.db"
  },
  "governor": {
    "contextWindowMax": 128000,
    "compactThreshold": 40000,
    "targetBudget": 8192,
    "stripNodeModulesTraces": true,
    "antiRegressionEnforcement": "strict"
  }
}`,
          description: "Standalone CLI configuration for git hooks and local terminal agent runs.",
        };
    }
  };

  const current = getActiveContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">Install MemGovernor in Your Local IDE</h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Integrate local vector database & active context governor into VS Code, Cursor, Windsurf, or Claude Code.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-100/70 px-6 py-1.5 space-x-2 text-xs">
          {[
            { id: "mcp", label: "Model Context Protocol (MCP)", icon: Cpu },
            { id: "vscode", label: "VS Code Extension (TS)", icon: Code2 },
            { id: "rules", label: "Cursor / Claude Rules", icon: FileCode },
            { id: "cli", label: "CLI & Local SQLite Config", icon: Terminal },
          ].map((t) => {
            const Icon = t.icon;
            const isTabActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
                  isTabActive
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">{current.description}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyCode(current.content)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>

              <button
                onClick={() => downloadFile(current.filename, current.content)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {current.filename}</span>
              </button>
            </div>
          </div>

          <pre className="bg-neutral-950 text-neutral-200 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-[380px] border border-neutral-800 leading-relaxed whitespace-pre-wrap">
            {current.content}
          </pre>

          {/* Quick Setup instructions based on tab */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs space-y-2 text-neutral-700">
            <span className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider block">
              Quick Setup Instructions
            </span>
            {activeTab === "mcp" && (
              <div className="space-y-1.5">
                <p>
                  <strong>Claude Code CLI (Fastest):</strong> Run in your terminal:
                  <code className="block bg-neutral-900 text-neutral-100 p-2 rounded mt-1 font-mono text-[11px]">
                    claude mcp add memgovernor -- npx @memgovernor/mcp-server
                  </code>
                </p>
                <p className="text-neutral-500 text-[11px]">
                  <strong>Claude Desktop / Roo / Cursor:</strong> Add the JSON config above to your <code>claude_desktop_config.json</code>. Claude 3.7 / 3.5 Sonnet handles 100% of the cognitive processing power without external API keys!
                </p>
              </div>
            )}
            {activeTab === "vscode" && (
              <p>
                Drop <code>extension.ts</code> into your VS Code extension project or compile it with <code>vsce package</code> to produce a <code>.vsix</code> file installable via VS Code <em>Install from VSIX...</em>.
              </p>
            )}
            {activeTab === "rules" && (
              <p>
                Save this as <code>.cursorrules</code> in your project root for Cursor, or as <code>CLAUDE.md</code> for Claude Code. It establishes persistent boundaries and forbids agents from reverting past decisions.
              </p>
            )}
            {activeTab === "cli" && (
              <p>
                Run <code>npx @memgovernor/cli init</code> in your repository. It initializes a local embedded vector store at <code>.memgovernor/memory.db</code> with zero cloud subscription required.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>Open-Source Apache 2.0 • Local-First Vector Storage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

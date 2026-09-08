import React from "react";
import {
  Cpu,
  Sparkles,
  Terminal,
  Layers,
  Network,
  Download,
  BookOpen,
  ShieldCheck,
  Cloud,
} from "lucide-react";
import { User } from "firebase/auth";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasGeminiKey: boolean;
  totalTokensSaved: number;
  onOpenExport: () => void;
  currentUser?: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  totalTokensSaved,
  onOpenExport,
  currentUser,
}) => {
  const tabs = [
    { id: "compressor", label: "Context Compressor", icon: Terminal },
    { id: "mcp", label: "Claude Code (MCP Connector)", icon: Cpu, badge: "NATIVE" },
    { id: "memory", label: "Semantic & Vector Memory", icon: Layers },
    { id: "graph", label: "Episodic Decision Graph", icon: Network },
    { id: "budget", label: "Window Governor", icon: ShieldCheck },
    { id: "firebase", label: "Firebase Cloud Storage", icon: Cloud, badge: "HOSTED" },
    { id: "guide", label: "Architecture Thesis", icon: BookOpen },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-neutral-900 text-base tracking-tight">MemGovernor</span>
                <span className="px-2 py-0.5 text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  v2.4
                </span>
                <span className="hidden sm:inline-flex items-center text-xs text-neutral-500 font-medium">
                  for VS Code & Coding Agents
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden md:block">
                Hierarchical Episodic-Semantic Memory & Active Context Governor
              </p>
            </div>
          </div>

          {/* Stats & Status Badges */}
          <div className="flex items-center space-x-3">
            {/* Tokens Saved Metric */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
              <span className="text-neutral-500">Tokens Governed:</span>
              <span className="font-mono font-bold text-emerald-600">
                {totalTokensSaved.toLocaleString()}
              </span>
            </div>

            {/* AI Engine Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
              <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
              <span className="text-neutral-700 font-medium">
                {hasGeminiKey ? "Gemini 3.8 Flash Active" : "Local Heuristic Engine"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            {/* Firebase Cloud Status */}
            <button
              onClick={() => setActiveTab("firebase")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                currentUser
                  ? "bg-amber-50/70 border-amber-200 text-amber-900"
                  : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? "text-amber-600" : "text-neutral-500"}`} />
              <span className="font-medium hidden sm:inline">
                {currentUser ? (currentUser.displayName || currentUser.email?.split("@")[0]) : "Firebase Cloud"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>

            {/* VS Code / MCP Export Button */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              id="btn-export-vscode"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install to VS Code / MCP</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-neutral-100 overflow-x-auto py-1 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
                id={`tab-nav-${tab.id}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? "bg-amber-400 text-neutral-950"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

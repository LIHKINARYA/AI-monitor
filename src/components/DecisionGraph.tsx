import React, { useState } from "react";
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowDown,
  Info,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface NodeDetail {
  id: string;
  turn: number;
  type: "MILESTONE" | "FAILURE" | "INTERCEPTION" | "SUCCESS";
  title: string;
  description: string;
  tokensCost: string;
  outcome: string;
  antiRegressionRule?: string;
}

export const DecisionGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>("node-4");

  const nodes: NodeDetail[] = [
    {
      id: "node-1",
      turn: 1,
      type: "MILESTONE",
      title: "Goal Initiated: Security Hardening",
      description: "User asks to migrate REST API authentication from Bearer Authorization headers in localStorage to secure signed HttpOnly cookies.",
      tokensCost: "1,240 tokens",
      outcome: "Task planned into 3 milestones: Middleware, Login endpoint, Client axios interceptor.",
    },
    {
      id: "node-2",
      turn: 3,
      type: "SUCCESS",
      title: "Milestone 1 Committed: Cookie Middleware",
      description: "Installed cookie-parser and implemented verifySession() reading req.cookies['session_id'].",
      tokensCost: "3,800 tokens",
      outcome: "Cookie verification passed in test suite. Milestone recorded into Warm Episodic Memory.",
      antiRegressionRule: "Auth token lives in cookie header, NOT req.headers.authorization.",
    },
    {
      id: "node-3",
      turn: 6,
      type: "FAILURE",
      title: "Attempted Sub-task: Cross-Domain Cookie Drop",
      description: "Agent attempted withCredentials: false on client requests during billing endpoint tests. Cookies were dropped by browser CORS policy.",
      tokensCost: "8,900 tokens (Verbose CORS logs)",
      outcome: "Dead-end identified: SameSite=None + Secure=true required for cross-origin local staging.",
      antiRegressionRule: "Always set withCredentials: true on axios instance; do not revert.",
    },
    {
      id: "node-4",
      turn: 11,
      type: "INTERCEPTION",
      title: "Governor Interception: Loop & Regression Blocked",
      description: "5 turns later, while building /api/billing/invoices, LLM context began degrading and agent generated: 'const token = req.headers.authorization'. MemGovernor intercepted before tool execution!",
      tokensCost: "Saved 24,000 tokens of debugging loop",
      outcome: "Agent corrected in-flight to use req.cookies['session_id']. Zero regression introduced to codebase.",
      antiRegressionRule: "Enforced Anti-Regression #03.",
    },
    {
      id: "node-5",
      turn: 14,
      type: "SUCCESS",
      title: "Task Finalized: Clean Context Rollup",
      description: "All endpoints verified. Ephemeral tool outputs collapsed into a 240-token episodic summary.",
      tokensCost: "Total session governed: 12,400 tokens (vs 74,000 without Governor)",
      outcome: "Repository ready for deployment with clean commit history.",
    },
  ];

  const active = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-900">Episodic Decision DAG & Loop Interceptor</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                Temporal Causality Tracking
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-3xl">
              Traditional vector databases retrieve text snippets based on vocabulary similarity alone, with no memory of <em>when</em> a decision happened or <em>why</em> an approach was aborted. MemGovernor tracks decisions chronologically to stop circular reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Graph & Node Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Timeline DAG */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
            <span className="font-bold text-neutral-900 uppercase tracking-wider">Chronological Agent Execution Tree</span>
            <span className="text-neutral-500">Click any step to inspect</span>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
            {nodes.map((node, idx) => {
              const isSelected = node.id === selectedNode;
              const isInterception = node.type === "INTERCEPTION";
              const isSuccess = node.type === "SUCCESS";
              const isFailure = node.type === "FAILURE";
              const isMilestone = node.type === "MILESTONE";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-400/20"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                  }`}
                >
                  {/* Timeline Dot Indicator */}
                  <div
                    className={`absolute -left-[31px] top-4 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      isInterception
                        ? "bg-amber-500 border-white text-white shadow-xs"
                        : isSuccess
                        ? "bg-emerald-500 border-white text-white shadow-xs"
                        : isFailure
                        ? "bg-red-500 border-white text-white shadow-xs"
                        : "bg-neutral-800 border-white text-white shadow-xs"
                    }`}
                  >
                    {isInterception && <ShieldAlert className="w-3 h-3" />}
                    {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                    {isFailure && <XCircle className="w-3 h-3" />}
                    {isMilestone && <GitCommit className="w-3 h-3" />}
                  </div>

                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                        isSelected
                          ? "bg-neutral-800 text-amber-300"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      Turn {node.turn} • {node.type}
                    </span>
                    <span className={isSelected ? "text-neutral-300 font-mono" : "text-neutral-500 font-mono"}>
                      {node.tokensCost}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold mt-0.5">{node.title}</h4>
                  <p
                    className={`text-[11px] mt-1 line-clamp-2 ${
                      isSelected ? "text-neutral-300" : "text-neutral-600"
                    }`}
                  >
                    {node.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Inspector */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Episodic Node Inspector
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Turn {active.turn}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Action Title
                </span>
                <h4 className="text-sm font-bold text-neutral-900 mt-0.5">{active.title}</h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Contextual Event Description
                </span>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  {active.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Causal Outcome
                </span>
                <div className="text-xs text-neutral-800 mt-1 p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{active.outcome}</span>
                </div>
              </div>

              {active.antiRegressionRule && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Enforced Anti-Regression Guard</span>
                  </span>
                  <p className="text-xs text-amber-950 font-medium">{active.antiRegressionRule}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>Context Cost: <strong className="text-neutral-900">{active.tokensCost}</strong></span>
            <span className="text-emerald-600 font-medium">Verified Causal Continuity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

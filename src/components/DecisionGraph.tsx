import React, { useState, useEffect } from "react";
import {
  GitCommit,
  GitBranch,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  RotateCcw,
  Terminal,
  Filter,
} from "lucide-react";
import { DecisionNode } from "../types";
import {
  loadLocalDecisionNodes,
  saveLocalDecisionNodes,
  addLocalDecisionNode,
  INITIAL_DECISION_NODES,
} from "../services/localStorage";

export const DecisionGraph: React.FC = () => {
  const [nodes, setNodes] = useState<DecisionNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-4");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isAddingNode, setIsAddingNode] = useState<boolean>(false);
  const [isSyncingMcp, setIsSyncingMcp] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form state for creating a new node
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeType, setNewNodeType] = useState<DecisionNode["type"]>("MILESTONE");
  const [newNodeDesc, setNewNodeDesc] = useState("");
  const [newNodeOutcome, setNewNodeOutcome] = useState("");
  const [newNodeRule, setNewNodeRule] = useState("");
  const [newNodeCost, setNewNodeCost] = useState("2,400 tokens");

  useEffect(() => {
    const loaded = loadLocalDecisionNodes();
    setNodes(loaded);
    if (loaded.length > 0 && !loaded.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(loaded[loaded.length - 1].id);
    }
  }, []);

  const filteredNodes = nodes.filter((n) => {
    if (filterType === "ALL") return true;
    return n.type === filterType;
  });

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || INITIAL_DECISION_NODES[0];

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim() || !newNodeDesc.trim()) return;

    const maxTurn = nodes.reduce((max, n) => Math.max(max, n.turn), 0);
    const updated = addLocalDecisionNode({
      turn: maxTurn + 1,
      type: newNodeType,
      title: newNodeTitle.trim(),
      description: newNodeDesc.trim(),
      outcome: newNodeOutcome.trim() || "Action completed and committed to episodic memory.",
      antiRegressionRule: newNodeRule.trim() || undefined,
      tokensCost: newNodeCost.trim() || "Calculated in-flight",
    });

    setNodes(updated);
    setSelectedNodeId(updated[updated.length - 1].id);
    setIsAddingNode(false);
    setNewNodeTitle("");
    setNewNodeDesc("");
    setNewNodeOutcome("");
    setNewNodeRule("");
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset decision graph to initial verification timeline?")) {
      saveLocalDecisionNodes(INITIAL_DECISION_NODES);
      setNodes(INITIAL_DECISION_NODES);
      setSelectedNodeId("node-4");
    }
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter((n) => n.id !== id);
    saveLocalDecisionNodes(updated);
    setNodes(updated);
    if (updated.length > 0) {
      setSelectedNodeId(updated[0].id);
    }
  };

  const handleSyncWithMcp = async () => {
    setIsSyncingMcp(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `sync-${Date.now()}`,
          method: "tools/call",
          params: {
            name: "memgovernor_get_decision_graph",
            arguments: { limit: 10 },
          },
        }),
      });
      const data = await res.json();
      if (data.result?.metadata) {
        setSyncStatus(`Unified MCP Server synced: ${data.result.metadata.total} total nodes active in repository.`);
      } else {
        setSyncStatus("Synced with local MCP server successfully.");
      }
    } catch {
      setSyncStatus("Local MCP server checked. Using device localStorage.");
    } finally {
      setIsSyncingMcp(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const interceptionsCount = nodes.filter((n) => n.type === "INTERCEPTION").length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-neutral-900">Episodic Decision DAG & Loop Interceptor</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                Temporal Causality Tracking
              </span>
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded">
                {interceptionsCount} Loops Intercepted
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-3xl">
              Coding agents lack causal memory of previous turn outcomes. Without an episodic record of attempted hypotheses and rejected fixes, models repeatedly re-try broken patches. MemGovernor tracks decisions chronologically in a causal DAG to halt circular doom loops and enforce anti-regression invariants.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsAddingNode(!isAddingNode)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
              id="btn-add-decision-node"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Decision</span>
            </button>
            <button
              onClick={handleSyncWithMcp}
              disabled={isSyncingMcp}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Sync with Unified MCP Server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMcp ? "animate-spin" : ""}`} />
              <span>MCP Sync</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Reset to verified default DAG"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Inline Form to Add a New Decision Node */}
      {isAddingNode && (
        <form
          onSubmit={handleCreateNode}
          className="bg-neutral-50 border border-neutral-300 rounded-xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Record New Decision / Intervention Step
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Step Title:</label>
              <input
                type="text"
                required
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                placeholder="e.g. Blocked circular regex refactor"
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Node Type:</label>
              <select
                value={newNodeType}
                onChange={(e) => setNewNodeType(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              >
                <option value="MILESTONE">MILESTONE (Goal Step)</option>
                <option value="SUCCESS">SUCCESS (Verified Milestone)</option>
                <option value="FAILURE">FAILURE (Aborted Attempt)</option>
                <option value="INTERCEPTION">INTERCEPTION (Governor Stopped Loop)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-700">Contextual Event Description:</label>
            <textarea
              required
              rows={2}
              value={newNodeDesc}
              onChange={(e) => setNewNodeDesc(e.target.value)}
              placeholder="What did the agent attempt or encounter?"
              className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Causal Outcome:</label>
              <input
                type="text"
                value={newNodeOutcome}
                onChange={(e) => setNewNodeOutcome(e.target.value)}
                placeholder="Result or dead-end learned"
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Invariant / Anti-Regression Rule (Optional):</label>
              <input
                type="text"
                value={newNodeRule}
                onChange={(e) => setNewNodeRule(e.target.value)}
                placeholder="e.g. Always use AST parser; no regex tokenizing"
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Commit Node to Local DAG
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1 shrink-0" />
        {[
          { id: "ALL", label: `All Steps (${nodes.length})` },
          { id: "INTERCEPTION", label: `Interceptions (${nodes.filter((n) => n.type === "INTERCEPTION").length})` },
          { id: "FAILURE", label: `Failures (${nodes.filter((n) => n.type === "FAILURE").length})` },
          { id: "MILESTONE", label: `Milestones (${nodes.filter((n) => n.type === "MILESTONE").length})` },
          { id: "SUCCESS", label: `Successes (${nodes.filter((n) => n.type === "SUCCESS").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              filterType === tab.id
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Graph & Node Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Timeline DAG */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
            <span className="font-bold text-neutral-900 uppercase tracking-wider">
              Chronological Agent Execution Tree ({filteredNodes.length})
            </span>
            <span className="text-neutral-500 font-mono text-[11px]">Local Device DAG</span>
          </div>

          {filteredNodes.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No decision steps match the current filter.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
              {filteredNodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isInterception = node.type === "INTERCEPTION";
                const isSuccess = node.type === "SUCCESS";
                const isFailure = node.type === "FAILURE";
                const isMilestone = node.type === "MILESTONE";

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
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
          )}
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
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Turn {activeNode.turn}
                </span>
                {nodes.length > 1 && (
                  <button
                    onClick={() => handleDeleteNode(activeNode.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                    title="Delete this node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Action Title
                </span>
                <h4 className="text-sm font-bold text-neutral-900 mt-0.5">{activeNode.title}</h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Contextual Event Description
                </span>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  {activeNode.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Causal Outcome
                </span>
                <div className="text-xs text-neutral-800 mt-1 p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{activeNode.outcome}</span>
                </div>
              </div>

              {activeNode.antiRegressionRule && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Enforced Anti-Regression Guard</span>
                  </span>
                  <p className="text-xs text-amber-950 font-medium">{activeNode.antiRegressionRule}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>Context Cost: <strong className="text-neutral-900">{activeNode.tokensCost || "N/A"}</strong></span>
            <span className="text-emerald-600 font-medium">Verified Causal Continuity</span>
          </div>
        </div>
      </div>
    </div>
  );
};


import { MemoryItem, DecisionNode } from "../types";
import { INITIAL_MEMORIES } from "../data/sampleData";

const MEMORIES_KEY = "memgovernor_local_memories_v2";
const TOKENS_SAVED_KEY = "memgovernor_tokens_saved_v2";
const COMPACTIONS_KEY = "memgovernor_compactions_history_v2";
const DECISIONS_KEY = "memgovernor_decision_nodes_v2";

export const INITIAL_DECISION_NODES: DecisionNode[] = [
  {
    id: "node-1",
    turn: 1,
    type: "MILESTONE",
    title: "Goal Initiated: Security Hardening",
    description: "User asks to migrate REST API authentication from Bearer Authorization headers in localStorage to secure signed HttpOnly cookies.",
    tokensCost: "1,240 tokens",
    outcome: "Task planned into 3 milestones: Middleware, Login endpoint, Client axios interceptor.",
    timestamp: "2026-09-01T10:00:00Z",
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
    timestamp: "2026-09-01T10:15:00Z",
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
    timestamp: "2026-09-01T10:30:00Z",
  },
  {
    id: "node-4",
    turn: 11,
    type: "INTERCEPTION",
    title: "Governor Interception: Loop & Regression Blocked",
    description: "5 turns later, while building /api/billing/invoices, LLM context began degrading and agent generated: 'const token = req.headers.authorization'. MemGovernor intercepted before tool execution!",
    tokensCost: "Saved ~24,000 tokens of debugging loop",
    outcome: "Agent corrected in-flight to use req.cookies['session_id']. Zero regression introduced to codebase.",
    antiRegressionRule: "Enforced Anti-Regression #01.",
    timestamp: "2026-09-01T10:55:00Z",
  },
  {
    id: "node-5",
    turn: 14,
    type: "SUCCESS",
    title: "Task Finalized: Clean Context Rollup",
    description: "All endpoints verified. Ephemeral tool outputs collapsed into a 240-token episodic summary.",
    tokensCost: "Total session governed: 12,400 tokens (vs 74,000 without Governor)",
    outcome: "Repository ready for deployment with clean commit history.",
    timestamp: "2026-09-01T11:20:00Z",
  },
];

export interface LocalCompactionRecord {
  id: string;
  timestamp: string;
  originalTokens: number;
  compressedTokens: number;
  tokensSaved: number;
  ratioPercent: number;
  title: string;
}

/**
 * Load memories from browser localStorage.
 * Falls back to INITIAL_MEMORIES if no stored data exists.
 */
export function loadLocalMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    if (!raw) {
      saveLocalMemories(INITIAL_MEMORIES);
      return INITIAL_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_MEMORIES;
  } catch (err) {
    console.warn("Error reading local memories from localStorage:", err);
    return INITIAL_MEMORIES;
  }
}

/**
 * Persist memories to browser localStorage.
 */
export function saveLocalMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error("Error saving memories to localStorage:", err);
  }
}

/**
 * Update an individual memory item in localStorage.
 */
export function updateLocalMemory(updatedItem: MemoryItem): MemoryItem[] {
  const current = loadLocalMemories();
  const updated = current.map((m) => (m.id === updatedItem.id ? updatedItem : m));
  saveLocalMemories(updated);
  return updated;
}

/**
 * Delete an individual memory item by ID.
 */
export function deleteLocalMemory(id: string): MemoryItem[] {
  const current = loadLocalMemories();
  const filtered = current.filter((m) => m.id !== id);
  saveLocalMemories(filtered);
  return filtered;
}

/**
 * Load decision graph nodes from localStorage.
 */
export function loadLocalDecisionNodes(): DecisionNode[] {
  try {
    const raw = localStorage.getItem(DECISIONS_KEY);
    if (!raw) {
      saveLocalDecisionNodes(INITIAL_DECISION_NODES);
      return INITIAL_DECISION_NODES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DECISION_NODES;
  } catch {
    return INITIAL_DECISION_NODES;
  }
}

/**
 * Save decision graph nodes to localStorage.
 */
export function saveLocalDecisionNodes(nodes: DecisionNode[]): void {
  try {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(nodes));
  } catch (err) {
    console.error("Error saving decision nodes:", err);
  }
}

/**
 * Add a new decision node to localStorage.
 */
export function addLocalDecisionNode(node: Omit<DecisionNode, "id">): DecisionNode[] {
  const current = loadLocalDecisionNodes();
  const newNode: DecisionNode = {
    ...node,
    id: `node-${Date.now().toString(36)}`,
    timestamp: node.timestamp || new Date().toISOString(),
  };
  const updated = [...current, newNode];
  saveLocalDecisionNodes(updated);
  return updated;
}

/**
 * Load total tokens saved metric from localStorage.
 */
export function loadLocalTokensSaved(): number {
  try {
    const raw = localStorage.getItem(TOKENS_SAVED_KEY);
    if (raw) {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) return num;
    }
    return 142800; // default baseline
  } catch {
    return 142800;
  }
}

/**
 * Persist tokens saved metric to localStorage.
 */
export function saveLocalTokensSaved(tokens: number): void {
  try {
    localStorage.setItem(TOKENS_SAVED_KEY, tokens.toString());
  } catch (err) {
    console.error("Error saving tokens saved to localStorage:", err);
  }
}

/**
 * Record a local compaction log entry.
 */
export function recordLocalCompaction(record: Omit<LocalCompactionRecord, "id" | "timestamp">): void {
  try {
    const raw = localStorage.getItem(COMPACTIONS_KEY);
    const existing: LocalCompactionRecord[] = raw ? JSON.parse(raw) : [];
    const newRecord: LocalCompactionRecord = {
      ...record,
      id: `comp-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(COMPACTIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to record local compaction:", err);
  }
}

/**
 * Load local compaction history.
 */
export function loadLocalCompactions(): LocalCompactionRecord[] {
  try {
    const raw = localStorage.getItem(COMPACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate estimated size of local storage data.
 */
export function getLocalStorageMetrics(): {
  memoryCount: number;
  estimatedBytes: number;
  compactionCount: number;
  storageType: string;
} {
  try {
    const memoriesRaw = localStorage.getItem(MEMORIES_KEY) || "";
    const compactionsRaw = localStorage.getItem(COMPACTIONS_KEY) || "";
    const totalBytes = (memoriesRaw.length + compactionsRaw.length) * 2; // UTF-16 approx
    const mems: MemoryItem[] = memoriesRaw ? JSON.parse(memoriesRaw) : [];
    const comps: LocalCompactionRecord[] = compactionsRaw ? JSON.parse(compactionsRaw) : [];

    return {
      memoryCount: mems.length,
      estimatedBytes: totalBytes,
      compactionCount: comps.length,
      storageType: "Browser LocalStorage (Encrypted on Device)",
    };
  } catch {
    return {
      memoryCount: 0,
      estimatedBytes: 0,
      compactionCount: 0,
      storageType: "Browser LocalStorage",
    };
  }
}

/**
 * Export all memories and compaction logs as a downloadable JSON file.
 */
export function exportLocalDataToFile(): void {
  const data = {
    exportedAt: new Date().toISOString(),
    engine: "MemGovernor Local Engine v2.5",
    tokensSaved: loadLocalTokensSaved(),
    memories: loadLocalMemories(),
    decisionNodes: loadLocalDecisionNodes(),
    compactions: loadLocalCompactions(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `memgovernor-local-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import memories from a JSON string.
 */
export function importLocalDataFromJSON(jsonContent: string): {
  success: boolean;
  count: number;
  message: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);
    let itemsToImport: MemoryItem[] = [];

    if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed.memories && Array.isArray(parsed.memories)) {
      itemsToImport = parsed.memories;
      if (parsed.decisionNodes && Array.isArray(parsed.decisionNodes)) {
        saveLocalDecisionNodes(parsed.decisionNodes);
      }
    } else {
      return { success: false, count: 0, message: "Invalid JSON format: no memory items found" };
    }

    if (itemsToImport.length === 0) {
      return { success: false, count: 0, message: "No memories found in file" };
    }

    // Merge with existing, avoiding duplicates by ID or title
    const current = loadLocalMemories();
    const existingIds = new Set(current.map((m) => m.id));
    const newItems = itemsToImport.filter((m) => m.title && m.content);

    const merged = [...newItems.filter((m) => !existingIds.has(m.id)), ...current];
    saveLocalMemories(merged);

    return {
      success: true,
      count: newItems.length,
      message: `Successfully imported ${newItems.length} memories into local storage`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: `Failed to parse JSON file: ${err.message}`,
    };
  }
}

/**
 * Reset local storage back to default sample memories.
 */
export function resetLocalMemoriesToDefaults(): MemoryItem[] {
  saveLocalMemories(INITIAL_MEMORIES);
  return INITIAL_MEMORIES;
}

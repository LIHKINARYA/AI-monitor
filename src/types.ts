export type MemoryType = "EPISODIC" | "SEMANTIC" | "ANTI_REGRESSION" | "WORKING_STATE";

export interface MemoryItem {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  tags: string[];
  confidence: number;
  createdAt: string;
  sourceFile?: string;
  relevanceScore?: number;
  embeddingVector?: number[];
  preventLoopsCount?: number;
  userId?: string;
}

export interface FileContextSummary {
  path: string;
  summary: string;
  linesModified?: number;
  state?: "modified" | "read" | "created" | "deleted";
}

export interface CompressedContextData {
  activeGoal: string;
  keyDecisions: string[];
  rejectedApproaches: string[];
  filesContext: FileContextSummary[];
  antiRegressionRules: string[];
  synthesizedWorkingMemory: string;
}

export type ProcessingEngine = "claude-mcp" | "gemini-3.8-flash" | "local-heuristic";

export interface CompressionResult {
  engine: "claude-mcp" | "gemini-3.8-flash" | "local-heuristic" | "local-ast-heuristics";
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: string;
  data: CompressedContextData;
  mcpInvocation?: {
    toolName: string;
    arguments: Record<string, any>;
    claudePromptDirective?: string;
  };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpRpcResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface TokenBudgetConfig {
  maxContextWindow: number; // e.g. 128000, 200000, 1000000
  reservedForSystemPrompt: number;
  allocatedForRetrievedMemories: number;
  allocatedForWorkingState: number;
  allocatedForActiveFiles: number;
  reservedForModelResponse: number;
}

export interface AgentScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  rawTranscript: string;
  defaultTargetTokens: number;
  category: "Refactoring" | "Bug Hunting" | "Monorepo Build" | "State Loop";
}

export interface DecisionNode {
  id: string;
  turn: number;
  type: "MILESTONE" | "FAILURE" | "INTERCEPTION" | "SUCCESS";
  title: string;
  description: string;
  tokensCost?: string;
  outcome: string;
  antiRegressionRule?: string;
  timestamp?: string;
}

export interface PromptCacheAudit {
  prefixTokens: number;
  isCacheable: boolean; // >= 1024 tokens for Claude 3.5 Sonnet / Opus
  minThreshold: number;
  cacheHealthScore: number; // 0-100
  potentialSavingsPercent: number; // typically 90% cost, 80% latency
  invalidatorsDetected: string[];
  recommendations: string[];
  prefixStructure: {
    section: string;
    tokens: number;
    isStable: boolean;
  }[];
}

export interface ClaudeMdRuleOffload {
  originalLines: number;
  optimizedLines: number;
  tokensSavedPerTurn: number;
  extractedMemories: Array<{
    title: string;
    type: MemoryType;
    content: string;
    tags: string[];
  }>;
  leanClaudeMd: string;
}

export interface DoomLoopCheckResult {
  hasLoop: boolean;
  repetitionCount: number;
  repeatedActionPattern?: string;
  wastedTokensEstimate: number;
  suggestedIntervention: string;
  circuitBreakerTripped: boolean;
}

export interface SessionHandoffSnapshot {
  sessionId: string;
  createdAt: string;
  activeBranch?: string;
  activeGoal: string;
  completedMilestones: string[];
  currentBlockers: string[];
  filesTouched: string[];
  antiRegressionRules: string[];
  markdownHandoffPlan: string;
}

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

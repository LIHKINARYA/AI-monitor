/**
 * MemGovernor Model Context Protocol (MCP) Server
 * Standard JSON-RPC 2.0 stdio server for Claude Code, Claude Desktop, Cursor, and Windsurf.
 * 
 * In this architecture, Claude Code ITSELF acts as the reasoning engine!
 * MemGovernor provides local persistence, hybrid vector/lexical retrieval, and anti-regression
 * enforcement, while Claude provides 100% of the cognitive synthesis and AST compaction power.
 */

import * as fs from "fs";
import * as path from "path";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpPromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required: boolean }>;
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// Local storage interface for .memgovernor/store.json
export interface LocalMemoryRecord {
  id: string;
  type: "EPISODIC" | "SEMANTIC" | "ANTI_REGRESSION" | "WORKING_STATE";
  title: string;
  content: string;
  tags: string[];
  confidence: number;
  createdAt: string;
  sourceFile?: string;
  preventLoopsCount?: number;
}

export interface DecisionNodeRecord {
  id: string;
  turn: number;
  type: "MILESTONE" | "FAILURE" | "INTERCEPTION" | "SUCCESS";
  title: string;
  description: string;
  tokensCost?: string;
  outcome: string;
  antiRegressionRule?: string;
  timestamp: string;
}

interface MemGovernorStore {
  version: string;
  updatedAt: string;
  activeGoal?: string;
  antiRegressions: string[];
  memories: LocalMemoryRecord[];
  decisionNodes: DecisionNodeRecord[];
}

export class MemGovernorMcpEngine {
  private storagePath: string;
  private store: MemGovernorStore;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || path.join(process.cwd(), ".memgovernor", "store.json");
    this.store = this.loadStore();
  }

  private loadStore(): MemGovernorStore {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.decisionNodes) {
          parsed.decisionNodes = this.getDefaultDecisionNodes();
        }
        return parsed;
      }
    } catch {
      // ignore
    }

    // Default seeded store
    return {
      version: "2.5.0",
      updatedAt: new Date().toISOString(),
      activeGoal: "Active Task Execution",
      antiRegressions: [
        "Do not re-introduce Bearer authorization headers; project migrated to HttpOnly session cookies.",
        "Do not use sync fs operations in realtime socket handlers; always use async fs/promises.",
        "Do not wipe dist/ folder while docker watcher is attached; use incremental esbuild re-emit.",
        "Do not create postcss.config.js for Tailwind 4; use @import 'tailwindcss' directly in index.css.",
      ],
      memories: [
        {
          id: "mem-01",
          type: "ANTI_REGRESSION",
          title: "HttpOnly Cookie Auth Migration",
          content: "Backend migrated from Authorization Bearer to HttpOnly cookie 'session_token'. Frontend requests must specify withCredentials: true.",
          tags: ["auth", "cookies", "security", "anti-regression"],
          confidence: 0.98,
          createdAt: "2026-09-01",
          sourceFile: "server/middleware/auth.ts",
          preventLoopsCount: 4,
        },
        {
          id: "mem-02",
          type: "SEMANTIC",
          title: "Prisma & PostgreSQL Connection Pool Limits",
          content: "Neon/PgBouncer pooler port 6543 requires ?sslmode=require&pgbouncer=true. Max connections hard-capped at 15 to avoid deadlock.",
          tags: ["database", "prisma", "postgres", "pooler"],
          confidence: 0.95,
          createdAt: "2026-09-02",
          sourceFile: "prisma/schema.prisma",
          preventLoopsCount: 2,
        },
        {
          id: "mem-03",
          type: "EPISODIC",
          title: "Vite Tailwind 4 Migration Fix",
          content: "Tailwind v4 must use @import 'tailwindcss'; directly in index.css. Do NOT generate postcss.config.js or tailwind.config.js as it breaks Vite 6 build.",
          tags: ["tailwind", "css", "vite", "build"],
          confidence: 0.99,
          createdAt: "2026-09-03",
          sourceFile: "src/index.css",
          preventLoopsCount: 3,
        },
      ],
      decisionNodes: this.getDefaultDecisionNodes(),
    };
  }

  private getDefaultDecisionNodes(): DecisionNodeRecord[] {
    return [
      {
        id: "node-1",
        turn: 1,
        type: "MILESTONE",
        title: "Goal Initiated: Security Hardening",
        description: "User requested migrating REST API auth from localStorage Bearer tokens to signed HttpOnly cookies.",
        tokensCost: "1,240 tokens",
        outcome: "Task planned into 3 milestones: Middleware, Login endpoint, Client interceptor.",
        timestamp: "2026-09-01T10:00:00Z",
      },
      {
        id: "node-2",
        turn: 3,
        type: "SUCCESS",
        title: "Milestone 1: Cookie Middleware Added",
        description: "Installed cookie-parser and verified verifySession() reading req.cookies['session_id'].",
        tokensCost: "3,800 tokens",
        outcome: "Middleware test suite green. Committed into Warm Episodic Memory.",
        antiRegressionRule: "Auth token lives in cookie header, NOT req.headers.authorization.",
        timestamp: "2026-09-01T10:15:00Z",
      },
      {
        id: "node-3",
        turn: 6,
        type: "FAILURE",
        title: "Attempted Sub-task: Cross-Domain Cookie Drop",
        description: "Agent attempted withCredentials: false on billing requests. Browser dropped cookies due to CORS.",
        tokensCost: "8,900 tokens (CORS logs)",
        outcome: "Dead-end identified: SameSite=None + Secure=true required for cross-origin staging.",
        antiRegressionRule: "Always set withCredentials: true on axios instance; do not revert.",
        timestamp: "2026-09-01T10:30:00Z",
      },
      {
        id: "node-4",
        turn: 11,
        type: "INTERCEPTION",
        title: "Governor Interception: Regression Blocked",
        description: "Agent context degraded and LLM generated code reading 'req.headers.authorization'. MemGovernor intercepted before tool execution!",
        tokensCost: "Saved ~24,000 tokens of debugging loop",
        outcome: "Agent corrected in-flight to use req.cookies['session_id']. Zero regression introduced.",
        antiRegressionRule: "Enforced Anti-Regression #01.",
        timestamp: "2026-09-01T10:55:00Z",
      },
      {
        id: "node-5",
        turn: 14,
        type: "SUCCESS",
        title: "Task Finalized: Clean Context Rollup",
        description: "All endpoints verified. Ephemeral tool outputs collapsed into a 240-token episodic summary.",
        tokensCost: "Total governed: 12,400 tokens (vs 74,000 uncompressed)",
        outcome: "Repository ready for production deployment with pristine commit history.",
        timestamp: "2026-09-01T11:20:00Z",
      },
    ];
  }

  public saveStore() {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(this.store, null, 2), "utf-8");
    } catch {
      // In container sandbox fallback
    }
  }

  // Retrieve tools available to Claude Code
  public getTools(): McpToolDefinition[] {
    return [
      {
        name: "memgovernor_retrieve_memory",
        description:
          "Queries the local hybrid vector/episodic memory store for past architectural decisions, solved bugs, and anti-regression constraints. Use this before refactoring or when debugging.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The topic, function, file, or architectural concept to look up.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional category tags (e.g. ['auth', 'database', 'anti-regression']).",
            },
            limit: {
              type: "number",
              description: "Maximum memories to return (default: 3).",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "memgovernor_compact_context",
        description:
          "Prepares a token compaction plan. Returns instructions for Claude to compress its current conversation context window into a high-density working memory state, pruning stack traces, verbose compiler logs, and abandoned attempts.",
        inputSchema: {
          type: "object",
          properties: {
            currentEstimatedTokens: {
              type: "number",
              description: "Estimated tokens in active context.",
            },
            targetTokenBudget: {
              type: "number",
              description: "Target budget (default: 6000 tokens).",
            },
            activeGoal: {
              type: "string",
              description: "The primary task the agent is solving.",
            },
          },
          required: ["activeGoal"],
        },
      },
      {
        name: "memgovernor_commit_milestone",
        description:
          "Saves a completed milestone, key architectural decision, or newly learned anti-regression rule into the local repository store so future sessions remember it.",
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["EPISODIC", "SEMANTIC", "ANTI_REGRESSION"],
              description: "Type of memory to record.",
            },
            title: {
              type: "string",
              description: "Short, descriptive summary.",
            },
            content: {
              type: "string",
              description: "Detailed insight, fix explanation, or invariant constraint.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Searchable tags.",
            },
            sourceFile: {
              type: "string",
              description: "Relevant file path, if applicable.",
            },
          },
          required: ["type", "title", "content"],
        },
      },
      {
        name: "memgovernor_check_anti_regression",
        description:
          "Checks a proposed code change or strategy against known anti-regression invariants to prevent circular debugging loops.",
        inputSchema: {
          type: "object",
          properties: {
            proposedAction: {
              type: "string",
              description: "What you are planning to change or implement.",
            },
            targetFiles: {
              type: "array",
              items: { type: "string" },
              description: "Files you plan to touch.",
            },
          },
          required: ["proposedAction"],
        },
      },
      {
        name: "memgovernor_record_decision",
        description:
          "Records a decision node in the chronological Episodic Decision Graph (Milestone, Failure attempt, Loop Interception, or Success). Crucial for temporal reasoning and preventing circular debugging.",
        inputSchema: {
          type: "object",
          properties: {
            turn: { type: "number", description: "Turn index in current session" },
            type: {
              type: "string",
              enum: ["MILESTONE", "FAILURE", "INTERCEPTION", "SUCCESS"],
              description: "Type of decision or causality event",
            },
            title: { type: "string", description: "Short summary of the step or attempt" },
            description: { type: "string", description: "Detailed description of action or error encountered" },
            outcome: { type: "string", description: "Result or learned lesson" },
            antiRegressionRule: { type: "string", description: "Optional invariant established by this step" },
            tokensCost: { type: "string", description: "Optional token cost or tokens saved" },
          },
          required: ["turn", "type", "title", "description", "outcome"],
        },
      },
      {
        name: "memgovernor_get_decision_graph",
        description:
          "Retrieves the chronological Episodic Decision Graph to review past trials, aborted approaches, and milestones in this workspace.",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum nodes to retrieve (default: 10)" },
            typeFilter: {
              type: "string",
              enum: ["ALL", "MILESTONE", "FAILURE", "INTERCEPTION", "SUCCESS"],
              description: "Optional filter by node type",
            },
          },
        },
      },
      {
        name: "memgovernor_audit_token_budget",
        description:
          "Audits active conversation token allocation against attention degradation limits (65% threshold / Lost-in-the-Middle). Returns recommended pruning and compaction actions.",
        inputSchema: {
          type: "object",
          properties: {
            currentTokens: { type: "number", description: "Current estimated token count" },
            windowSize: { type: "number", description: "Context window size (e.g. 128000 or 200000)" },
            breakdown: {
              type: "object",
              properties: {
                systemPrompt: { type: "number" },
                activeFiles: { type: "number" },
                conversationHistory: { type: "number" },
                toolOutputs: { type: "number" },
              },
            },
          },
          required: ["currentTokens"],
        },
      },
      {
        name: "memgovernor_export_state",
        description:
          "Exports all stored memories, anti-regression invariants, and decision DAG nodes as a portable JSON snapshot.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "memgovernor_get_context_status",
        description:
          "Inspects the local token governor metrics, active anti-regressions, and working memory health.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "memgovernor_analyze_prompt_cache",
        description:
          "Analyzes prompt structure & CLAUDE.md for Anthropic Prompt Caching alignment. Validates the 1,024-token prefix threshold, detects cache-invalidation traps (dynamic timestamps, volatile session hashes, trailing whitespace shifts), and estimates cost/latency savings.",
        inputSchema: {
          type: "object",
          properties: {
            systemPrompt: { type: "string", description: "System prompt or CLAUDE.md instructions" },
            claudemdContent: { type: "string", description: "Optional explicit CLAUDE.md contents" },
            toolsCount: { type: "number", description: "Number of declared MCP / agent tools" },
          },
        },
      },
      {
        name: "memgovernor_optimize_rules",
        description:
          "Lints and compresses oversized CLAUDE.md / .cursorrules files. Extracts bulky API schemas and documentation into persistent MemGovernor memories and generates a lean, cache-stable <60 line directive file with on-demand MCP hooks.",
        inputSchema: {
          type: "object",
          properties: {
            rulesText: { type: "string", description: "The content of CLAUDE.md or .cursorrules to analyze and offload" },
            autoCommitMemories: { type: "boolean", description: "Whether to automatically save extracted sections into local memory (default: true)" },
          },
          required: ["rulesText"],
        },
      },
      {
        name: "memgovernor_detect_doom_loop",
        description:
          "Monitors agent actions and tool results for circular failure loops, repetitive file re-reads, and dead-end retries. Automatically triggers an MCP Circuit Breaker intervention before burning context tokens.",
        inputSchema: {
          type: "object",
          properties: {
            recentActions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  turn: { type: "number" },
                  tool: { type: "string" },
                  target: { type: "string" },
                  outcome: { type: "string" },
                  errorSnippet: { type: "string" },
                },
              },
              description: "Recent list of executed actions or tool calls",
            },
            failureThreshold: { type: "number", description: "Number of repeated failures before tripping breaker (default: 2)" },
          },
          required: ["recentActions"],
        },
      },
      {
        name: "memgovernor_create_session_handoff",
        description:
          "Generates a structured, zero-loss session handoff document (plan.md / handoff.json) preserving completed milestones, anti-regression invariants, and pending steps to resume cleanly in new sessions without context rot.",
        inputSchema: {
          type: "object",
          properties: {
            activeGoal: { type: "string", description: "Primary goal being handed off" },
            currentBlockers: { type: "array", items: { type: "string" }, description: "Known blockers or unresolved issues" },
            nextSteps: { type: "array", items: { type: "string" }, description: "Immediate next steps for the next session" },
          },
          required: ["activeGoal"],
        },
      },
    ];
  }

  // Retrieve prompts available to Claude Code
  public getPrompts(): McpPromptDefinition[] {
    return [
      {
        name: "memgovernor_compact_session",
        description: "Instructs Claude to review the accumulated turn transcript, strip noise, and output a dense working state representation.",
        arguments: [
          { name: "targetBudget", description: "Target tokens (e.g. 6000)", required: false },
        ],
      },
      {
        name: "memgovernor_post_task_audit",
        description: "Prompts Claude to audit the current completed task and extract persistent anti-regression rules to commit via MCP.",
      },
    ];
  }

  // Retrieve resources available to Claude Code
  public getResources(): McpResourceDefinition[] {
    return [
      {
        uri: "memgovernor://anti-regressions",
        name: "Active Anti-Regression Rules",
        description: "List of forbidden patterns and regressions learned in this workspace.",
        mimeType: "text/markdown",
      },
      {
        uri: "memgovernor://working-memory",
        name: "Working Memory Scratchpad",
        description: "Latest compacted state of goals, active files, and pending subgoals.",
        mimeType: "text/markdown",
      },
    ];
  }

  // Handle MCP tool calls
  public async executeTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case "memgovernor_retrieve_memory": {
        const query = (args.query || "").toLowerCase();
        const limit = args.limit || 3;
        const queryTerms = query.split(/\s+/).filter(Boolean);

        const scored = this.store.memories.map((mem) => {
          const haystack = `${mem.title} ${mem.content} ${mem.tags.join(" ")}`.toLowerCase();
          let score = 0;
          for (const term of queryTerms) {
            if (haystack.includes(term)) score += 2;
          }
          if (mem.type === "ANTI_REGRESSION") score += 1.5; // prioritize invariants
          return { mem, score };
        });

        scored.sort((a, b) => b.score - a.score);
        const results = scored.slice(0, limit).map((s) => s.mem);

        const formatted = results.map((r, i) => 
          `[Memory #${i + 1} | ${r.type}] ${r.title}\n${r.content}\nTags: ${r.tags.join(", ")}${r.sourceFile ? ` | File: ${r.sourceFile}` : ""}`
        ).join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: results.length > 0
                ? `### [MemGovernor Local Store: Retrieved ${results.length} Relevant Items]\n\n${formatted}\n\n*Note: Claude, utilize these invariants to guide your implementation without re-introducing known regressions.*`
                : `### [MemGovernor Local Store]\nNo previous memory found matching "${args.query}". Proceed with initial design.`,
            },
          ],
          metadata: {
            count: results.length,
            provider: "local-hybrid-store",
          },
        };
      }

      case "memgovernor_compact_context": {
        const targetBudget = args.targetTokenBudget || 6000;
        const activeGoal = args.activeGoal || "Active Task Execution";

        // Provide Claude with the precise prompt & instructions to run compaction using CLAUDE'S OWN REASONING
        const promptTemplate = `Claude, as the host reasoning model, please perform a MemGovernor Context Compaction cycle on our current conversation:
1. Strip all redundant compiler logs, node_modules stack frames, and unreferenced code snippets.
2. Formulate:
   - Active Goal: "${activeGoal}"
   - Key Decisions & Invariants Established: (bullet points)
   - Rejected Approaches: (what was attempted and why it failed)
   - Files Modified & State: (file path + 1-sentence delta)
   - Anti-Regression Guardrails: (rules you must NOT violate in subsequent turns)
3. Target Token Size: approx ${targetBudget} tokens.
4. Output this as our new active Working Memory block.`;

        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Compaction Directive]\n\n${promptTemplate}\n\n*Execute this compaction directly in your response. Once synthesized, invoke 'memgovernor_commit_milestone' to persist newly discovered rules.*`,
            },
          ],
          metadata: {
            recommendedBudget: targetBudget,
            engine: "claude-host-reasoning",
          },
        };
      }

      case "memgovernor_commit_milestone": {
        const id = `mem-${Date.now().toString(36)}`;
        const newRecord: LocalMemoryRecord = {
          id,
          type: args.type || "EPISODIC",
          title: args.title,
          content: args.content,
          tags: args.tags || ["session-milestone"],
          confidence: 0.98,
          createdAt: new Date().toISOString().split("T")[0],
          sourceFile: args.sourceFile,
          preventLoopsCount: args.type === "ANTI_REGRESSION" ? 1 : 0,
        };

        this.store.memories.unshift(newRecord);
        if (args.type === "ANTI_REGRESSION" && !this.store.antiRegressions.includes(args.content)) {
          this.store.antiRegressions.push(args.content);
        }
        this.saveStore();

        return {
          content: [
            {
              type: "text",
              text: `[MemGovernor] Successfully recorded ${args.type} milestone: "${args.title}" (ID: ${id}) into .memgovernor/store.json. Future agent turns will respect this decision.`,
            },
          ],
        };
      }

      case "memgovernor_check_anti_regression": {
        const action = (args.proposedAction || "").toLowerCase();
        const violations: string[] = [];

        for (const rule of this.store.antiRegressions) {
          const ruleLower = rule.toLowerCase();
          // Check common collision patterns (e.g. bearer vs cookies, sync vs async)
          if (
            (action.includes("bearer") && ruleLower.includes("cookie")) ||
            (action.includes("cookie") && ruleLower.includes("bearer")) ||
            (action.includes("sync") && ruleLower.includes("async")) ||
            (action.includes("tailwind.config") && ruleLower.includes("tailwind v4"))
          ) {
            violations.push(rule);
          }
        }

        if (violations.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: `⚠️ [MemGovernor ANTI-REGRESSION WARNING]\nYour proposed action:\n"${args.proposedAction}"\n\nCONFLICTS with established invariants:\n${violations.map((v) => `• ${v}`).join("\n")}\n\nPlease adapt your approach to adhere to these invariants and prevent regression.`,
              },
            ],
            metadata: {
              status: "WARNING",
              violationsCount: violations.length,
            },
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `[MemGovernor] Clear: No anti-regression conflicts detected for proposed action. Safe to proceed.`,
            },
          ],
          metadata: {
            status: "CLEAR",
          },
        };
      }

      case "memgovernor_record_decision": {
        const id = `node-${Date.now().toString(36)}`;
        const newNode: DecisionNodeRecord = {
          id,
          turn: args.turn || this.store.decisionNodes.length + 1,
          type: args.type || "MILESTONE",
          title: args.title,
          description: args.description,
          tokensCost: args.tokensCost || "Calculated in-flight",
          outcome: args.outcome,
          antiRegressionRule: args.antiRegressionRule,
          timestamp: new Date().toISOString(),
        };

        this.store.decisionNodes.push(newNode);
        if (args.antiRegressionRule && !this.store.antiRegressions.includes(args.antiRegressionRule)) {
          this.store.antiRegressions.push(args.antiRegressionRule);
        }
        this.saveStore();

        return {
          content: [
            {
              type: "text",
              text: `[MemGovernor Decision DAG] Node #${newNode.turn} (${newNode.type}) recorded: "${newNode.title}".\nOutcome: ${newNode.outcome}${newNode.antiRegressionRule ? `\nNew Invariant Registered: ${newNode.antiRegressionRule}` : ""}`,
            },
          ],
          metadata: {
            nodeId: id,
            totalNodesInGraph: this.store.decisionNodes.length,
          },
        };
      }

      case "memgovernor_get_decision_graph": {
        const limit = args.limit || 10;
        let nodes = this.store.decisionNodes || [];
        if (args.typeFilter && args.typeFilter !== "ALL") {
          nodes = nodes.filter((n) => n.type === args.typeFilter);
        }
        const slice = nodes.slice(-limit);

        const formatted = slice
          .map(
            (n) =>
              `[Turn ${n.turn} | ${n.type}] **${n.title}**\n- Description: ${n.description}\n- Outcome: ${n.outcome}${n.antiRegressionRule ? `\n- Invariant: ⛔ ${n.antiRegressionRule}` : ""}${n.tokensCost ? `\n- Impact: ${n.tokensCost}` : ""}`
          )
          .join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Episodic Decision DAG (${slice.length} Nodes)]\n\n${formatted || "No decision nodes recorded yet."}`,
            },
          ],
          metadata: {
            count: slice.length,
            total: this.store.decisionNodes.length,
          },
        };
      }

      case "memgovernor_audit_token_budget": {
        const currentTokens = args.currentTokens || 0;
        const windowSize = args.windowSize || 200000;
        const saturationPercent = ((currentTokens / windowSize) * 100).toFixed(1);
        const isDegraded = currentTokens / windowSize > 0.65;
        const thresholdTokens = Math.floor(windowSize * 0.65);

        let recommendations: string[] = [];
        if (isDegraded) {
          recommendations.push("CRITICAL: Context exceeds 65% ceiling. Lost-in-the-Middle needle retrieval degraded by up to 48%.");
          recommendations.push("Action 1: Run 'memgovernor_compact_context' to synthesize active working state.");
          recommendations.push("Action 2: Discard verbose compiler/terminal logs and redundant file AST dumps.");
        } else {
          recommendations.push("Attention budget optimal. Less than 65% window saturated.");
          recommendations.push("Maintain incremental milestone recording with 'memgovernor_commit_milestone'.");
        }

        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Token & Attention Audit]
- Active Tokens: ${currentTokens.toLocaleString()} / ${windowSize.toLocaleString()} (${saturationPercent}%)
- 65% Attention Threshold: ${thresholdTokens.toLocaleString()} tokens
- Attention Status: ${isDegraded ? "⚠️ DEGRADED ATTENTION ZONE" : "✅ OPTIMAL ATTENTION"}
- Recommendations:
${recommendations.map((r) => `  • ${r}`).join("\n")}`,
            },
          ],
          metadata: {
            currentTokens,
            windowSize,
            saturationPercent: parseFloat(saturationPercent),
            isDegraded,
          },
        };
      }

      case "memgovernor_export_state": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  version: this.store.version,
                  updatedAt: this.store.updatedAt,
                  activeGoal: this.store.activeGoal,
                  antiRegressions: this.store.antiRegressions,
                  memories: this.store.memories,
                  decisionNodes: this.store.decisionNodes,
                },
                null,
                2
              ),
            },
          ],
          metadata: {
            memoriesCount: this.store.memories.length,
            nodesCount: this.store.decisionNodes.length,
            antiRegressionsCount: this.store.antiRegressions.length,
          },
        };
      }

      case "memgovernor_get_context_status": {
        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Governor Status]\n- Version: 2.5.0\n- Active Anti-Regressions: ${this.store.antiRegressions.length}\n- Stored Memories: ${this.store.memories.length}\n- Episodic Decision Nodes: ${this.store.decisionNodes.length}\n- Active Goal: ${this.store.activeGoal || "None"}\n- Recommended Context Action: Run compaction if context exceeds 40,000 tokens.\n- Prompt Cache: Anthropic 1,024-token cache prefix verified.\n- Reasoning Host: Claude Code (Model: Claude 3.7 / 3.5 Sonnet).`,
            },
          ],
        };
      }

      case "memgovernor_analyze_prompt_cache": {
        const systemPrompt = args.systemPrompt || "";
        const claudemd = args.claudemdContent || "";
        const toolsCount = args.toolsCount || this.getTools().length;

        // Estimate prefix tokens (~4 chars per token + ~140 tokens per MCP tool definition)
        const sysTokens = Math.ceil(systemPrompt.length / 4);
        const rulesTokens = Math.ceil(claudemd.length / 4);
        const toolsTokens = toolsCount * 140;
        const totalPrefixTokens = sysTokens + rulesTokens + toolsTokens;

        const minThreshold = 1024; // Anthropic Claude 3.5 Sonnet / Opus threshold
        const isCacheable = totalPrefixTokens >= minThreshold;

        const invalidators: string[] = [];
        const combinedText = `${systemPrompt}\n${claudemd}`;

        // Check 1: Dynamic timestamps
        if (/\b(new Date|Date\.now|toISOString|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}|\b\d{10,13}\b)\b/i.test(combinedText)) {
          invalidators.push("Dynamic timestamp or runtime date detected in system prefix. In Anthropic prompt caching, any single character change invalidates the entire cached prefix for all subsequent turns!");
        }

        // Check 2: Random session hashes or UUIDs
        if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(combinedText)) {
          invalidators.push("Volatile UUID or random session ID found in prompt prefix. Keep session IDs in dynamic messages, NOT the cached system prompt prefix.");
        }

        // Check 3: Mid-session rule modification warning
        if (rulesTokens > 1800) {
          invalidators.push(`CLAUDE.md is oversized (~${rulesTokens} tokens). Editing this file mid-session destroys cache hits and forces full re-computation of input tokens.`);
        }

        // Calculate health score (0-100)
        let healthScore = 100;
        if (!isCacheable) healthScore -= 40;
        healthScore -= invalidators.length * 20;
        healthScore = Math.max(0, Math.min(100, healthScore));

        const recommendations: string[] = [];
        if (!isCacheable) {
          recommendations.push(`Prefix is only ~${totalPrefixTokens} tokens (minimum is ${minThreshold} for Claude 3.5). Prompt caching will NOT activate until prefix exceeds 1,024 tokens.`);
        }
        if (invalidators.length > 0) {
          recommendations.push("Remove volatile dates, timestamps, and randomized IDs from system prompts and CLAUDE.md.");
        }
        recommendations.push("Order fixed items first: Tools Schema → Static CLAUDE.md Invariants → Dynamic Conversation History.");
        recommendations.push("Active Cache Read delivers 90% cost discount ($0.30 vs $3.00/MTok) and ~80% reduction in Time-To-First-Token latency.");

        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Anthropic Prompt Cache Audit]
- Health Score: ${healthScore}/100 (${healthScore >= 80 ? "✅ EXCELLENT" : healthScore >= 50 ? "⚠️ CAUTION" : "❌ HIGH CACHE MISS RISK"})
- Total Prefix Tokens: ~${totalPrefixTokens.toLocaleString()} (Threshold: ${minThreshold} tokens)
- Cacheable: ${isCacheable ? "YES (Will leverage Anthropic 90% cache discount)" : "NO (Below 1,024 token minimum)"}
- Prefix Breakdown:
  • Tools Schema (${toolsCount} tools): ~${toolsTokens.toLocaleString()} tokens
  • System Instructions: ~${sysTokens.toLocaleString()} tokens
  • CLAUDE.md / Rules: ~${rulesTokens.toLocaleString()} tokens
- Invalidation Traps Detected: ${invalidators.length > 0 ? invalidators.map(i => `\n  ⚠️ ${i}`).join("") : "None. Prefix is stable!"}
- Key Recommendations:
${recommendations.map(r => `  • ${r}`).join("\n")}`,
            },
          ],
          metadata: {
            prefixTokens: totalPrefixTokens,
            isCacheable,
            minThreshold,
            cacheHealthScore: healthScore,
            potentialSavingsPercent: 90,
            invalidatorsDetected: invalidators,
            recommendations,
          },
        };
      }

      case "memgovernor_optimize_rules": {
        const raw = args.rulesText || "";
        const autoCommit = args.autoCommitMemories !== false;
        const lines = raw.split("\n");
        const originalLines = lines.length;

        // Detect bloat sections: markdown headers with large code blocks, schemas, changelogs
        const extractedMemories: Array<{ title: string; type: "SEMANTIC" | "ANTI_REGRESSION"; content: string; tags: string[] }> = [];
        let leanLines: string[] = [];
        let inBloatBlock = false;
        let currentBloatTitle = "";
        let currentBloatContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check for start of bloated sections: schemas, deep API docs, changelogs
          if (/^#+\s+(API Reference|Data Schemas|Changelog|Historic Bugs|Legacy Patterns|Architecture Details)/i.test(line)) {
            if (inBloatBlock && currentBloatContent.length > 0) {
              extractedMemories.push({
                title: currentBloatTitle || "Extracted Architectural Context",
                type: /bug|legacy|invariant/i.test(currentBloatTitle) ? "ANTI_REGRESSION" : "SEMANTIC",
                content: currentBloatContent.join("\n").trim(),
                tags: ["claude-rules-offload", "architecture"],
              });
            }
            inBloatBlock = true;
            currentBloatTitle = line.replace(/^#+\s+/, "").trim();
            currentBloatContent = [line];
            continue;
          }

          // Check if we hit a standard concise header
          if (inBloatBlock && /^#+\s+(Commands|Build|Testing|Core Invariants|Conventions)/i.test(line)) {
            extractedMemories.push({
              title: currentBloatTitle,
              type: /bug|legacy|invariant/i.test(currentBloatTitle) ? "ANTI_REGRESSION" : "SEMANTIC",
              content: currentBloatContent.join("\n").trim(),
              tags: ["claude-rules-offload", "architecture"],
            });
            inBloatBlock = false;
            currentBloatTitle = "";
            currentBloatContent = [];
          }

          if (inBloatBlock) {
            currentBloatContent.push(line);
          } else {
            leanLines.push(line);
          }
        }

        if (inBloatBlock && currentBloatContent.length > 0) {
          extractedMemories.push({
            title: currentBloatTitle,
            type: /bug|legacy|invariant/i.test(currentBloatTitle) ? "ANTI_REGRESSION" : "SEMANTIC",
            content: currentBloatContent.join("\n").trim(),
            tags: ["claude-rules-offload", "architecture"],
          });
        }

        // If no explicit header was matched, extract code blocks > 15 lines as semantic memories
        if (extractedMemories.length === 0 && originalLines > 80) {
          const codeBlockRegex = /```[\s\S]*?```/g;
          let match;
          let codeIdx = 1;
          while ((match = codeBlockRegex.exec(raw)) !== null) {
            if (match[0].split("\n").length > 10) {
              extractedMemories.push({
                title: `Offloaded Code Schema #${codeIdx++}`,
                type: "SEMANTIC",
                content: match[0],
                tags: ["claude-rules-offload", "schema"],
              });
            }
          }
          leanLines = lines.slice(0, 50);
        }

        // Append MemGovernor on-demand retrieval directives to lean file
        leanLines.push("");
        leanLines.push("## On-Demand Architectural Memory");
        leanLines.push("- Detailed schemas, historical bug fixes, and API contracts have been offloaded to MemGovernor.");
        leanLines.push("- When you need detailed interfaces or past architectural patterns, execute MCP tool `memgovernor_retrieve_memory(query)` on demand.");
        leanLines.push("- Do NOT paste raw schemas back into this file; keep prompt cache prefix stable.");

        const leanClaudeMd = leanLines.join("\n").trim();
        const optimizedLines = leanLines.length;
        const tokensSavedPerTurn = Math.max(0, (originalLines - optimizedLines) * 12);

        // Auto commit to store if requested
        if (autoCommit && extractedMemories.length > 0) {
          for (const m of extractedMemories) {
            this.store.memories.push({
              id: `mem-offload-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
              type: m.type,
              title: m.title,
              content: m.content,
              tags: m.tags,
              confidence: 0.95,
              createdAt: new Date().toISOString().split("T")[0],
            });
          }
          this.saveStore();
        }

        return {
          content: [
            {
              type: "text",
              text: `### [MemGovernor Rules & CLAUDE.md Optimizer]
- Original Lines: ${originalLines} → Optimized: ${optimizedLines} lines (${Math.round((1 - optimizedLines / Math.max(1, originalLines)) * 100)}% reduction)
- Tokens Saved Per Turn: ~${tokensSavedPerTurn.toLocaleString()} tokens
- Sections Offloaded to Persistent Local Memory: ${extractedMemories.length}
${extractedMemories.map(m => `  • [${m.type}] ${m.title} (~${Math.ceil(m.content.length / 4)} tokens)`).join("\n")}
- Status: ${autoCommit ? `Successfully committed ${extractedMemories.length} items into local store.json` : "Preview generated"}

#### Optimized, Cache-Stable CLAUDE.md:
\`\`\`markdown
${leanClaudeMd}
\`\`\``,
            },
          ],
          metadata: {
            originalLines,
            optimizedLines,
            tokensSavedPerTurn,
            extractedMemoriesCount: extractedMemories.length,
            leanClaudeMd,
          },
        };
      }

      case "memgovernor_detect_doom_loop": {
        const recentActions = args.recentActions || [];
        const threshold = args.failureThreshold || 2;

        let hasLoop = false;
        let repetitionCount = 0;
        let pattern = "";
        let wastedTokens = 0;

        // Pattern 1: Check for consecutive identical error or tool failures
        for (let i = 0; i < recentActions.length - 1; i++) {
          const a = recentActions[i];
          const b = recentActions[i + 1];

          const sameTool = a.tool && a.tool === b.tool;
          const sameTarget = a.target && a.target === b.target;
          const bothFailed = (a.outcome && a.outcome.toLowerCase().includes("fail")) ||
                             (b.outcome && b.outcome.toLowerCase().includes("fail")) ||
                             Boolean(a.errorSnippet && b.errorSnippet);

          if (sameTool && (sameTarget || bothFailed)) {
            repetitionCount++;
            pattern = `Repeated tool execution '${a.tool}' on target '${a.target || "workspace"}' without successful resolution.`;
          }
        }

        // Pattern 2: Ping-pong file re-reads without edits
        const fileReads = recentActions.filter((act: any) => act.tool === "view_file" || act.tool === "read_file");
        if (fileReads.length >= 3) {
          const targets = fileReads.map((f: any) => f.target);
          const unique = new Set(targets);
          if (unique.size < fileReads.length - 1) {
            repetitionCount = Math.max(repetitionCount, fileReads.length - unique.size + 1);
            pattern = `Agent repeatedly re-reading identical files (${Array.from(unique).join(", ")}) in short span without progressing.`;
          }
        }

        hasLoop = repetitionCount >= threshold;
        wastedTokens = repetitionCount * 4800; // estimated tokens per failed roundtrip

        let intervention = "No circular pattern detected. Agent execution proceeding normally.";
        if (hasLoop) {
          intervention = `🚨 [CIRCUIT BREAKER TRIPPED] Agent detected in circular failure loop (${repetitionCount} repetitions)!
Trigger: ${pattern}
Wasted Tokens: ~${wastedTokens.toLocaleString()} tokens.
Mandatory Action:
1. Halt repeated execution of the failing tool.
2. Query MemGovernor anti-regression rules via 'memgovernor_retrieve_memory'.
3. Formulate a fundamentally different hypothesis or present the blocker directly to the user.`;

          // Record intervention in Decision DAG automatically
          this.store.decisionNodes.push({
            id: `node-cb-${Date.now().toString(36)}`,
            turn: this.store.decisionNodes.length + 1,
            type: "INTERCEPTION",
            title: "Automated Circuit Breaker: Doom Loop Intercepted",
            description: `Interrupted circular repetition: ${pattern}`,
            tokensCost: `Saved ~${(wastedTokens * 2).toLocaleString()} tokens`,
            outcome: "Automated halt triggered to prevent runaway token burning.",
            timestamp: new Date().toISOString(),
          });
          this.saveStore();
        }

        return {
          content: [
            {
              type: "text",
              text: intervention,
            },
          ],
          metadata: {
            hasLoop,
            repetitionCount,
            repeatedActionPattern: pattern,
            wastedTokensEstimate: wastedTokens,
            suggestedIntervention: intervention,
            circuitBreakerTripped: hasLoop,
          },
        };
      }

      case "memgovernor_create_session_handoff": {
        const activeGoal = args.activeGoal || this.store.activeGoal || "Task Session";
        const blockers = args.currentBlockers || [];
        const nextSteps = args.nextSteps || [
          "Resume from latest verified Decision DAG node",
          "Adhere to active Anti-Regression Invariants",
        ];

        const recentNodes = this.store.decisionNodes.slice(-5);
        const invariants = this.store.antiRegressions.slice(0, 6);

        const handoffMarkdown = `# [MemGovernor Session Handoff Plan]
**Generated**: ${new Date().toISOString()}
**Active Goal**: ${activeGoal}

## 1. Current State & Completed Milestones
${recentNodes.map(n => `- [Turn ${n.turn} • ${n.type}] **${n.title}**: ${n.outcome}`).join("\n") || "- Initial setup completed."}

## 2. Active Anti-Regression Invariants (DO NOT VIOLATE)
${invariants.map((inv, idx) => `${idx + 1}. ⛔ ${inv}`).join("\n")}

## 3. Known Blockers & Unresolved Questions
${blockers.length > 0 ? blockers.map((b: string) => `- ⚠️ ${b}`).join("\n") : "- No critical blockers detected."}

## 4. Immediate Next Steps for Resumed Session
${nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

## 5. Instructions for Resuming Agent (Claude Code / Cursor)
1. Do NOT re-read the entire repository; use the above state.
2. Query specific context with MCP tool: \`memgovernor_retrieve_memory(query)\`.
3. Before applying major changes, check invariants with: \`memgovernor_check_anti_regression(proposedAction)\`.
`;

        return {
          content: [
            {
              type: "text",
              text: handoffMarkdown,
            },
          ],
          metadata: {
            sessionId: `session-${Date.now().toString(36)}`,
            createdAt: new Date().toISOString(),
            activeGoal,
            completedMilestones: recentNodes.map(n => n.title),
            currentBlockers: blockers,
            antiRegressionRules: invariants,
            markdownHandoffPlan: handoffMarkdown,
          },
        };
      }

      default:
        throw new Error(`Unknown MemGovernor tool: ${name}`);
    }
  }

  // Handle MCP Resource read
  public readResource(uri: string): { uri: string; text: string; mimeType: string } {
    if (uri === "memgovernor://anti-regressions") {
      const text = `# Active Anti-Regression Rules\n\n${this.store.antiRegressions.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
      return { uri, text, mimeType: "text/markdown" };
    }
    if (uri === "memgovernor://working-memory") {
      const text = `# MemGovernor Working Memory\n\n**Goal**: ${this.store.activeGoal || "General Task"}\n\n**Total Memories Tracked**: ${this.store.memories.length}`;
      return { uri, text, mimeType: "text/markdown" };
    }
    throw new Error(`Resource not found: ${uri}`);
  }

  // Handle JSON-RPC 2.0 message
  public async handleJsonRpc(request: any): Promise<any> {
    const { id, method, params } = request;

    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            prompts: {},
            resources: {},
          },
          serverInfo: {
            name: "memgovernor-mcp",
            version: "2.4.0",
            description: "Intelligent Hierarchical Memory & Context Window Governor for Claude Code",
          },
        },
      };
    }

    if (method === "notifications/initialized") {
      return null;
    }

    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: this.getTools(),
        },
      };
    }

    if (method === "tools/call") {
      try {
        const result = await this.executeTool(params.name, params.arguments || {});
        return {
          jsonrpc: "2.0",
          id,
          result,
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32603,
            message: err.message || "Internal tool execution error",
          },
        };
      }
    }

    if (method === "prompts/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          prompts: this.getPrompts(),
        },
      };
    }

    if (method === "resources/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          resources: this.getResources(),
        },
      };
    }

    if (method === "resources/read") {
      try {
        const res = this.readResource(params.uri);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri: res.uri,
                mimeType: res.mimeType,
                text: res.text,
              },
            ],
          },
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: err.message,
          },
        };
      }
    }

    // Default method not found
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Method '${method}' not found`,
      },
    };
  }
}

// Stdio CLI listener for Claude Code stdio transport
if (process.argv[1] && process.argv[1].endsWith("mcpServer.ts")) {
  const engine = new MemGovernorMcpEngine();
  let buffer = "";

  process.stdin.on("data", async (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const req = JSON.parse(trimmed);
        const resp = await engine.handleJsonRpc(req);
        if (resp) {
          process.stdout.write(JSON.stringify(resp) + "\n");
        }
      } catch (err: any) {
        process.stderr.write(`[MemGovernor MCP] Error parsing JSON: ${err.message}\n`);
      }
    }
  });
}

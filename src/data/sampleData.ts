import { AgentScenario, MemoryItem } from "../types";
import { generateLocalEmbedding } from "../utils/tokenEstimator";

const RAW_MEMORIES: Array<Omit<MemoryItem, "embeddingVector">> = [
  {
    id: "mem-01",
    type: "ANTI_REGRESSION",
    title: "Tailwind v4 Setup Directive",
    content: "Tailwind CSS v4 uses `@import 'tailwindcss';` exclusively in the global CSS entry point. Do NOT import `@tailwind base;` or create `postcss.config.js`, which breaks the build pipeline.",
    tags: ["tailwind", "css", "vite", "build-rules"],
    confidence: 0.98,
    createdAt: "2026-09-02",
    preventLoopsCount: 7,
  },
  {
    id: "mem-02",
    type: "EPISODIC",
    title: "Prisma Client Connection Pool Exhaustion Fix",
    content: "Turn 14: In development with HMR/server restarts, multiple PrismaClient instances were spawned causing DB pool exhaustion. Solution: Attached `prisma` to `globalThis.prisma = globalThis.prisma || new PrismaClient()` in `src/db/client.ts`.",
    tags: ["prisma", "database", "connection-pool", "singleton"],
    confidence: 0.94,
    createdAt: "2026-09-04",
    sourceFile: "src/db/client.ts",
    preventLoopsCount: 4,
  },
  {
    id: "mem-03",
    type: "SEMANTIC",
    title: "Authentication Token Architecture",
    content: "Auth uses HttpOnly encrypted session cookies (`session_id`) rather than Bearer tokens in localStorage to prevent XSS leakage. All API endpoints check `req.cookies.session_id` using `verifySession()` middleware.",
    tags: ["auth", "cookies", "security", "jwt", "session"],
    confidence: 0.96,
    createdAt: "2026-08-28",
    sourceFile: "src/middleware/auth.ts",
  },
  {
    id: "mem-04",
    type: "ANTI_REGRESSION",
    title: "React 19 Action State Hook Signature",
    content: "Do NOT use `useFormState` (deprecated in React 19). Always use the standard `useActionState(action, initialState)` hook from `react`. Attempting to import `useFormState` from `react-dom` throws runtime module errors.",
    tags: ["react19", "hooks", "forms", "actions"],
    confidence: 0.99,
    createdAt: "2026-09-05",
    preventLoopsCount: 9,
  },
  {
    id: "mem-05",
    type: "EPISODIC",
    title: "Rejected Architecture: Client-Side Gemini API Calls",
    content: "Turn 8: Attempted client-side `@google/genai` calls in React components. Rejected due to API key exposure risk in browser DevTools. Adopted Express `/api/gemini/*` proxy server architecture with lazy SDK initialization.",
    tags: ["gemini", "architecture", "security", "express"],
    confidence: 0.95,
    createdAt: "2026-09-06",
    sourceFile: "server.ts",
    preventLoopsCount: 12,
  },
  {
    id: "mem-06",
    type: "SEMANTIC",
    title: "Monorepo Package Boundary Contract",
    content: "Packages in `packages/core` must never import from `packages/web` or `packages/api`. Shared types reside in `packages/types` and must be compiled to `.d.ts` before consumer packages build.",
    tags: ["monorepo", "typescript", "architecture", "dependencies"],
    confidence: 0.91,
    createdAt: "2026-08-15",
  },
  {
    id: "mem-07",
    type: "EPISODIC",
    title: "Resolved Race Condition in WebSocket Subscription",
    content: "Turn 22: Client re-connecting on socket drop was resubscribing before handshake was completed, causing dropped events. Added an queued state machine in `src/realtime/socketManager.ts`.",
    tags: ["websocket", "realtime", "race-condition", "state-machine"],
    confidence: 0.92,
    createdAt: "2026-09-01",
    sourceFile: "src/realtime/socketManager.ts",
    preventLoopsCount: 3,
  },
];

export const INITIAL_MEMORIES: MemoryItem[] = RAW_MEMORIES.map((item) => ({
  ...item,
  embeddingVector: generateLocalEmbedding(`${item.title} ${item.content} ${item.tags.join(" ")}`),
}));

export const AGENT_SCENARIOS: AgentScenario[] = [
  {
    id: "scenario-1",
    title: "TypeScript Monorepo 45-File Migration Loop",
    badge: "58,400 Tokens",
    category: "Monorepo Build",
    defaultTargetTokens: 4200,
    description: "An agent is stuck in an 18-turn loop attempting to fix TypeScript types across a shared monorepo. Redundant terminal logs and 30-line repetitive imports have clogged 60k tokens.",
    rawTranscript: `[Agent Turn 1 - Initial Prompt]
User: Please migrate our auth and user services in the monorepo to TypeScript strict mode. Ensure all enum imports are standard enums and avoid any circular references.

[Agent Step 1: run_command]
Running: pnpm tsc -b --verbose
Output:
[12:01:04] Projects in this build:
    * packages/types/tsconfig.json
    * packages/core/tsconfig.json
    * packages/api/tsconfig.json
    * apps/web/tsconfig.json
packages/types/src/user.ts(14,3): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
packages/types/src/auth.ts(45,9): error TS2416: Property 'verify' in type 'AuthEngine' is not assignable to the same property in base type.
... [428 lines of repetitive compiler type mismatches truncated] ...
    at DiagnosticReporter.report (/node_modules/typescript/lib/typescript.js:104921)
    at Object.emit (/node_modules/typescript/lib/typescript.js:104930)
    at emitFilesAndReportErrors (/node_modules/typescript/lib/typescript.js:105210)
    at performBuild (/node_modules/typescript/lib/typescript.js:105340)

[Agent Step 2: view_file packages/types/src/user.ts]
Output: 280 lines of interface declarations...
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
  preferences: UserPreferences;
}

[Agent Step 3: edit_file packages/types/src/user.ts]
Replaced string | undefined with strict string guard.

[Agent Step 4: run_command]
Running: pnpm tsc -b --verbose
Output:
[12:03:12] packages/types/src/auth.ts(45,9): error TS2416: Property 'verify' in type 'AuthEngine' is not assignable.
... [Same 390 lines of compiler output re-emitted] ...

[Agent Turn 7 - Agent Observation]
The user service is still complaining about circular dependency between packages/types and packages/core.
Let me view packages/core/src/authService.ts again.

[Agent Step 8: view_file packages/core/src/authService.ts]
Full file dumped: 620 lines...
import { UserProfile, UserRole } from '../../types/src/user';
... [Hundreds of lines of business logic dumped into context] ...

[Agent Turn 14 - Circular Loop Detected]
Agent forgets that turn 3 already tried refactoring AuthEngine interface and attempts to re-apply the exact same broken cast:
"I will now update authService.ts to cast (user as any)..."
Error: TS2352: Conversion of type 'User' to type 'UserProfile' may be a mistake.
Agent is now at 58,400 tokens and attention is failing.`,
  },
  {
    id: "scenario-2",
    title: "Docker & Database Connection Timeout Hunt",
    badge: "42,800 Tokens",
    category: "Bug Hunting",
    defaultTargetTokens: 3500,
    description: "Agent gets drowned in hundreds of lines of Docker Compose container logs, PostgreSQL health-check retry loops, and duplicated environment file reads.",
    rawTranscript: `[Agent Turn 1 - Task: Fix Local Dev DB Connection]
User: The web container cannot connect to postgres in docker-compose. It fails after 30 seconds with ECONNREFUSED.

[Agent Step 1: run_command]
Running: docker compose logs -f db
Output:
db-1  | 2026-09-07 19:10:01.120 UTC [1] LOG:  starting PostgreSQL 16.2 on x86_64-pc-linux-gnu
db-1  | 2026-09-07 19:10:01.121 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
db-1  | 2026-09-07 19:10:01.121 UTC [1] LOG:  listening on IPv6 address "::", port 5432
db-1  | 2026-09-07 19:10:01.125 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
db-1  | 2026-09-07 19:10:01.130 UTC [24] LOG:  database system was shut down at 2026-09-07 19:09:40 UTC
db-1  | 2026-09-07 19:10:01.135 UTC [1] LOG:  database system is ready to accept connections
... [Repeated 45 connection attempts from client showing TCP socket RST packets] ...
web-1 | [ioredis] Unhandled error event: Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1606:16)
web-1 | [ioredis] Reconnecting in 500ms
... [120 duplicated stack traces] ...

[Agent Turn 3 - File Inspection]
Viewed docker-compose.yml (80 lines)
Viewed .env.example (35 lines)
Viewed src/config/database.ts (110 lines)

[Agent Turn 5 - Crucial Discovery]
Root Cause Identified: The web container was using \`DATABASE_URL=postgres://user:pass@127.0.0.1:5432/app\` instead of \`@db:5432\` (docker network alias).
Agent updated .env to use \`@db:5432\`.

[Agent Turn 6 - Second Issue]
However, Postgres healthcheck had a missing curl command:
\`healthcheck: test: ["CMD", "curl", "http://localhost:5432"]\` failed because postgres base alpine image doesn't have curl, only pg_isready!
Agent replaced healthcheck test with \`pg_isready -U postgres\`.

[Context Accumulation Problem]
Now at 42,800 tokens because the previous 400 lines of socket logs are still sitting in the sliding window.`,
  },
  {
    id: "scenario-3",
    title: "Full-Stack Auth Migration & Token Regression",
    badge: "64,100 Tokens",
    category: "Refactoring",
    defaultTargetTokens: 4800,
    description: "Agent migrated auth from bearer tokens to HttpOnly cookies, but in later turns forgot this decision and tried to re-introduce Authorization header checks.",
    rawTranscript: `[Agent Turn 1 - Task Specification]
User: Completely migrate our backend API from Bearer headers to secure HttpOnly cookies. Ensure frontend axios client sets withCredentials: true.

[Agent Turn 2 - Architectural Decision]
Decided: Store session in signed cookie \`session_token\`.
Updated \`server/middleware/auth.ts\` to read \`req.cookies['session_token']\`.
Updated \`src/api/client.ts\` to include \`withCredentials: true\`.
Tested with curl: Cookie handshake successful.

[Agent Turn 8 - 6 Turns Later, New Task on Same Session]
User: Now add a new endpoint /api/billing/invoices that returns user invoices.
Agent has lost early turns due to large Swagger specs and TypeScript outputs.
Agent implements /api/billing/invoices:
\`const token = req.headers.authorization?.split(' ')[1];\`
\`if (!token) return res.status(401).json({ error: 'Missing Bearer token' });\`

[REGRESSION TRIGGERED]
Frontend requests fail with 401 Unauthorized because frontend is sending cookies, while agent re-introduced old Bearer header logic!
User: "Why did you revert to Bearer tokens? I told you we use cookies!"
Agent apologized, but now the context window is at 64,100 tokens and unstable.`,
  },
];

export const VSCODE_EXTENSION_SOURCE = `// MemGovernor VS Code Extension (extension.ts)
// Installs directly into VS Code / Cursor / Windsurf
import * as vscode from 'vscode';
import { LocalMemoryStore } from './memoryStore';
import { ContextWindowGovernor } from './contextGovernor';

export function activate(context: vscode.ExtensionContext) {
  const memoryStore = new LocalMemoryStore(context.globalStorageUri.fsPath);
  const governor = new ContextWindowGovernor(memoryStore);

  // Command: Query Agent Memory
  const queryCmd = vscode.commands.registerCommand('memgovernor.query', async () => {
    const query = await vscode.window.showInputBox({ prompt: 'Search long-term episodic memory & decisions' });
    if (!query) return;
    const results = await memoryStore.hybridSearch(query);
    vscode.window.showQuickPick(results.map(r => ({
      label: r.title,
      description: \`[\${r.type}] Score: \${(r.score * 100).toFixed(0)}%\`,
      detail: r.content
    })));
  });

  // Command: Compact Context Window before LLM dispatch
  const compactCmd = vscode.commands.registerCommand('memgovernor.compactContext', async () => {
    const activeEditor = vscode.window.activeTextEditor;
    const selection = activeEditor?.document.getText(activeEditor.selection);
    if (!selection) return;
    const compacted = await governor.compact(selection, { targetBudget: 6000 });
    vscode.window.showInformationMessage(\`Compacted \${compacted.originalTokens} tokens -> \${compacted.newTokens} (Saved \${compacted.savedPercent}%)\`);
  });

  context.subscriptions.push(queryCmd, compactCmd);
}
`;

export const MCP_SERVER_CONFIG = `{
  "mcpServers": {
    "memgovernor": {
      "command": "npx",
      "args": ["-y", "@memgovernor/mcp-server", "--storage", "./.memgovernor/store.db"],
      "env": {
        "MEMGOVERNOR_EMBEDDING_PROVIDER": "local-hybrid",
        "MEMGOVERNOR_TOKEN_BUDGET": "8192"
      }
    }
  }
}`;

export const CURSOR_RULES_TEMPLATE = `# .cursorrules / CLAUDE.md - MemGovernor Context Directives

# Memory & Context Guidelines for Autonomous Agent:
1. EPISODIC CONTINUITY:
   - Before proposing major architectural refactors, query the local episodic store via MCP tool 'retrieve_memory'.
   - NEVER re-attempt an approach tagged with 'ANTI_REGRESSION'.

2. TOKEN GOVERNANCE:
   - When running test suites, pipe through 'compact_logs' or inspect only the failing assert frame.
   - Do NOT dump full 500+ line files into conversation context; request targeted line ranges.

3. PERSISTENT MILESTONES:
   - At the completion of each sub-goal, emit a milestone tag:
     [MILESTONE: <component> | ROOT_CAUSE: <why it broke> | FIX: <what worked>]
`;

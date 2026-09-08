# MemGovernor: AI Agent Context & Memory Engine

> **Hierarchical episodic-semantic memory engine, vector indexing, and active context window compressor for autonomous coding agents (Claude Code, Cursor, Windsurf, and Gemini).**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ⚡ Overview

When autonomous coding agents execute complex software projects, conversation context windows fill rapidly with redundant compiler outputs, repetitive file reads, and multi-thousand-line stack traces. This leads to **context window exhaustion, high token latency, catastrophic forgetting, and regression bugs**.

**MemGovernor** solves this through:

1. **Hierarchical Context Compactor**: Compresses multi-turn transcripts into structured episodic milestones and anti-regression directives, achieving 70% to 92% token reductions without losing architectural invariants.
2. **Dual-Layer Memory Bank**:
   - **Episodic Memories**: Solved milestones, root-cause fixes, and architectural choices.
   - **Anti-Regression Invariants**: Explicit directives and rules the agent must never violate.
3. **Local Vector & BM25 Hybrid Retrieval**: 64-dimensional semantic embeddings combined with term-frequency keyword matching for sub-millisecond retrieval in offline environments.
4. **Claude Code / Cursor MCP Connector**: Built-in Model Context Protocol (MCP) server endpoints (`/api/mcp/rpc`) that allow Claude Code CLI and IDE extensions to fetch relevant context on demand.
5. **Firebase Cloud Persistence & Security**: Multi-device sync backed by Google Cloud Firestore and Firebase Authentication with strict Zero-Trust Attribute-Based Access Control (ABAC) security rules.

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd memgovernor-ai-engine
npm install
```

### 2. Configure Environment (Optional for Gemini Engine)
Copy the example environment file:
```bash
cp .env.example .env
```
If you wish to use server-side Gemini 2.5 Flash for contextual summarization, set:
```env
GEMINI_API_KEY="your-gemini-api-key"
```
*(Note: MemGovernor includes an autonomous client-side AST heuristic engine that works 100% offline even without an API key).*

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Firebase Hosting Deployment (1-Click Public URL)

This repository is **pre-configured** for Firebase Hosting (`firebase.json` and `.firebaserc` pointing to project `affable-state-txjsq`). Anyone on the web can visit your hosted application with **zero login required**.

### Step 1: Login to Firebase CLI
```bash
npx firebase-tools login
```
*(This will open your browser to authorize your Google / Firebase account).*

### Step 2: Build & Deploy to Firebase Hosting
```bash
npm run deploy:hosting
```
*Or run manually:*
```bash
npm run build
npx firebase-tools deploy --only hosting
```

Your app will be immediately live and globally distributed on:
👉 **`https://affable-state-txjsq.web.app`**
👉 **`https://affable-state-txjsq.firebaseapp.com`**

### Step 3 (Optional): Deploy Firestore Security Rules
To update or deploy the Zero-Trust database rules:
```bash
npm run deploy:rules
```

---

## 🧩 Architecture & Project Structure

```
├── firebase.json                # Firebase Hosting SPA routing & static asset config
├── .firebaserc                  # Firebase project linkage (affable-state-txjsq)
├── firestore.rules              # Zero-Trust ABAC security rules for Firestore
├── server.ts                    # Express backend with MCP RPC and compression APIs
├── server/
│   └── mcpServer.ts             # Claude Code Model Context Protocol tool definitions
├── src/
│   ├── App.tsx                  # Main application container & state orchestration
│   ├── firebase.ts              # Firebase Client SDK initialization & Google Auth
│   ├── types.ts                 # Shared TypeScript interfaces & memory types
│   ├── components/
│   │   ├── ContextCompressor.tsx   # Interactive context compaction workbench
│   │   ├── MemoryExplorer.tsx      # Semantic memory search & inspection
│   │   ├── TokenBudgetMeter.tsx    # Visual token allocation meter
│   │   ├── McpClaudeConnector.tsx  # Claude Code CLI configuration & JSON preview
│   │   ├── FirebaseCloudView.tsx   # Cloud sync, rules inspector, and hosting hub
│   │   └── ArchitectureGuide.tsx   # Technical deep-dive documentation
│   ├── services/
│   │   └── firestoreSync.ts     # Firestore real-time snapshot listeners & sync
│   └── utils/
│       └── tokenEstimator.ts    # Client-side heuristic compressor & vector embeddings
```

---

## 🔒 Security & Data Privacy

- **Data Ownership**: Architectural memories are stored either in local browser memory or in your isolated subcollection (`/users/{userId}/memories`).
- **Zero-Trust ABAC**: Security rules enforce `request.auth.uid == userId` for all read, write, and delete operations.
- **Edge Deployment**: Static client builds on Firebase Hosting communicate directly with Firestore using encrypted Google Auth tokens.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local full-stack server (Vite + Express) on port 3000 |
| `npm run build` | Compiles client SPA to `dist/` and bundles `server.ts` |
| `npm run start` | Boots production server from `dist/server.cjs` |
| `npm run deploy:hosting` | Builds production client and deploys to Firebase Hosting CDN |
| `npm run deploy:rules` | Deploys `firestore.rules` to Google Cloud Firestore |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## 📄 License

MIT © 2026 MemGovernor Engine Contributors.

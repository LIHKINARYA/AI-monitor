// Token estimation and Vector math utilities

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Standard approximation for code & markdown in GPT/Gemini tokenizers (~3.8 - 4.0 chars/token)
  return Math.ceil(text.length / 3.85);
}

// Generate deterministic local semantic embedding vector (64 dimensions)
// Based on hashed term frequency, character n-grams, and semantic buckets
export function generateLocalEmbedding(text: string, dimensions: number = 64): number[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9_ -]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  if (tokens.length === 0) return vector;

  tokens.forEach((token) => {
    // Hash token to dimension slot
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    // TF weighting with length boost for technical terms
    vector[idx] += 1.0 + Math.min(token.length * 0.1, 1.0);

    // Also hash bigrams for syntax continuity
    if (token.length > 3) {
      for (let j = 0; j < token.length - 2; j++) {
        const subHash = (token.charCodeAt(j) * 31 + token.charCodeAt(j + 1)) % dimensions;
        vector[subHash] += 0.25;
      }
    }
  });

  // L2 Normalize the vector so cosine similarity is simply dot product
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

// Cosine similarity between two unit-normalized vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

// Hybrid score combining BM25 keyword overlap and vector cosine
export function hybridSearchScore(query: string, itemText: string, queryVec: number[], itemVec: number[]): number {
  const cos = cosineSimilarity(queryVec, itemVec);

  const qTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const targetLower = itemText.toLowerCase();

  let matches = 0;
  for (const term of qTerms) {
    if (targetLower.includes(term)) matches++;
  }

  const keywordRatio = qTerms.length > 0 ? matches / qTerms.length : 0;

  // 60% semantic cosine + 40% exact keyword presence
  const finalScore = cos * 0.6 + keywordRatio * 0.4;
  return Math.min(0.99, Math.max(0.01, finalScore));
}

// Client-side heuristic compression fallback for static hosting environments
export function clientSideCompress(transcript: string, targetTokens: number = 6000) {
  const lines = transcript.split("\n");
  const prunedLines: string[] = [];
  let inMassiveOutput = false;
  let massiveOutputCount = 0;
  const decisions: string[] = [];
  const antiRegressionRules: string[] = [];
  const filesTouched = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const fileMatch = line.match(/(?:editing|viewing|created|modified|file)\s+['"`]?([a-zA-Z0-9_./\\-]+\.[a-zA-Z0-9]+)['"`]?/i);
    if (fileMatch) {
      filesTouched.add(fileMatch[1]);
    }

    if (line.match(/(?:decision|resolved|root cause|fix|selected|architecture|concluded|switch to)/i)) {
      decisions.push(line.trim());
    }
    if (line.match(/(?:must not|never|do not|invariant|bug|regression|failure)/i)) {
      antiRegressionRules.push(line.trim());
    }

    const isVerboseLog =
      line.includes("node_modules/") ||
      line.startsWith("    at ") ||
      line.includes("PASS ") ||
      line.includes("npm info") ||
      line.includes("yarn run v") ||
      (line.length > 250 && !line.includes("function") && !line.includes("class"));

    if (isVerboseLog) {
      massiveOutputCount++;
      if (!inMassiveOutput) {
        prunedLines.push(`[... System: compressed ${massiveOutputCount} redundant stack/log frames ...]`);
        inMassiveOutput = true;
      }
      continue;
    } else {
      if (inMassiveOutput) {
        inMassiveOutput = false;
        massiveOutputCount = 0;
      }
      prunedLines.push(line);
    }
  }

  const compressedRaw = prunedLines.join("\n");
  const originalTokens = estimateTokenCount(transcript);
  const compressedTokens = estimateTokenCount(compressedRaw);

  return {
    success: true,
    originalTokens,
    compressedTokens,
    compressionRatio: originalTokens > 0 ? ((1 - compressedTokens / originalTokens) * 100).toFixed(1) : "0",
    engine: "client-heuristic-compressor",
    data: {
      activeGoal: "Context Compaction Session",
      keyDecisions: decisions.slice(0, 8),
      antiRegressionRules: antiRegressionRules.slice(0, 8),
      filesTouched: Array.from(filesTouched),
      synthesizedMemory: compressedRaw.slice(0, 3500),
    },
  };
}

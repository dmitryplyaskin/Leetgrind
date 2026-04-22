import type { RagContextItem } from "@leetgrind/shared";

export interface DocumentChunkInput {
  documentId: string;
  content: string;
  maxChars?: number;
}

export interface DocumentChunk {
  documentId: string;
  ordinal: number;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown>;
}

export interface RagSearchCandidate {
  chunkId: string;
  documentId: string;
  title: string;
  sourceType: "resume" | "note" | "import" | "generated";
  source: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
}

export function chunkDocument(input: DocumentChunkInput): DocumentChunk[] {
  const maxChars = input.maxChars ?? 1200;
  const normalized = input.content.trim();
  const chunks: DocumentChunk[] = [];

  for (let offset = 0; offset < normalized.length; offset += maxChars) {
    const content = normalized.slice(offset, offset + maxChars).trim();

    if (content.length === 0) {
      continue;
    }

    chunks.push({
      documentId: input.documentId,
      ordinal: chunks.length,
      content,
      tokenCount: approximateTokenCount(content),
      metadata: {
        startOffset: offset,
        endOffset: Math.min(offset + maxChars, normalized.length)
      }
    });
  }

  return chunks;
}

export function rankContextCandidates({
  candidates,
  domain,
  limit,
  queryEmbedding
}: {
  candidates: RagSearchCandidate[];
  domain: "content" | "memory";
  limit: number;
  queryEmbedding: number[];
}): RagContextItem[] {
  return candidates
    .filter((candidate) => Array.isArray(candidate.embedding) && candidate.embedding.length > 0)
    .map((candidate) => {
      const score = cosineSimilarity(queryEmbedding, candidate.embedding ?? []);

      return {
        domain,
        documentId: candidate.documentId,
        chunkId: candidate.chunkId,
        title: candidate.title,
        sourceType: candidate.sourceType,
        source: candidate.source,
        excerpt: buildExcerpt(candidate.content),
        score,
        citationLabel: `${candidate.title}#${String(candidate.metadata.ordinal ?? 0).padStart(2, "0")}`,
        metadata: candidate.metadata
      } satisfies RagContextItem;
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function buildContextExcerpt(item: RagContextItem) {
  return `[${item.citationLabel}] ${item.title}: ${item.excerpt}`;
}

export function approximateTokenCount(input: string) {
  return Math.max(1, Math.ceil(input.trim().length / 4));
}

function buildExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  return normalized.length > 220 ? `${normalized.slice(0, 217)}...` : normalized;
}

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

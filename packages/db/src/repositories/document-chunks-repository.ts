import { and, asc, eq, inArray } from "drizzle-orm";
import type { DocumentChunk, DocumentSourceType } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { documentChunks, documents } from "../schema.js";

export interface ReplaceDocumentChunksInput {
  documentId: string;
  chunks: Array<{
    ordinal: number;
    content: string;
    tokenCount?: number | null;
    metadata?: Record<string, unknown>;
    embedding?: number[] | null;
  }>;
}

export interface DocumentChunkSearchCandidate {
  chunkId: string;
  content: string;
  documentId: string;
  title: string;
  sourceType: DocumentSourceType;
  source: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
}

export function createDocumentChunksRepository(db: LeetgrindDatabase) {
  return {
    async listByDocumentId(documentId: string): Promise<DocumentChunk[]> {
      const rows = await db
        .select()
        .from(documentChunks)
        .where(eq(documentChunks.documentId, documentId))
        .orderBy(asc(documentChunks.ordinal));

      return rows as DocumentChunk[];
    },

    async replaceForDocument(input: ReplaceDocumentChunksInput): Promise<DocumentChunk[]> {
      await db.delete(documentChunks).where(eq(documentChunks.documentId, input.documentId));

      if (input.chunks.length === 0) {
        return [];
      }

      const rows = await db
        .insert(documentChunks)
        .values(
          input.chunks.map((chunk) => ({
            documentId: input.documentId,
            ordinal: chunk.ordinal,
            content: chunk.content,
            tokenCount: chunk.tokenCount ?? null,
            metadata: chunk.metadata ?? {},
            embedding: chunk.embedding ?? null
          }))
        )
        .returning();

      return rows as DocumentChunk[];
    },

    async searchCandidates(input: {
      documentIds?: string[];
      sourceTypes?: DocumentSourceType[];
    }): Promise<DocumentChunkSearchCandidate[]> {
      const rows = await db
        .select({
          chunkId: documentChunks.id,
          content: documentChunks.content,
          documentId: documentChunks.documentId,
          title: documents.title,
          sourceType: documents.sourceType,
          source: documents.source,
          metadata: documentChunks.metadata,
          embedding: documentChunks.embedding
        })
        .from(documentChunks)
        .innerJoin(documents, eq(documents.id, documentChunks.documentId))
        .where(
          and(
            input.documentIds && input.documentIds.length > 0
              ? inArray(documentChunks.documentId, input.documentIds)
              : undefined,
            input.sourceTypes && input.sourceTypes.length > 0
              ? inArray(documents.sourceType, input.sourceTypes)
              : undefined
          )
        )
        .orderBy(asc(documents.createdAt), asc(documentChunks.ordinal));

      return rows as DocumentChunkSearchCandidate[];
    }
  };
}

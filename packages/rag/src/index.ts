export interface DocumentChunkInput {
  documentId: string;
  content: string;
  maxChars?: number;
}

export interface DocumentChunk {
  documentId: string;
  ordinal: number;
  content: string;
}

export function chunkDocument(input: DocumentChunkInput): DocumentChunk[] {
  const maxChars = input.maxChars ?? 1200;
  const chunks: DocumentChunk[] = [];

  for (let offset = 0; offset < input.content.length; offset += maxChars) {
    chunks.push({
      documentId: input.documentId,
      ordinal: chunks.length,
      content: input.content.slice(offset, offset + maxChars)
    });
  }

  return chunks;
}


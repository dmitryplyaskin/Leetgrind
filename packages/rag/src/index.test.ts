import { describe, expect, it } from "vitest";
import { chunkDocument, rankContextCandidates } from "./index";

describe("chunkDocument", () => {
  it("splits content into ordered chunks with source document id", () => {
    const chunks = chunkDocument({
      documentId: "doc-1",
      content: "abcdef",
      maxChars: 2
    });

    expect(chunks).toEqual([
      {
        documentId: "doc-1",
        ordinal: 0,
        content: "ab",
        tokenCount: 1,
        metadata: {
          startOffset: 0,
          endOffset: 2
        }
      },
      {
        documentId: "doc-1",
        ordinal: 1,
        content: "cd",
        tokenCount: 1,
        metadata: {
          startOffset: 2,
          endOffset: 4
        }
      },
      {
        documentId: "doc-1",
        ordinal: 2,
        content: "ef",
        tokenCount: 1,
        metadata: {
          startOffset: 4,
          endOffset: 6
        }
      }
    ]);
  });
});

describe("rankContextCandidates", () => {
  it("orders retrieved chunks by cosine similarity and returns citation metadata", () => {
    const ranked = rankContextCandidates({
      candidates: [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          title: "Resume",
          sourceType: "resume",
          source: "manual",
          content: "React hooks and TypeScript",
          metadata: {
            ordinal: 0
          },
          embedding: [1, 0]
        },
        {
          chunkId: "chunk-2",
          documentId: "doc-2",
          title: "Note",
          sourceType: "note",
          source: "manual",
          content: "Distributed systems notes",
          metadata: {
            ordinal: 1
          },
          embedding: [0, 1]
        }
      ],
      domain: "content",
      limit: 1,
      queryEmbedding: [1, 0]
    });

    expect(ranked).toEqual([
      expect.objectContaining({
        chunkId: "chunk-1",
        title: "Resume",
        citationLabel: "Resume#00",
        domain: "content"
      })
    ]);
  });
});

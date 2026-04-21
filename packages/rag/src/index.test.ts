import { describe, expect, it } from "vitest";
import { chunkDocument } from "./index";

describe("chunkDocument", () => {
  it("splits content into ordered chunks with source document id", () => {
    const chunks = chunkDocument({
      documentId: "doc-1",
      content: "abcdef",
      maxChars: 2
    });

    expect(chunks).toEqual([
      { documentId: "doc-1", ordinal: 0, content: "ab" },
      { documentId: "doc-1", ordinal: 1, content: "cd" },
      { documentId: "doc-1", ordinal: 2, content: "ef" }
    ]);
  });
});


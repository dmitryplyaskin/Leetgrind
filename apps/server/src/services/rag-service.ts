import type { Document } from "@leetgrind/domain";
import { chunkDocument, rankContextCandidates } from "@leetgrind/rag";
import type { RagContextItem, RagIngestInput, RagSearchInput } from "@leetgrind/shared";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider, toAgentRunSummary } from "./ai-service.js";

export async function ingestRagDocument(ctx: AppContext, input: RagIngestInput) {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx, input.providerId);
  const document = await resolveDocument(ctx, input);
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "ingestion",
    status: "running",
    providerId: setting.id,
    model: config.embeddingModel,
    input: {
      documentId: document.id,
      title: document.title,
      sourceType: document.sourceType
    },
    startedAt: new Date()
  });

  try {
    const chunks = chunkDocument({
      documentId: document.id,
      content: document.content
    });
    const embeddings = provider.embed
      ? await provider.embed({
          model: config.embeddingModel ?? "",
          input: chunks.map((chunk) => chunk.content)
        })
      : { vectors: [] as number[][] };
    const savedChunks = await ctx.database.repositories.documentChunks.replaceForDocument({
      documentId: document.id,
      chunks: chunks.map((chunk, index) => ({
        ordinal: chunk.ordinal,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        metadata: {
          ...chunk.metadata,
          domain: "content",
          ordinal: chunk.ordinal
        },
        embedding: embeddings.vectors[index] ?? null
      }))
    });
    const completedRun =
      (await ctx.database.repositories.agentRuns.update(run.id, {
        status: "succeeded",
        output: {
          chunkCount: savedChunks.length,
          documentId: document.id
        },
        completedAt: new Date()
      })) ?? run;

    return {
      document,
      chunkCount: savedChunks.length,
      run: toAgentRunSummary(completedRun)
    };
  } catch (error) {
    const completedRun =
      (await ctx.database.repositories.agentRuns.update(run.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Document ingestion failed.",
        completedAt: new Date()
      })) ?? run;

    throw Object.assign(error instanceof Error ? error : new Error("Document ingestion failed."), {
      run: toAgentRunSummary(completedRun)
    });
  }
}

export async function searchRagContext(
  ctx: AppContext,
  input: RagSearchInput
): Promise<RagContextItem[]> {
  if (input.domain === "memory") {
    return [];
  }

  const { config, provider } = await resolveRuntimeProvider(ctx, input.providerId);
  const embeddingResult = provider.embed
    ? await provider.embed({
        model: config.embeddingModel ?? "",
        input: [input.query]
      })
    : { vectors: [] as number[][] };
  const queryEmbedding = embeddingResult.vectors[0] ?? [];

  if (queryEmbedding.length === 0) {
    return [];
  }

  const candidates = await ctx.database.repositories.documentChunks.searchCandidates({
    sourceTypes: input.sourceTypes
  });

  return rankContextCandidates({
    candidates,
    domain: input.domain,
    limit: input.limit,
    queryEmbedding
  });
}

async function resolveDocument(ctx: AppContext, input: RagIngestInput): Promise<Document> {
  if ("documentId" in input) {
    const document = await ctx.database.repositories.documents.getById(input.documentId);

    if (!document) {
      throw new Error("The selected document does not exist.");
    }

    return document;
  }

  return ctx.database.repositories.documents.create({
    title: input.title,
    sourceType: input.sourceType,
    source: input.source,
    contentType: input.contentType,
    content: input.content,
    metadata: input.metadata
  });
}

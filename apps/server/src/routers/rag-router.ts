import { ragIngestInputSchema, ragSearchInputSchema } from "@leetgrind/shared";
import { publicProcedure, router } from "../trpc.js";
import { ingestRagDocument, searchRagContext } from "../services/rag-service.js";

export const ragDocumentsRouter = router({
  ingest: publicProcedure
    .input(ragIngestInputSchema)
    .mutation(({ ctx, input }) => ingestRagDocument(ctx, input)),

  search: publicProcedure
    .input(ragSearchInputSchema)
    .query(({ ctx, input }) => searchRagContext(ctx, input))
});

export const ragRouter = router({
  documents: ragDocumentsRouter
});

import { z } from "zod";
import { agentPreviewInputSchema } from "@leetgrind/shared";
import { publicProcedure, router } from "../trpc.js";
import { listRecentAgentRuns } from "../services/ai-service.js";
import { runMentorPreview } from "../services/agents-service.js";

export const agentsRouter = router({
  listRecentRuns: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).default(10)
        })
        .optional()
    )
    .query(({ ctx, input }) => listRecentAgentRuns(ctx, input?.limit ?? 10)),

  runPreview: publicProcedure
    .input(agentPreviewInputSchema)
    .mutation(({ ctx, input }) => runMentorPreview(ctx, input))
});

import {
  recommendationMutationInputSchema,
  refreshRecommendationsInputSchema
} from "@leetgrind/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import {
  acceptRecommendation,
  dismissRecommendation,
  refreshRecommendations
} from "../services/recommendations-service.js";

export const recommendationsRouter = router({
  listActive: publicProcedure
    .input(
      z
        .object({
          goalId: z.uuid().optional()
        })
        .optional()
    )
    .query(({ ctx, input }) =>
      ctx.database.repositories.recommendations.listActive({
        goalId: input?.goalId
      })
    ),

  refresh: publicProcedure
    .input(refreshRecommendationsInputSchema)
    .mutation(({ ctx, input }) => refreshRecommendations(ctx, input)),

  accept: publicProcedure
    .input(recommendationMutationInputSchema)
    .mutation(({ ctx, input }) => acceptRecommendation(ctx, input.recommendationId)),

  dismiss: publicProcedure
    .input(recommendationMutationInputSchema)
    .mutation(({ ctx, input }) => dismissRecommendation(ctx, input.recommendationId))
});

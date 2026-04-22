import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

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
    )
});

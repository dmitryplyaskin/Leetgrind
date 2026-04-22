import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

export const dashboardRouter = router({
  getSummary: publicProcedure
    .input(
      z
        .object({
          goalId: z.uuid().optional()
        })
        .optional()
    )
    .query(({ ctx, input }) =>
      ctx.database.repositories.dashboard.getSummary({
        goalId: input?.goalId
      })
    )
});

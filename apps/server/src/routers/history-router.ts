import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

export const historyRouter = router({
  listRecent: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional()
        })
        .optional()
    )
    .query(({ ctx, input }) =>
      ctx.database.repositories.dashboard.listRecentActivity({
        limit: input?.limit
      })
    )
});

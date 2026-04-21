import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

const skillInputSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  level: z.enum(["unknown", "weak", "developing", "strong"]).optional(),
  description: z.string().trim().min(1).nullable().optional()
});

export const skillsRouter = router({
  list: publicProcedure.query(({ ctx }) => ctx.database.repositories.skills.list()),

  upsertMany: publicProcedure
    .input(z.object({ skills: z.array(skillInputSchema).max(100) }))
    .mutation(({ ctx, input }) => ctx.database.repositories.skills.upsertMany(input.skills))
});

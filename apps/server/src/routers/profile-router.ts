import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

const profileInputSchema = z.object({
  displayName: z.string().trim().min(1).nullable().optional(),
  targetRole: z.string().trim().min(1).nullable().optional(),
  experienceLevel: z.enum(["beginner", "junior", "middle", "senior", "expert"]).nullable().optional(),
  resumeText: z.string().nullable().optional(),
  preferences: z.record(z.string(), z.unknown()).optional()
});

export const profileRouter = router({
  get: publicProcedure.query(({ ctx }) => ctx.database.repositories.userProfiles.get()),

  upsert: publicProcedure.input(profileInputSchema).mutation(({ ctx, input }) =>
    ctx.database.repositories.userProfiles.upsert(input)
  )
});

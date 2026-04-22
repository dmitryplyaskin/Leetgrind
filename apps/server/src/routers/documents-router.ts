import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

const createDocumentInputSchema = z.object({
  title: z.string().trim().min(1),
  sourceType: z.enum(["resume", "note", "import", "generated"]),
  source: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const documentsRouter = router({
  list: publicProcedure.query(({ ctx }) => ctx.database.repositories.documents.list()),

  create: publicProcedure.input(createDocumentInputSchema).mutation(async ({ ctx, input }) => {
    await ctx.database.repositories.userProfiles.ensureLocalProfile();
    return ctx.database.repositories.documents.create(input);
  }),

  createResumeDocument: publicProcedure
    .input(
      z.object({
        title: z.string().trim().min(1),
        content: z.string().trim().min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.database.repositories.userProfiles.ensureLocalProfile();
      return ctx.database.repositories.documents.upsertResume({
        profileId: profile.id,
        title: input.title,
        content: input.content,
        metadata: {
          createdBy: "documents-router"
        }
      });
  })
});

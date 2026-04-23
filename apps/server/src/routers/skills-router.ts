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

  getGraph: publicProcedure
    .input(
      z
        .object({
          goalId: z.uuid().optional()
        })
        .optional()
    )
    .query(({ ctx, input }) =>
      ctx.database.repositories.dashboard.getSkillGraph({
        goalId: input?.goalId
      })
    ),

  getDetail: publicProcedure
    .input(z.object({ skillId: z.uuid() }))
    .query(({ ctx, input }) =>
      ctx.database.repositories.dashboard.getSkillDetail({
        skillId: input.skillId
      })
    ),

  upsertMany: publicProcedure
    .input(z.object({ skills: z.array(skillInputSchema).max(100) }))
    .mutation(({ ctx, input }) => ctx.database.repositories.skills.upsertMany(input.skills)),

  selfAssess: publicProcedure
    .input(z.object({ skills: z.array(skillInputSchema).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const savedSkills = await ctx.database.repositories.skills.upsertMany(input.skills);
      const savedSkillsByTitle = new Map(
        savedSkills.map((skill) => [skill.title.trim().toLocaleLowerCase(), skill]),
      );

      return ctx.database.repositories.profileSkills.upsertMany(
        input.skills.map((skill) => {
          const savedSkill = savedSkillsByTitle.get(skill.title.trim().toLocaleLowerCase());

          if (!savedSkill) {
            throw new Error(`Could not resolve saved skill for ${skill.title}.`);
          }

          return {
            skillId: savedSkill.id,
            level: skill.level ?? "unknown",
            notes: skill.description ?? null,
          };
        }),
      );
    })
});

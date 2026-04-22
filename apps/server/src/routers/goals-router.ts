import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

const goalStatusSchema = z.enum(["active", "paused", "completed", "archived"]);

const createGoalInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).nullable().optional(),
  targetRole: z.string().trim().min(1).nullable().optional(),
  status: goalStatusSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const updateGoalInputSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  targetRole: z.string().trim().min(1).nullable().optional(),
  status: goalStatusSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const goalsRouter = router({
  list: publicProcedure.query(({ ctx }) => ctx.database.repositories.goals.list()),

  getReadiness: publicProcedure
    .input(z.object({ goalId: z.uuid() }))
    .query(({ ctx, input }) =>
      ctx.database.repositories.dashboard.getGoalReadiness({
        goalId: input.goalId
      })
    ),

  create: publicProcedure.input(createGoalInputSchema).mutation(async ({ ctx, input }) => {
    await ctx.database.repositories.userProfiles.ensureLocalProfile();
    return ctx.database.repositories.goals.create(input);
  }),

  createMany: publicProcedure
    .input(z.object({ goals: z.array(createGoalInputSchema).min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.database.repositories.userProfiles.ensureLocalProfile();
      return ctx.database.repositories.goals.createMany(input.goals);
    }),

  update: publicProcedure.input(updateGoalInputSchema).mutation(({ ctx, input }) => {
    const { id, ...goalInput } = input;
    return ctx.database.repositories.goals.update(id, goalInput);
  })
});

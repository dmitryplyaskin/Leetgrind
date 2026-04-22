import {
  generateLessonInputSchema,
  lessonIdInputSchema,
  lessonsListInputSchema
} from "@leetgrind/shared";
import { publicProcedure, router } from "../trpc.js";
import { generateLessons, getLesson, listLessons } from "../services/lessons-service.js";

export const lessonsRouter = router({
  list: publicProcedure
    .input(lessonsListInputSchema)
    .query(({ ctx, input }) => listLessons(ctx, input ?? {})),

  get: publicProcedure
    .input(lessonIdInputSchema)
    .query(({ ctx, input }) => getLesson(ctx, input.lessonId)),

  generate: publicProcedure
    .input(generateLessonInputSchema)
    .mutation(({ ctx, input }) => generateLessons(ctx, input))
});

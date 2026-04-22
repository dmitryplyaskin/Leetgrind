import {
  assessmentCreateSessionInputSchema,
  assessmentSessionInputSchema,
  assessmentSubmitAnswerInputSchema
} from "@leetgrind/shared";
import { publicProcedure, router } from "../trpc.js";
import {
  createAssessmentSession,
  finishAssessmentSession,
  getAssessmentSession,
  submitAssessmentAnswer
} from "../services/assessment-service.js";

export const assessmentsRouter = router({
  createSession: publicProcedure
    .input(assessmentCreateSessionInputSchema)
    .mutation(({ ctx, input }) => createAssessmentSession(ctx, input)),

  getSession: publicProcedure
    .input(assessmentSessionInputSchema)
    .query(({ ctx, input }) => getAssessmentSession(ctx, input.sessionId)),

  submitAnswer: publicProcedure
    .input(assessmentSubmitAnswerInputSchema)
    .mutation(({ ctx, input }) => submitAssessmentAnswer(ctx, input)),

  finishSession: publicProcedure
    .input(assessmentSessionInputSchema)
    .mutation(({ ctx, input }) => finishAssessmentSession(ctx, input.sessionId))
});

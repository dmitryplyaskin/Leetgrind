import { AssessmentMentorWorkflow } from "@leetgrind/agents";
import {
  scoreMultipleChoiceAnswer,
  type AssessmentAnswer,
  type AssessmentQuestion,
  type QuestionEvaluation
} from "@leetgrind/domain";
import { scheduleSm2Review } from "@leetgrind/scheduling";
import type {
  AssessmentCreateSessionInput,
  AssessmentResult,
  AssessmentSessionDetail,
  AssessmentSubmitAnswerInput
} from "@leetgrind/shared";
import type { AppContext } from "../context.js";
import { resolveRuntimeProvider } from "./ai-service.js";
import { generateLessons } from "./lessons-service.js";
import { searchRagContext } from "./rag-service.js";
import { refreshRecommendations } from "./recommendations-service.js";

function verdictFromScore(score: number): "excellent" | "pass" | "needs-work" | "fail" {
  if (score >= 85) return "excellent";
  if (score >= 65) return "pass";
  if (score >= 40) return "needs-work";
  return "fail";
}

function qualityFromScore(score: number) {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 55) return 3;
  if (score >= 35) return 2;
  return 1;
}

function buildDeterministicQuestionEvaluation(
  question: AssessmentQuestion,
  answer: AssessmentAnswer
): QuestionEvaluation {
  if (question.kind !== "multiple-choice" || answer.kind !== "multiple-choice") {
    throw new Error("Deterministic scoring is only available for multiple-choice answers.");
  }

  const score = scoreMultipleChoiceAnswer(question, answer);

  return {
    questionId: question.id,
    score: score.score,
    verdict:
      score.score === 1 ? "pass" : score.score >= 0.5 ? "needs-work" : "fail",
    feedback:
      score.score === 1
        ? "Correct selection."
        : `Missed ${score.missedChoiceIds.length} expected option(s) and selected ${score.unexpectedChoiceIds.length} unexpected option(s).`,
    strengths: score.score === 1 ? ["Selected the correct option set."] : [],
    gaps:
      score.score === 1
        ? []
        : [
            ...score.missedChoiceIds.map((choiceId) => `Missed option ${choiceId}`),
            ...score.unexpectedChoiceIds.map((choiceId) => `Unexpected option ${choiceId}`)
          ].slice(0, 4),
    citedContextIds: []
  };
}

function mergeQuestionEvaluations({
  questions,
  answers,
  aiEvaluations
}: {
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  aiEvaluations: QuestionEvaluation[];
}) {
  const aiByQuestionId = new Map(aiEvaluations.map((item) => [item.questionId, item]));

  return questions.map((question) => {
    const answer = answers.find((item) => item.questionId === question.id);

    if (!answer) {
      return {
        questionId: question.id,
        score: 0,
        verdict: "fail" as const,
        feedback: "No answer submitted.",
        strengths: [],
        gaps: ["No answer submitted."],
        citedContextIds: []
      };
    }

    if (question.kind === "multiple-choice" && answer.kind === "multiple-choice") {
      return buildDeterministicQuestionEvaluation(question, answer);
    }

    return (
      aiByQuestionId.get(question.id) ?? {
        questionId: question.id,
        score: 0.4,
        verdict: "needs-work" as const,
        feedback: "Answer needs manual follow-up.",
        strengths: [],
        gaps: ["AI evaluation did not return structured feedback."],
        citedContextIds: []
      }
    );
  });
}

function assessmentQuery(detail: {
  session: { focusPrompt: string | null };
  questions: AssessmentQuestion[];
}) {
  return detail.session.focusPrompt ?? detail.questions.map((question) => question.prompt).join(" ");
}

async function buildAssessmentResult(
  ctx: AppContext,
  sessionId: string
): Promise<AssessmentResult | null> {
  const detail = await ctx.database.repositories.assessmentSessions.getDetail(sessionId);

  if (!detail || !detail.session.evaluationId || !detail.session.attemptId) {
    return null;
  }

  const [evaluation, evidence, lessons, recommendations] = await Promise.all([
    ctx.database.repositories.evaluations.getById(detail.session.evaluationId),
    ctx.database.repositories.evidence.list(),
    ctx.database.repositories.learningItems.listLessons({
      skillId: detail.session.skillId ?? undefined,
      limit: 12
    }),
    ctx.database.repositories.recommendations.list()
  ]);

  if (!evaluation) {
    return null;
  }

  const linkedEvidence = evidence.filter((item) => item.sourceId === evaluation.id);
  const linkedEvidenceIds = new Set(linkedEvidence.map((item) => item.id));

  return {
    session: detail.session,
    overallScore: evaluation.score,
    verdict: evaluation.verdict,
    summary: evaluation.summary,
    evaluationId: evaluation.id,
    attemptId: detail.session.attemptId,
    evidence: linkedEvidence.map((item) => ({
      id: item.id,
      summary: item.summary,
      polarity: item.polarity,
      confidence: item.confidence,
      skillId: item.skillId,
      goalId: item.goalId,
      createdAt: item.createdAt
    })),
    questionEvaluations: (evaluation.payload.questionEvaluations as AssessmentResult["questionEvaluations"]) ?? [],
    lessons: lessons
      .filter((lesson) => {
        const evidenceIds = ((lesson.payload as { evidenceIds?: string[] }).evidenceIds ?? []).filter(Boolean);

        return evidenceIds.some((id) => linkedEvidenceIds.has(id));
      })
      .map((lesson) => ({
        id: lesson.id,
        kind: "lesson" as const,
        title: lesson.title,
        summary: lesson.summary,
        skillId: lesson.skillId,
        difficulty: lesson.difficulty,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      })),
    recommendations: recommendations.filter((recommendation) =>
      recommendation.evidenceIds.some((id) => linkedEvidenceIds.has(id))
    )
  };
}

export async function createAssessmentSession(
  ctx: AppContext,
  input: AssessmentCreateSessionInput
): Promise<AssessmentSessionDetail> {
  const { config, provider, setting } = await resolveRuntimeProvider(ctx);
  const [goal, skill] = await Promise.all([
    input.goalId ? ctx.database.repositories.goals.getById(input.goalId) : Promise.resolve(null),
    input.skillId ? ctx.database.repositories.skills.getById(input.skillId) : Promise.resolve(null)
  ]);
  const query = input.focusPrompt ?? skill?.title ?? goal?.title ?? "interview preparation";
  const contextItems = await searchRagContext(ctx, {
    query,
    limit: 4,
    domain: "content",
    providerId: setting.id,
    goalId: input.goalId
  });
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "assessment-mentor",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      goalId: input.goalId ?? null,
      skillId: input.skillId ?? null,
      contextItemIds: contextItems.map((item) => item.chunkId),
      focusPrompt: input.focusPrompt ?? null
    },
    startedAt: new Date()
  });
  const workflow = new AssessmentMentorWorkflow();

  try {
    const draft = await workflow.createSession({
      contextItems,
      goal,
      locale: input.locale,
      focusPrompt: input.focusPrompt ?? null,
      skill: skill ? { id: skill.id, title: skill.title, description: skill.description } : null,
      provider
    });
    const created = await ctx.database.repositories.assessmentSessions.create({
      goalId: input.goalId ?? null,
      skillId: input.skillId ?? null,
      locale: input.locale,
      title: draft.title,
      summary: draft.summary,
      difficulty: input.difficulty ?? null,
      focusPrompt: input.focusPrompt ?? null,
      questions: draft.questions
    });

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "succeeded",
      output: {
        sessionId: created.session.id,
        questionIds: created.questions.map((question) => question.id)
      },
      completedAt: new Date()
    });

    return {
      session: created.session,
      questions: created.questions,
      answers: [],
      result: null
    };
  } catch (error) {
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Assessment creation failed.",
      completedAt: new Date()
    });

    throw error;
  }
}

export async function getAssessmentSession(
  ctx: AppContext,
  sessionId: string
): Promise<AssessmentSessionDetail | null> {
  const detail = await ctx.database.repositories.assessmentSessions.getDetail(sessionId);

  if (!detail) {
    return null;
  }

  return {
    ...detail,
    result: await buildAssessmentResult(ctx, sessionId)
  };
}

export async function submitAssessmentAnswer(
  ctx: AppContext,
  input: AssessmentSubmitAnswerInput
) {
  const session = await ctx.database.repositories.assessmentSessions.getById(input.sessionId);

  if (!session) {
    throw new Error("Assessment session was not found.");
  }

  return ctx.database.repositories.assessmentSessions.upsertAnswer({
    sessionId: input.sessionId,
    questionId: input.answer.questionId,
    answer: input.answer
  });
}

export async function finishAssessmentSession(ctx: AppContext, sessionId: string) {
  const detail = await ctx.database.repositories.assessmentSessions.getDetail(sessionId);

  if (!detail) {
    throw new Error("Assessment session was not found.");
  }

  if (detail.session.status === "completed") {
    return getAssessmentSession(ctx, sessionId);
  }

  const answers = detail.answers.map((item) => item.answer);

  if (answers.length !== detail.questions.length) {
    throw new Error("Every assessment question must have an answer before finishing.");
  }

  const { config, provider, setting } = await resolveRuntimeProvider(ctx);
  const contextItems = await searchRagContext(ctx, {
    query: assessmentQuery(detail),
    limit: 4,
    domain: "content",
    providerId: setting.id,
    goalId: detail.session.goalId ?? undefined
  });
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "assessment-mentor",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      sessionId,
      contextItemIds: contextItems.map((item) => item.chunkId)
    },
    startedAt: new Date()
  });
  const workflow = new AssessmentMentorWorkflow();

  try {
    const evaluationResult = await workflow.evaluateSession({
      contextItems,
      locale: detail.session.locale,
      questions: detail.questions,
      answers,
      provider
    });
    const questionEvaluations = mergeQuestionEvaluations({
      questions: detail.questions,
      answers,
      aiEvaluations: evaluationResult.questionEvaluations as QuestionEvaluation[]
    });
    const overallScore = Math.round(
      (questionEvaluations.reduce((total, item) => total + item.score, 0) /
        Math.max(1, questionEvaluations.length)) *
        100
    );
    const verdict = verdictFromScore(overallScore);
    const attempt = await ctx.database.repositories.attempts.create({
      goalId: detail.session.goalId,
      skillId: detail.session.skillId,
      kind: "assessment",
      prompt: detail.session.title,
      response: {
        sessionId,
        answers
      }
    });
    const evaluation = await ctx.database.repositories.evaluations.create({
      attemptId: attempt.id,
      agentRunId: run.id,
      score: overallScore,
      verdict,
      summary: evaluationResult.summary,
      payload: {
        questionEvaluations,
        aiOverallScore: evaluationResult.overallScore,
        aiVerdict: evaluationResult.verdict,
        contextItemIds: contextItems.map((item) => item.chunkId)
      }
    });
    const evidence = await Promise.all(
      evaluationResult.evidence.map((item) =>
        ctx.database.repositories.evidence.create({
          goalId: detail.session.goalId,
          skillId: item.skillId ?? detail.session.skillId,
          sourceType: "evaluation",
          sourceId: evaluation.id,
          polarity: item.polarity,
          summary: item.summary,
          confidence: item.confidence
        })
      )
    );

    await Promise.all(
      questionEvaluations.map((item) =>
        ctx.database.repositories.assessmentSessions.upsertAnswer({
          sessionId,
          questionId: item.questionId,
          answer: answers.find((answer) => answer.questionId === item.questionId)!,
          score: item.score,
          feedback: item.feedback
        })
      )
    );

    if (detail.session.skillId) {
      const review = scheduleSm2Review(undefined, qualityFromScore(overallScore));

      await ctx.database.repositories.reviewSchedules.upsertForSkill({
        skillId: detail.session.skillId,
        state: overallScore >= 65 ? "review" : "learning",
        dueAt: review.dueAt,
        intervalDays: review.intervalDays,
        easeFactor: review.easinessFactor,
        repetitions: review.repetitions,
        lapses: overallScore >= 65 ? 0 : 1,
        lastReviewedAt: new Date()
      });
    }

    await ctx.database.repositories.assessmentSessions.update(sessionId, {
      attemptId: attempt.id,
      evaluationId: evaluation.id,
      status: "completed",
      summary: evaluationResult.summary,
      completedAt: new Date()
    });
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "succeeded",
      output: {
        attemptId: attempt.id,
        evaluationId: evaluation.id,
        evidenceIds: evidence.map((item) => item.id),
        questionEvaluations
      },
      completedAt: new Date()
    });

    await generateLessons(ctx, {
      goalId: detail.session.goalId ?? undefined,
      skillId: detail.session.skillId ?? undefined,
      locale: detail.session.locale,
      focusPrompt: `Follow up on assessment: ${detail.session.title}`,
      evidenceIds: evidence.map((item) => item.id)
    });
    await refreshRecommendations(ctx, {
      goalId: detail.session.goalId ?? undefined,
      skillId: detail.session.skillId ?? undefined,
      limit: 4
    });

    return getAssessmentSession(ctx, sessionId);
  } catch (error) {
    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Assessment evaluation failed.",
      completedAt: new Date()
    });

    throw error;
  }
}

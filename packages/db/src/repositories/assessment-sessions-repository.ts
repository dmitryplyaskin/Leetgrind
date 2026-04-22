import { desc, eq } from "drizzle-orm";
import type {
  AssessmentAnswer,
  AssessmentAnswerRecord,
  AssessmentQuestion,
  AssessmentSession,
  UserInterfaceLocale
} from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import {
  assessmentAnswers,
  assessmentQuestions,
  assessmentSessions
} from "../schema.js";
import { definedValues } from "./utils.js";

export interface CreateAssessmentSessionInput {
  profileId?: string;
  goalId?: string | null;
  skillId?: string | null;
  locale: UserInterfaceLocale;
  title: string;
  summary?: string | null;
  difficulty?: string | null;
  focusPrompt?: string | null;
  questions: AssessmentQuestion[];
}

export interface UpdateAssessmentSessionInput {
  attemptId?: string | null;
  evaluationId?: string | null;
  status?: AssessmentSession["status"];
  summary?: string | null;
  completedAt?: Date | null;
}

function questionToPayload(question: AssessmentQuestion) {
  const { id, kind, prompt, skillId, ...payload } = question;

  return payload;
}

function rowToQuestion(row: typeof assessmentQuestions.$inferSelect): AssessmentQuestion {
  return {
    id: row.id,
    kind: row.kind,
    prompt: row.prompt,
    skillId: row.skillId,
    ...(row.payload as Record<string, unknown>)
  } as AssessmentQuestion;
}

function rowToAnswer(row: typeof assessmentAnswers.$inferSelect): AssessmentAnswerRecord {
  return {
    id: row.id,
    sessionId: row.sessionId,
    questionId: row.questionId,
    answer: row.answer as AssessmentAnswer,
    score: row.score,
    feedback: row.feedback,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export function createAssessmentSessionsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<AssessmentSession[]> {
      const rows = await db
        .select()
        .from(assessmentSessions)
        .where(eq(assessmentSessions.profileId, profileId))
        .orderBy(desc(assessmentSessions.createdAt));

      return rows as AssessmentSession[];
    },

    async create(input: CreateAssessmentSessionInput) {
      const [session] = await db
        .insert(assessmentSessions)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          goalId: input.goalId ?? null,
          skillId: input.skillId ?? null,
          locale: input.locale,
          status: "in-progress",
          title: input.title,
          summary: input.summary ?? null,
          difficulty: input.difficulty ?? null,
          focusPrompt: input.focusPrompt ?? null
        })
        .returning();

      const questionRows = await db
        .insert(assessmentQuestions)
        .values(
          input.questions.map((question, index) => ({
            id: question.id,
            sessionId: session.id,
            ordinal: index,
            kind: question.kind,
            skillId: question.skillId,
            prompt: question.prompt,
            payload: questionToPayload(question)
          }))
        )
        .returning();

      return {
        session: session as AssessmentSession,
        questions: questionRows.map(rowToQuestion)
      };
    },

    async getById(sessionId: string): Promise<AssessmentSession | null> {
      const [session] = await db
        .select()
        .from(assessmentSessions)
        .where(eq(assessmentSessions.id, sessionId));

      return (session as AssessmentSession | undefined) ?? null;
    },

    async getDetail(sessionId: string) {
      const session = await this.getById(sessionId);

      if (!session) {
        return null;
      }

      const [questionRows, answerRows] = await Promise.all([
        db
          .select()
          .from(assessmentQuestions)
          .where(eq(assessmentQuestions.sessionId, sessionId)),
        db
          .select()
          .from(assessmentAnswers)
          .where(eq(assessmentAnswers.sessionId, sessionId))
      ]);

      return {
        session,
        questions: questionRows
          .slice()
          .sort((left, right) => left.ordinal - right.ordinal)
          .map(rowToQuestion),
        answers: answerRows.map(rowToAnswer)
      };
    },

    async upsertAnswer({
      sessionId,
      questionId,
      answer,
      score,
      feedback
    }: {
      sessionId: string;
      questionId: string;
      answer: AssessmentAnswer;
      score?: number | null;
      feedback?: string | null;
    }): Promise<AssessmentAnswerRecord> {
      const existing = await db
        .select()
        .from(assessmentAnswers)
        .where(eq(assessmentAnswers.sessionId, sessionId));
      const record = existing.find((item) => item.questionId === questionId);

      if (record) {
        const [updated] = await db
          .update(assessmentAnswers)
          .set({
            answer,
            score: score ?? null,
            feedback: feedback ?? null,
            updatedAt: new Date()
          })
          .where(eq(assessmentAnswers.id, record.id))
          .returning();

        return rowToAnswer(updated);
      }

      const [created] = await db
        .insert(assessmentAnswers)
        .values({
          sessionId,
          questionId,
          answer,
          score: score ?? null,
          feedback: feedback ?? null
        })
        .returning();

      return rowToAnswer(created);
    },

    async update(sessionId: string, input: UpdateAssessmentSessionInput): Promise<AssessmentSession | null> {
      const [session] = await db
        .update(assessmentSessions)
        .set(
          definedValues({
            ...input,
            updatedAt: new Date()
          })
        )
        .where(eq(assessmentSessions.id, sessionId))
        .returning();

      return (session as AssessmentSession | undefined) ?? null;
    }
  };
}

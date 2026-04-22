import { desc, eq } from "drizzle-orm";
import { type LearningItem, type LessonPayload } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { learningItems } from "../schema.js";

export interface CreateLessonInput {
  title: string;
  summary?: string | null;
  skillId?: string | null;
  difficulty?: string | null;
  payload: LessonPayload;
}

export function createLearningItemsRepository(db: LeetgrindDatabase) {
  return {
    async listLessons({
      skillId,
      limit = 12
    }: {
      skillId?: string;
      limit?: number;
    } = {}): Promise<LearningItem[]> {
      const rows = await db.select().from(learningItems).orderBy(desc(learningItems.createdAt));

      return (rows as LearningItem[])
        .filter((item) => item.kind === "lesson" && (!skillId || item.skillId === skillId))
        .slice(0, limit);
    },

    async getById(id: string): Promise<LearningItem | null> {
      const [item] = await db.select().from(learningItems).where(eq(learningItems.id, id));

      return (item as LearningItem | undefined) ?? null;
    },

    async createLesson(input: CreateLessonInput): Promise<LearningItem> {
      const [item] = await db
        .insert(learningItems)
        .values({
          kind: "lesson",
          title: input.title,
          summary: input.summary ?? null,
          skillId: input.skillId ?? null,
          difficulty: input.difficulty ?? null,
          payload: input.payload
        })
        .returning();

      return item as LearningItem;
    }
  };
}

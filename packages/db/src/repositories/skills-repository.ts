import { asc, inArray, sql } from "drizzle-orm";
import type { Skill, SkillLevel } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { skills } from "../schema.js";
import { slugifySkillTitle } from "./utils.js";

export interface UpsertSkillInput {
  slug?: string;
  title: string;
  level?: SkillLevel;
  description?: string | null;
}

export function createSkillsRepository(db: LeetgrindDatabase) {
  return {
    async list(): Promise<Skill[]> {
      const rows = await db.select().from(skills).orderBy(asc(skills.title));

      return rows as Skill[];
    },

    async upsertMany(input: UpsertSkillInput[]): Promise<Skill[]> {
      if (input.length === 0) {
        return [];
      }

      const rows = input.map((skill) => ({
        slug: skill.slug ?? slugifySkillTitle(skill.title),
        title: skill.title,
        level: skill.level ?? "unknown",
        description: skill.description ?? null,
        updatedAt: new Date()
      }));

      await db
        .insert(skills)
        .values(rows)
        .onConflictDoUpdate({
          target: skills.slug,
          set: {
            title: sql`excluded.title`,
            level: sql`excluded.level`,
            description: sql`excluded.description`,
            updatedAt: new Date()
          }
        });

      const slugs = rows.map((skill) => skill.slug);
      const saved = await db
        .select()
        .from(skills)
        .where(inArray(skills.slug, slugs))
        .orderBy(asc(skills.title));

      return saved as Skill[];
    }
  };
}

import { inArray } from "drizzle-orm";
import {
  commonSkillGraphTemplate,
  type SkillEdgeTemplate,
  type SkillTemplate
} from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { skillEdges, skills } from "../schema.js";

export interface SeedSkillGraphResult {
  skillCount: number;
  edgeCount: number;
}

export function createSkillGraphSeedRepository(db: LeetgrindDatabase) {
  return {
    async ensureCommonTemplates(): Promise<SeedSkillGraphResult> {
      const skillTemplates = commonSkillGraphTemplate.skills;
      const edgeTemplates = commonSkillGraphTemplate.edges;

      await insertMissingSkills(db, skillTemplates);
      const seededSkills = await db
        .select()
        .from(skills)
        .where(inArray(skills.slug, skillTemplates.map((skill) => skill.slug)));

      const skillIdBySlug = new Map(seededSkills.map((skill) => [skill.slug, skill.id]));

      await insertMissingEdges(db, edgeTemplates, skillIdBySlug);

      return {
        skillCount: skillTemplates.length,
        edgeCount: edgeTemplates.length
      };
    }
  };
}

async function insertMissingSkills(db: LeetgrindDatabase, templates: SkillTemplate[]) {
  if (templates.length === 0) {
    return;
  }

  await db
    .insert(skills)
    .values(
      templates.map((skill) => ({
        slug: skill.slug,
        title: skill.title,
        description: skill.description,
        level: "unknown" as const
      }))
    )
    .onConflictDoNothing({
      target: skills.slug
    });
}

async function insertMissingEdges(
  db: LeetgrindDatabase,
  templates: SkillEdgeTemplate[],
  skillIdBySlug: Map<string, string>
) {
  const rows = templates
    .map((edge) => {
      const fromSkillId = skillIdBySlug.get(edge.fromSlug);
      const toSkillId = skillIdBySlug.get(edge.toSlug);

      if (!fromSkillId || !toSkillId) {
        return null;
      }

      return {
        fromSkillId,
        toSkillId,
        relation: edge.relation,
        weight: edge.weight
      };
    })
    .filter((edge): edge is NonNullable<typeof edge> => edge !== null);

  if (rows.length === 0) {
    return;
  }

  await db
    .insert(skillEdges)
    .values(rows)
    .onConflictDoNothing({
      target: [skillEdges.fromSkillId, skillEdges.toSkillId, skillEdges.relation]
    });
}

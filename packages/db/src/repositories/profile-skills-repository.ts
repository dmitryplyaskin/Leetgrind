import { and, asc, eq, sql } from "drizzle-orm";
import {
  LOCAL_USER_PROFILE_ID,
  commonSkillGraphTemplate,
  type ProfileSkill,
  type Skill,
  type SkillLevel,
} from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { profileSkills, skills } from "../schema.js";
import { createUserProfileRepository } from "./user-profile-repository.js";

export interface UpsertProfileSkillInput {
  skillId: string;
  level: SkillLevel;
  notes?: string | null;
}

export interface ListedProfileSkill extends ProfileSkill {
  skill: Skill;
}

const templateDescriptionBySlug = new Map(
  commonSkillGraphTemplate.skills.map((skill) => [skill.slug, skill.description ?? null]),
);

function normalizeNotes(skill: Skill) {
  if (!skill.description) {
    return null;
  }

  const templateDescription = templateDescriptionBySlug.get(skill.slug) ?? null;

  return skill.description === templateDescription ? null : skill.description;
}

function shouldBackfillLegacySkill(skill: Skill) {
  return skill.level !== "unknown" || normalizeNotes(skill) !== null;
}

export function createProfileSkillsRepository(db: LeetgrindDatabase) {
  return {
    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<ListedProfileSkill[]> {
      const rows = await db
        .select({
          profileSkill: profileSkills,
          skill: skills,
        })
        .from(profileSkills)
        .innerJoin(
          skills,
          eq(profileSkills.skillId, skills.id),
        )
        .where(eq(profileSkills.profileId, profileId))
        .orderBy(asc(skills.title));

      return rows.map(({ profileSkill, skill }) => ({
        ...(profileSkill as ProfileSkill),
        skill: skill as Skill,
      }));
    },

    async replaceMany(
      input: UpsertProfileSkillInput[],
      profileId = LOCAL_USER_PROFILE_ID,
    ): Promise<ListedProfileSkill[]> {
      await db.delete(profileSkills).where(eq(profileSkills.profileId, profileId));

      if (input.length === 0) {
        return [];
      }

      await db.insert(profileSkills).values(
        input.map((profileSkill) => ({
          profileId,
          skillId: profileSkill.skillId,
          level: profileSkill.level,
          notes: profileSkill.notes ?? null,
          updatedAt: new Date(),
        })),
      );

      return this.list(profileId);
    },

    async upsertMany(
      input: UpsertProfileSkillInput[],
      profileId = LOCAL_USER_PROFILE_ID,
    ): Promise<ListedProfileSkill[]> {
      if (input.length === 0) {
        return [];
      }

      await db
        .insert(profileSkills)
        .values(
          input.map((profileSkill) => ({
            profileId,
            skillId: profileSkill.skillId,
            level: profileSkill.level,
            notes: profileSkill.notes ?? null,
            updatedAt: new Date(),
          })),
        )
        .onConflictDoUpdate({
          target: [profileSkills.profileId, profileSkills.skillId],
          set: {
            level: sql`excluded.level`,
            notes: sql`excluded.notes`,
            updatedAt: new Date(),
          },
        });

      return this.list(profileId);
    },

    async backfillLegacyRecords(profileId = LOCAL_USER_PROFILE_ID): Promise<ListedProfileSkill[]> {
      await createUserProfileRepository(db).ensureLocalProfile();
      const legacySkills = await db.select().from(skills);

      const missingRows = legacySkills.filter(shouldBackfillLegacySkill);

      if (missingRows.length === 0) {
        return this.list(profileId);
      }

      const existingRows = await db
        .select()
        .from(profileSkills)
        .where(eq(profileSkills.profileId, profileId));
      const existingSkillIds = new Set(existingRows.map((row) => row.skillId));
      const backfillRows = missingRows.filter((skill) => !existingSkillIds.has(skill.id));

      if (backfillRows.length > 0) {
        await db.insert(profileSkills).values(
          backfillRows.map((skill) => ({
            profileId,
            skillId: skill.id,
            level: skill.level,
            notes: normalizeNotes(skill),
          })),
        );
      }

      return this.list(profileId);
    },

    async getBySkillId(
      skillId: string,
      profileId = LOCAL_USER_PROFILE_ID,
    ): Promise<ListedProfileSkill | null> {
      const [row] = await db
        .select({
          profileSkill: profileSkills,
          skill: skills,
        })
        .from(profileSkills)
        .innerJoin(skills, eq(profileSkills.skillId, skills.id))
        .where(
          and(eq(profileSkills.profileId, profileId), eq(profileSkills.skillId, skillId)),
        )
        .limit(1);

      if (!row) {
        return null;
      }

      return {
        ...(row.profileSkill as ProfileSkill),
        skill: row.skill as Skill,
      };
    },
  };
}

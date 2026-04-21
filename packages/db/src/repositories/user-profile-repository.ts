import { eq } from "drizzle-orm";
import type { ExperienceLevel, UserProfile } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { userProfiles } from "../schema.js";
import { definedValues } from "./utils.js";

export interface UpsertUserProfileInput {
  id?: string;
  displayName?: string | null;
  targetRole?: string | null;
  experienceLevel?: ExperienceLevel | null;
  resumeText?: string | null;
  preferences?: Record<string, unknown>;
}

export function createUserProfileRepository(db: LeetgrindDatabase) {
  const repository = {
    async get(id = LOCAL_USER_PROFILE_ID): Promise<UserProfile | null> {
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id))
        .limit(1);

      return (profile as UserProfile | undefined) ?? null;
    },

    async ensureLocalProfile(): Promise<UserProfile> {
      return repository.upsert({ id: LOCAL_USER_PROFILE_ID });
    },

    async upsert(input: UpsertUserProfileInput): Promise<UserProfile> {
      const now = new Date();
      const id = input.id ?? LOCAL_USER_PROFILE_ID;
      const [profile] = await db
        .insert(userProfiles)
        .values({
          id,
          displayName: input.displayName ?? null,
          targetRole: input.targetRole ?? null,
          experienceLevel: input.experienceLevel ?? null,
          resumeText: input.resumeText ?? null,
          preferences: input.preferences ?? {},
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: userProfiles.id,
          set: definedValues({
            displayName: input.displayName,
            targetRole: input.targetRole,
            experienceLevel: input.experienceLevel,
            resumeText: input.resumeText,
            preferences: input.preferences,
            updatedAt: now
          })
        })
        .returning();

      return profile as UserProfile;
    }
  };

  return repository;
}

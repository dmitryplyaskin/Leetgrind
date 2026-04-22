import { and, desc, eq } from "drizzle-orm";
import type { Document, DocumentSourceType } from "@leetgrind/domain";
import { LOCAL_USER_PROFILE_ID } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { documents } from "../schema.js";

export interface CreateDocumentInput {
  profileId?: string;
  title: string;
  sourceType: DocumentSourceType;
  source: string;
  contentType: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export function createDocumentsRepository(db: LeetgrindDatabase) {
  const repository = {
    async getById(id: string): Promise<Document | null> {
      const [document] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);

      return (document as Document | undefined) ?? null;
    },

    async list(profileId = LOCAL_USER_PROFILE_ID): Promise<Document[]> {
      const rows = await db
        .select()
        .from(documents)
        .where(eq(documents.profileId, profileId))
        .orderBy(desc(documents.createdAt));

      return rows as Document[];
    },

    async listBySourceType(
      sourceType: DocumentSourceType,
      profileId = LOCAL_USER_PROFILE_ID
    ): Promise<Document[]> {
      const rows = await db
        .select()
        .from(documents)
        .where(and(eq(documents.profileId, profileId), eq(documents.sourceType, sourceType)))
        .orderBy(desc(documents.createdAt));

      return rows as Document[];
    },

    async create(input: CreateDocumentInput): Promise<Document> {
      const [document] = await db
        .insert(documents)
        .values({
          profileId: input.profileId ?? LOCAL_USER_PROFILE_ID,
          title: input.title,
          sourceType: input.sourceType,
          source: input.source,
          contentType: input.contentType,
          content: input.content,
          metadata: input.metadata ?? {}
        })
        .returning();

      return document as Document;
    },

    async upsertResume(input: {
      profileId?: string;
      title: string;
      content: string;
      metadata?: Record<string, unknown>;
    }): Promise<Document> {
      const profileId = input.profileId ?? LOCAL_USER_PROFILE_ID;
      const [existing] = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.profileId, profileId),
            eq(documents.sourceType, "resume"),
            eq(documents.source, "manual-onboarding")
          )
        )
        .orderBy(desc(documents.createdAt))
        .limit(1);

      if (!existing) {
        return repository.create({
          profileId,
          title: input.title,
          sourceType: "resume",
          source: "manual-onboarding",
          contentType: "text/plain",
          content: input.content,
          metadata: input.metadata
        });
      }

      const [document] = await db
        .update(documents)
        .set({
          title: input.title,
          content: input.content,
          metadata: input.metadata ?? existing.metadata
        })
        .where(eq(documents.id, existing.id))
        .returning();

      return document as Document;
    }
  };

  return repository;
}

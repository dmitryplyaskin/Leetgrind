import { asc, desc, eq } from "drizzle-orm";
import type { ProviderSettings } from "@leetgrind/domain";
import type { LeetgrindDatabase } from "../pglite.js";
import { providerSettings } from "../schema.js";

export interface SaveProviderSettingsInput {
  id?: string;
  kind: ProviderSettings["kind"];
  displayName: string;
  isDefault?: boolean;
  config?: Record<string, unknown>;
}

export function createProviderSettingsRepository(db: LeetgrindDatabase) {
  return {
    async getById(id: string): Promise<ProviderSettings | null> {
      const [setting] = await db
        .select()
        .from(providerSettings)
        .where(eq(providerSettings.id, id))
        .limit(1);

      return (setting as ProviderSettings | undefined) ?? null;
    },

    async getDefault(): Promise<ProviderSettings | null> {
      const [setting] = await db
        .select()
        .from(providerSettings)
        .where(eq(providerSettings.isDefault, true))
        .orderBy(desc(providerSettings.updatedAt))
        .limit(1);

      return (setting as ProviderSettings | undefined) ?? null;
    },

    async list(): Promise<ProviderSettings[]> {
      const rows = await db.select().from(providerSettings).orderBy(
        desc(providerSettings.isDefault),
        asc(providerSettings.displayName)
      );

      return rows as ProviderSettings[];
    },

    async remove(id: string): Promise<void> {
      await db.delete(providerSettings).where(eq(providerSettings.id, id));
    },

    async save(input: SaveProviderSettingsInput): Promise<ProviderSettings> {
      if (input.id) {
        const [saved] = await db
          .update(providerSettings)
          .set({
            kind: input.kind,
            displayName: input.displayName,
            isDefault: input.isDefault ?? false,
            config: input.config ?? {},
            updatedAt: new Date()
          })
          .where(eq(providerSettings.id, input.id))
          .returning();

        return saved as ProviderSettings;
      }

      const [saved] = await db
        .insert(providerSettings)
        .values({
          kind: input.kind,
          displayName: input.displayName,
          isDefault: input.isDefault ?? false,
          config: input.config ?? {}
        })
        .returning();

      return saved as ProviderSettings;
    },

    async setDefault(id: string): Promise<ProviderSettings | null> {
      await db.update(providerSettings).set({ isDefault: false });

      const [saved] = await db
        .update(providerSettings)
        .set({
          isDefault: true,
          updatedAt: new Date()
        })
        .where(eq(providerSettings.id, id))
        .returning();

      return (saved as ProviderSettings | undefined) ?? null;
    }
  };
}

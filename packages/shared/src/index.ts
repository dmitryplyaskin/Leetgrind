import { z } from "zod";

export const idSchema = z.string().min(1);

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const appConfigSchema = z.object({
  databaseUrl: z.string().optional(),
  defaultAiProviderId: z.string().optional()
});

export type AppConfig = z.infer<typeof appConfigSchema>;


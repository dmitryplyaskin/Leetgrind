import { z } from "zod";

export const idSchema = z.string().min(1);
export const uuidSchema = z.uuid();
export const nonEmptyStringSchema = z.string().trim().min(1);
export const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const appConfigSchema = z.object({
  databaseUrl: z.string().optional(),
  defaultAiProviderId: z.string().optional()
});

export type AppConfig = z.infer<typeof appConfigSchema>;

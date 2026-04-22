import {
  providerIdInputSchema,
  saveAiProviderInputSchema,
  testAiProviderInputSchema
} from "@leetgrind/shared";
import { publicProcedure, router } from "../trpc.js";
import {
  getAiSettings,
  listAiProviders,
  removeAiProvider,
  saveAiProvider,
  setDefaultAiProvider,
  testAiProvider
} from "../services/ai-service.js";

export const aiProvidersRouter = router({
  list: publicProcedure.query(({ ctx }) => listAiProviders(ctx)),

  save: publicProcedure
    .input(saveAiProviderInputSchema)
    .mutation(({ ctx, input }) => saveAiProvider(ctx, input)),

  remove: publicProcedure
    .input(providerIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      await removeAiProvider(ctx, input.providerId);
      return {
        ok: true
      };
    }),

  setDefault: publicProcedure
    .input(providerIdInputSchema)
    .mutation(({ ctx, input }) => setDefaultAiProvider(ctx, input.providerId)),

  test: publicProcedure
    .input(testAiProviderInputSchema)
    .mutation(({ ctx, input }) => testAiProvider(ctx, input.providerId))
});

export const aiSettingsRouter = router({
  get: publicProcedure.query(({ ctx }) => getAiSettings(ctx))
});

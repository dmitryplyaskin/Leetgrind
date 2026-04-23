import {
  AiProviderError,
  DEFAULT_OPENROUTER_EMBEDDING_MODEL,
  DEFAULT_OPENROUTER_TEXT_MODEL
} from "@leetgrind/ai";
import type { AgentRun, ProviderSettings } from "@leetgrind/domain";
import type {
  AgentRunSummary,
  AiProviderConfig,
  AiProviderHealth,
  AiModelSummary,
  AiProviderSummary,
  AiSettings,
  DiscoverOpenRouterModelsInput,
  DiscoverOpenRouterModelsResult,
  SaveAiProviderInput
} from "@leetgrind/shared";
import { aiProviderConfigSchema } from "@leetgrind/shared";
import type { AppContext } from "../context.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeProviderConfig(config: unknown): AiProviderConfig {
  return aiProviderConfigSchema.parse({
    textModel: DEFAULT_OPENROUTER_TEXT_MODEL,
    embeddingModel: DEFAULT_OPENROUTER_EMBEDDING_MODEL,
    appName: "Leetgrind",
    appUrl: "https://leetgrind.local",
    ...(isRecord(config) ? config : {})
  });
}

export function toAgentRunSummary(run: AgentRun): AgentRunSummary {
  return {
    id: run.id,
    kind: run.kind,
    status: run.status,
    providerId: run.providerId,
    model: run.model,
    error: run.error,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt
  };
}

async function toProviderSummary(
  ctx: AppContext,
  setting: ProviderSettings
): Promise<AiProviderSummary> {
  const config = normalizeProviderConfig(setting.config);

  return {
    id: setting.id,
    kind: setting.kind,
    displayName: setting.displayName,
    isDefault: setting.isDefault,
    hasSecret: await ctx.credentialStore.hasSecret(setting.id),
    isImplemented: ctx.aiRegistry.isImplemented(setting.kind),
    config,
    capabilities: ctx.aiRegistry.getCapabilities(setting.kind),
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt
  };
}

export async function getAiSettings(ctx: AppContext): Promise<AiSettings> {
  const providers = await listAiProviders(ctx);

  return {
    defaultProviderId: providers.find((provider) => provider.isDefault)?.id ?? null,
    providers
  };
}

interface OpenRouterModelRecord {
  id?: unknown;
  name?: unknown;
  architecture?: {
    output_modalities?: unknown;
  };
  supported_parameters?: unknown;
}

function toOpenRouterModelSummary(model: OpenRouterModelRecord): AiModelSummary | null {
  if (typeof model.id !== "string" || model.id.trim().length === 0) {
    return null;
  }

  const outputModalities = Array.isArray(model.architecture?.output_modalities)
    ? model.architecture.output_modalities
    : [];
  const supportedParameters = Array.isArray(model.supported_parameters)
    ? model.supported_parameters
    : [];
  const supportsEmbeddings = outputModalities.includes("embeddings");

  return {
    id: model.id,
    displayName: typeof model.name === "string" && model.name.trim().length > 0 ? model.name : model.id,
    supportsTextGeneration: !supportsEmbeddings,
    supportsStructuredOutput:
      supportedParameters.includes("response_format") ||
      supportedParameters.includes("structured_outputs") ||
      !supportsEmbeddings,
    supportsEmbeddings
  };
}

function pickPreferredModel(models: AiModelSummary[], preferredIds: string[]) {
  for (const preferredId of preferredIds) {
    const model = models.find((item) => item.id === preferredId);

    if (model) {
      return model.id;
    }
  }

  return models[0]?.id ?? null;
}

async function fetchOpenRouterModels(apiKey: string, modality: "text" | "embeddings") {
  const url =
    modality === "text"
      ? "https://openrouter.ai/api/v1/models"
      : "https://openrouter.ai/api/v1/models?output_modalities=embeddings";
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://leetgrind.local",
      "X-Title": "Leetgrind"
    }
  });

  if (!response.ok) {
    throw new AiProviderError({
      code: "invalid-configuration",
      message: `OpenRouter model discovery failed with HTTP ${response.status}.`
    });
  }

  const payload = (await response.json()) as { data?: OpenRouterModelRecord[] };

  return (payload.data ?? []).map(toOpenRouterModelSummary).filter((item): item is AiModelSummary => item !== null);
}

export async function discoverOpenRouterModels(
  ctx: AppContext,
  input: DiscoverOpenRouterModelsInput
): Promise<DiscoverOpenRouterModelsResult> {
  const apiKey =
    input.apiKey ??
    (input.providerId ? await ctx.credentialStore.getSecret(input.providerId) : null);

  if (!apiKey) {
    throw new AiProviderError({
      code: "missing-credentials",
      message: "OpenRouter API key is not configured."
    });
  }

  const [textModels, embeddingModels] = await Promise.all([
    fetchOpenRouterModels(apiKey, "text"),
    fetchOpenRouterModels(apiKey, "embeddings")
  ]);
  const recommendedTextModel = pickPreferredModel(textModels, [
    DEFAULT_OPENROUTER_TEXT_MODEL,
    "openai/gpt-4o-mini",
    "openrouter/auto"
  ]);
  const recommendedEmbeddingModel = pickPreferredModel(embeddingModels, [
    DEFAULT_OPENROUTER_EMBEDDING_MODEL,
    "openai/text-embedding-3-small"
  ]);

  if (!recommendedTextModel) {
    throw new AiProviderError({
      code: "invalid-configuration",
      message: "OpenRouter did not return any text-capable models."
    });
  }

  return {
    textModels,
    embeddingModels,
    recommendedTextModel,
    recommendedEmbeddingModel
  };
}

export async function listAiProviders(ctx: AppContext): Promise<AiProviderSummary[]> {
  const settings = await ctx.database.repositories.providerSettings.list();

  return Promise.all(settings.map((setting) => toProviderSummary(ctx, setting)));
}

export async function listRecentAgentRuns(ctx: AppContext, limit = 10): Promise<AgentRunSummary[]> {
  const runs = await ctx.database.repositories.agentRuns.listRecent(limit);

  return runs.map(toAgentRunSummary);
}

export async function removeAiProvider(ctx: AppContext, providerId: string): Promise<void> {
  const existing = await ctx.database.repositories.providerSettings.getById(providerId);

  if (!existing) {
    return;
  }

  await ctx.credentialStore.deleteSecret(providerId);
  await ctx.database.repositories.providerSettings.remove(providerId);

  if (existing.isDefault) {
    const [fallback] = await ctx.database.repositories.providerSettings.list();

    if (fallback) {
      await ctx.database.repositories.providerSettings.setDefault(fallback.id);
    }
  }
}

export async function resolveRuntimeProvider(ctx: AppContext, providerId?: string) {
  const setting =
    (providerId
      ? await ctx.database.repositories.providerSettings.getById(providerId)
      : await ctx.database.repositories.providerSettings.getDefault()) ?? null;

  if (!setting) {
    throw new AiProviderError({
      code: "invalid-configuration",
      message: "No AI provider is configured."
    });
  }

  const config = normalizeProviderConfig(setting.config);
  const secret = await ctx.credentialStore.getSecret(setting.id);
  const provider = ctx.aiRegistry.createProvider({
    id: setting.id,
    kind: setting.kind,
    displayName: setting.displayName,
    config,
    secret
  });

  return {
    config,
    provider,
    setting
  };
}

export async function saveAiProvider(
  ctx: AppContext,
  input: SaveAiProviderInput
): Promise<AiProviderSummary> {
  if (input.kind !== "openrouter") {
    throw new AiProviderError({
      code: "not-implemented",
      message: `Provider kind "${input.kind}" is planned but not implemented in phase 04.`
    });
  }

  const currentDefault = await ctx.database.repositories.providerSettings.getDefault();
  const config = normalizeProviderConfig({
    textModel: input.textModel,
    embeddingModel: input.embeddingModel,
    appName: input.appName,
    appUrl: input.appUrl
  });
  const saved = await ctx.database.repositories.providerSettings.save({
    id: input.id,
    kind: input.kind,
    displayName: input.displayName,
    isDefault: false,
    config
  });

  if (input.apiKey) {
    await ctx.credentialStore.setSecret(saved.id, input.apiKey);
  } else if (!(await ctx.credentialStore.hasSecret(saved.id))) {
    throw new AiProviderError({
      code: "missing-credentials",
      message: "OpenRouter API key is not configured.",
      providerId: saved.id
    });
  }

  const finalSetting =
    input.isDefault || !currentDefault || currentDefault.id === saved.id
      ? await ctx.database.repositories.providerSettings.setDefault(saved.id)
      : saved;

  return toProviderSummary(ctx, finalSetting ?? saved);
}

export async function setDefaultAiProvider(
  ctx: AppContext,
  providerId: string
): Promise<AiProviderSummary> {
  const saved = await ctx.database.repositories.providerSettings.setDefault(providerId);

  if (!saved) {
    throw new AiProviderError({
      code: "invalid-configuration",
      message: "The selected provider does not exist.",
      providerId
    });
  }

  return toProviderSummary(ctx, saved);
}

export async function testAiProvider(ctx: AppContext, providerId: string): Promise<AiProviderHealth> {
  const setting = await ctx.database.repositories.providerSettings.getById(providerId);

  if (!setting) {
    throw new AiProviderError({
      code: "invalid-configuration",
      message: "The selected provider does not exist.",
      providerId
    });
  }

  const config = normalizeProviderConfig(setting.config);
  const run = await ctx.database.repositories.agentRuns.create({
    kind: "provider-test",
    status: "running",
    providerId: setting.id,
    model: config.textModel,
    input: {
      providerId: setting.id,
      kind: setting.kind
    },
    startedAt: new Date()
  });

  try {
    const { provider } = await resolveRuntimeProvider(ctx, providerId);
    const health = await provider.healthCheck({
      model: config.textModel
    });

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: health.status === "ok" ? "succeeded" : "failed",
      output: {
        health
      },
      error: health.status === "ok" ? null : health.message,
      completedAt: new Date()
    });

    return health;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider test failed.";
    const health: AiProviderHealth = {
      providerId: setting.id,
      status: "error",
      checkedAt: new Date(),
      latencyMs: null,
      message,
      model: config.textModel,
      capabilities: ctx.aiRegistry.getCapabilities(setting.kind)
    };

    await ctx.database.repositories.agentRuns.update(run.id, {
      status: "failed",
      output: {
        health
      },
      error: message,
      completedAt: new Date()
    });

    return health;
  }
}

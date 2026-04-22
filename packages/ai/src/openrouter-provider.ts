import { embedMany, generateObject, generateText, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { AiProviderCapabilities, AiProviderConfig, AiProviderHealth } from "@leetgrind/shared";
import { z } from "zod";
import {
  DEFAULT_OPENROUTER_EMBEDDING_MODEL,
  DEFAULT_OPENROUTER_TEXT_MODEL,
  OPENROUTER_MODEL_CATALOG,
  getProviderCapabilities,
  type AiModel
} from "./catalog.js";
import { AiProviderError, normalizeAiError } from "./errors.js";
import type {
  AiEmbeddingRequest,
  AiEmbeddingResult,
  AiObjectRequest,
  AiProvider,
  AiProviderCreateParams,
  AiTextRequest,
  AiTextResult,
  AiTextChunk
} from "./provider.js";

function resolveTextModel(config: AiProviderConfig, override?: string) {
  return override ?? config.textModel ?? DEFAULT_OPENROUTER_TEXT_MODEL;
}

function resolveEmbeddingModel(config: AiProviderConfig, override?: string) {
  return override ?? config.embeddingModel ?? DEFAULT_OPENROUTER_EMBEDDING_MODEL;
}

function ensureSecret(secret: string | null, providerId: string) {
  if (typeof secret === "string" && secret.trim().length > 0) {
    return secret;
  }

  throw new AiProviderError({
    code: "missing-credentials",
    message: "OpenRouter API key is not configured.",
    providerId
  });
}

export class OpenRouterAiProvider implements AiProvider {
  readonly id: string;
  readonly kind = "openrouter" as const;
  readonly displayName: string;
  readonly capabilities: AiProviderCapabilities;

  private readonly config: AiProviderConfig;
  private readonly secret: string;
  private readonly fetchImplementation?: typeof fetch;

  constructor({ id, displayName, config, secret, fetch }: AiProviderCreateParams) {
    this.id = id;
    this.displayName = displayName;
    this.config = {
      textModel: config.textModel || DEFAULT_OPENROUTER_TEXT_MODEL,
      embeddingModel: config.embeddingModel ?? DEFAULT_OPENROUTER_EMBEDDING_MODEL,
      appName: config.appName ?? "Leetgrind",
      appUrl: config.appUrl ?? "https://leetgrind.local"
    };
    this.secret = ensureSecret(secret, id);
    this.fetchImplementation = fetch;
    this.capabilities = getProviderCapabilities("openrouter");
  }

  async listModels(): Promise<AiModel[]> {
    return OPENROUTER_MODEL_CATALOG;
  }

  async generateText(input: AiTextRequest): Promise<AiTextResult> {
    try {
      const provider = this.createProvider();
      const result = await generateText({
        model: provider.chat(resolveTextModel(this.config, input.model)),
        system: input.system,
        prompt: input.prompt
      });

      return {
        text: result.text,
        model: input.model,
        providerId: this.id
      };
    } catch (error) {
      throw normalizeAiError(error, this.id);
    }
  }

  async *streamText(input: AiTextRequest): AsyncIterable<AiTextChunk> {
    try {
      const provider = this.createProvider();
      const result = streamText({
        model: provider.chat(resolveTextModel(this.config, input.model)),
        system: input.system,
        prompt: input.prompt
      });

      for await (const chunk of result.textStream) {
        yield {
          text: chunk
        };
      }
    } catch (error) {
      throw normalizeAiError(error, this.id);
    }
  }

  async generateObject<TSchema extends z.ZodTypeAny>(
    input: AiObjectRequest<TSchema>
  ): Promise<z.infer<TSchema>> {
    try {
      const provider = this.createProvider();
      const result = await generateObject({
        model: provider.chat(resolveTextModel(this.config, input.model)),
        system: input.system,
        prompt: input.prompt,
        schema: input.schema
      });

      return result.object as z.infer<TSchema>;
    } catch (error) {
      throw normalizeAiError(error, this.id);
    }
  }

  async embed(input: AiEmbeddingRequest): Promise<AiEmbeddingResult> {
    try {
      const provider = this.createProvider();
      const result = await embedMany({
        model: provider.textEmbeddingModel(resolveEmbeddingModel(this.config, input.model)),
        values: input.input
      });

      return {
        vectors: result.embeddings.map((embedding) => [...embedding]),
        model: resolveEmbeddingModel(this.config, input.model),
        providerId: this.id
      };
    } catch (error) {
      throw normalizeAiError(error, this.id);
    }
  }

  async healthCheck(input?: { model?: string }): Promise<AiProviderHealth> {
    const startedAt = Date.now();

    try {
      const probeModel = resolveTextModel(this.config, input?.model);
      const result = await this.generateText({
        model: probeModel,
        prompt: "Reply with OK only."
      });

      return {
        providerId: this.id,
        status: result.text.trim().length > 0 ? "ok" : "error",
        checkedAt: new Date(),
        latencyMs: Date.now() - startedAt,
        message: result.text.trim().length > 0 ? "Connection succeeded." : "Empty provider response.",
        model: probeModel,
        capabilities: this.capabilities
      };
    } catch (error) {
      const normalized = normalizeAiError(error, this.id);

      return {
        providerId: this.id,
        status: normalized.code === "missing-credentials" ? "not-configured" : "error",
        checkedAt: new Date(),
        latencyMs: Date.now() - startedAt,
        message: normalized.message,
        model: resolveTextModel(this.config, input?.model),
        capabilities: this.capabilities
      };
    }
  }

  private createProvider() {
    return createOpenRouter({
      apiKey: this.secret,
      appName: this.config.appName ?? undefined,
      appUrl: this.config.appUrl ?? undefined,
      fetch: this.fetchImplementation
    });
  }
}

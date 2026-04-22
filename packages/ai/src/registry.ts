import type { AiProviderKind } from "@leetgrind/shared";
import { OPENROUTER_MODEL_CATALOG, getProviderCapabilities } from "./catalog.js";
import { AiProviderError } from "./errors.js";
import { OpenRouterAiProvider } from "./openrouter-provider.js";
import type { AiProvider, AiProviderCreateParams, AiProviderFactory } from "./provider.js";

class OpenRouterProviderFactory implements AiProviderFactory {
  readonly kind = "openrouter" as const;

  create(params: AiProviderCreateParams): AiProvider {
    return new OpenRouterAiProvider(params);
  }

  getCapabilities() {
    return getProviderCapabilities(this.kind);
  }

  listModels() {
    return OPENROUTER_MODEL_CATALOG;
  }
}

export class AiProviderRegistry {
  private readonly factories = new Map<AiProviderKind, AiProviderFactory>();

  constructor(factories: AiProviderFactory[] = [new OpenRouterProviderFactory()]) {
    for (const factory of factories) {
      this.factories.set(factory.kind, factory);
    }
  }

  createProvider(params: AiProviderCreateParams): AiProvider {
    const factory = this.factories.get(params.kind);

    if (!factory) {
      throw new AiProviderError({
        code: "not-implemented",
        message: `Provider kind "${params.kind}" is not implemented in phase 04.`,
        providerId: params.id
      });
    }

    return factory.create(params);
  }

  getCapabilities(kind: AiProviderKind) {
    return this.factories.get(kind)?.getCapabilities() ?? getProviderCapabilities(kind);
  }

  isImplemented(kind: AiProviderKind) {
    return this.factories.has(kind);
  }

  listImplementedKinds() {
    return [...this.factories.keys()];
  }
}

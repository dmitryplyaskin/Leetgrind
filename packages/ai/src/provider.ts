import type { AiProviderCapabilities, AiProviderConfig, AiProviderHealth, AiProviderKind } from "@leetgrind/shared";
import { z } from "zod";
import type { AiModel } from "./catalog.js";

export interface AiTextRequest {
  model: string;
  system?: string;
  prompt: string;
}

export interface AiTextResult {
  text: string;
  model: string;
  providerId: string;
}

export interface AiTextChunk {
  text: string;
}

export interface AiObjectRequest<TSchema extends z.ZodTypeAny = z.ZodTypeAny>
  extends AiTextRequest {
  schema: TSchema;
}

export interface AiEmbeddingRequest {
  model: string;
  input: string[];
}

export interface AiEmbeddingResult {
  vectors: number[][];
  model: string;
  providerId: string;
}

export interface AiProvider {
  id: string;
  kind: AiProviderKind;
  displayName: string;
  capabilities: AiProviderCapabilities;
  listModels(): Promise<AiModel[]>;
  generateText(input: AiTextRequest): Promise<AiTextResult>;
  streamText(input: AiTextRequest): AsyncIterable<AiTextChunk>;
  generateObject<TSchema extends z.ZodTypeAny>(
    input: AiObjectRequest<TSchema>
  ): Promise<z.infer<TSchema>>;
  embed?(input: AiEmbeddingRequest): Promise<AiEmbeddingResult>;
  healthCheck(input?: { model?: string }): Promise<AiProviderHealth>;
}

export interface ProviderCredentialStore {
  deleteSecret(providerId: string): Promise<void>;
  getSecret(providerId: string): Promise<string | null>;
  hasSecret(providerId: string): Promise<boolean>;
  setSecret(providerId: string, secret: string): Promise<void>;
}

export interface AiProviderCreateParams {
  id: string;
  displayName: string;
  kind: AiProviderKind;
  config: AiProviderConfig;
  secret: string | null;
  fetch?: typeof fetch;
}

export interface AiProviderFactory {
  kind: AiProviderKind;
  create(params: AiProviderCreateParams): AiProvider;
  getCapabilities(): AiProviderCapabilities;
  listModels(): AiModel[];
}

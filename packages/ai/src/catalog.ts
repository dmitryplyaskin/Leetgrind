import type { AiProviderCapabilities, AiProviderKind } from "@leetgrind/shared";

export interface AiModel {
  id: string;
  displayName: string;
  supportsTextGeneration: boolean;
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;
  supportsEmbeddings: boolean;
}

export const DEFAULT_OPENROUTER_TEXT_MODEL = "openai/gpt-4o-mini";
export const DEFAULT_OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export const OPENROUTER_MODEL_CATALOG: AiModel[] = [
  {
    id: DEFAULT_OPENROUTER_TEXT_MODEL,
    displayName: "OpenAI GPT-4o mini",
    supportsTextGeneration: true,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsEmbeddings: false
  },
  {
    id: "anthropic/claude-3.5-haiku",
    displayName: "Anthropic Claude 3.5 Haiku",
    supportsTextGeneration: true,
    supportsStreaming: true,
    supportsStructuredOutput: true,
    supportsEmbeddings: false
  },
  {
    id: DEFAULT_OPENROUTER_EMBEDDING_MODEL,
    displayName: "OpenAI text-embedding-3-small",
    supportsTextGeneration: false,
    supportsStreaming: false,
    supportsStructuredOutput: false,
    supportsEmbeddings: true
  }
];

export const IMPLEMENTED_PROVIDER_KINDS: AiProviderKind[] = ["openrouter"];

export function getProviderCapabilities(kind: AiProviderKind): AiProviderCapabilities {
  if (kind === "openrouter") {
    return {
      textGeneration: true,
      objectGeneration: true,
      textStreaming: true,
      embeddings: true
    };
  }

  return {
    textGeneration: false,
    objectGeneration: false,
    textStreaming: false,
    embeddings: false
  };
}

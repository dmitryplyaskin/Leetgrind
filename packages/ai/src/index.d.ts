import { z } from "zod";
export type AiProviderKind = "openai-codex" | "openai-api-key" | "openrouter" | "local";
export interface AiModel {
    id: string;
    displayName: string;
    supportsTools?: boolean;
    supportsStructuredOutput?: boolean;
    supportsEmbeddings?: boolean;
}
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
export interface AiObjectRequest<TSchema extends z.ZodTypeAny = z.ZodTypeAny> extends AiTextRequest {
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
    listModels(): Promise<AiModel[]>;
    generateText(input: AiTextRequest): Promise<AiTextResult>;
    streamText(input: AiTextRequest): AsyncIterable<AiTextChunk>;
    generateObject<TSchema extends z.ZodTypeAny>(input: AiObjectRequest<TSchema>): Promise<z.infer<TSchema>>;
    embed?(input: AiEmbeddingRequest): Promise<AiEmbeddingResult>;
}

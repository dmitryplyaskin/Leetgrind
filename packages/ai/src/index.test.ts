import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_OPENROUTER_EMBEDDING_MODEL, DEFAULT_OPENROUTER_TEXT_MODEL } from "./catalog";
import { AiProviderError, normalizeAiError } from "./errors";
import { OpenRouterAiProvider } from "./openrouter-provider";
import { AiProviderRegistry } from "./registry";

describe("AI provider platform", () => {
  it("creates an implemented provider through the registry", () => {
    const registry = new AiProviderRegistry();

    expect(registry.isImplemented("openrouter")).toBe(true);
    expect(registry.isImplemented("openai-codex")).toBe(false);
    expect(registry.getCapabilities("openrouter").embeddings).toBe(true);
  });

  it("fails fast when credentials are missing", () => {
    expect(
      () =>
        new OpenRouterAiProvider({
          id: "provider-1",
          kind: "openrouter",
          displayName: "OpenRouter",
          config: {
            textModel: DEFAULT_OPENROUTER_TEXT_MODEL,
            embeddingModel: DEFAULT_OPENROUTER_EMBEDDING_MODEL,
            appName: "Leetgrind",
            appUrl: "https://leetgrind.local"
          },
          secret: null
        })
    ).toThrow(AiProviderError);
  });

  it("normalizes upstream errors", () => {
    const error = normalizeAiError(new Error("API key is invalid"), "provider-1");

    expect(error.code).toBe("missing-credentials");
    expect(error.providerId).toBe("provider-1");
  });

  it("generates validated objects and embeddings through the OpenRouter adapter", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof _input === "string" ? _input : _input instanceof URL ? _input.toString() : _input.url;
      const body = init?.body ? JSON.parse(String(init.body)) : {};

      if (url.endsWith("/chat/completions")) {
        const content =
          typeof body.response_format === "object"
            ? JSON.stringify({
                summary: "Ready to revise closures.",
                response: "Focus on scope and stale closures first.",
                nextActions: ["Review lexical scope"],
                evidence: ["Resume mentions React work"]
              })
            : "OK";

        return new Response(
          JSON.stringify({
            id: "resp-1",
            model: body.model,
            choices: [
              {
                index: 0,
                finish_reason: "stop",
                message: {
                  role: "assistant",
                  content
                }
              }
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 10,
              total_tokens: 20
            }
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }

      if (url.endsWith("/embeddings")) {
        return new Response(
          JSON.stringify({
            object: "list",
            data: body.input.map((_value: string, index: number) => ({
              object: "embedding",
              embedding: Array.from({ length: 1536 }, (_, itemIndex) =>
                itemIndex === index ? 1 : 0
              ),
              index
            })),
            model: body.model,
            usage: {
              prompt_tokens: 3,
              total_tokens: 3
            }
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }

      return new Response("Not found", { status: 404 });
    });
    const provider = new OpenRouterAiProvider({
      id: "provider-1",
      kind: "openrouter",
      displayName: "OpenRouter",
      config: {
        textModel: DEFAULT_OPENROUTER_TEXT_MODEL,
        embeddingModel: DEFAULT_OPENROUTER_EMBEDDING_MODEL,
        appName: "Leetgrind",
        appUrl: "https://leetgrind.local"
      },
      secret: "test-secret",
      fetch: fetchMock
    });
    const object = await provider.generateObject({
      model: DEFAULT_OPENROUTER_TEXT_MODEL,
      prompt: "Summarize the learner state.",
      schema: z.object({
        summary: z.string(),
        response: z.string(),
        nextActions: z.array(z.string()),
        evidence: z.array(z.string())
      })
    });
    const embeddings = await provider.embed?.({
      model: DEFAULT_OPENROUTER_EMBEDDING_MODEL,
      input: ["closure", "hooks"]
    });

    expect(object.summary).toContain("closures");
    expect(embeddings?.vectors).toHaveLength(2);
    expect(embeddings?.vectors[0]).toHaveLength(1536);
    expect(fetchMock).toHaveBeenCalled();
  });
});

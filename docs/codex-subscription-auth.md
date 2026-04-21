# Codex Subscription Auth

Last checked: 2026-04-21

This document captures the current understanding of OpenAI "Codex subscription auth" for Leetgrind. The practical conclusion is:

> Use Codex subscription auth as the preferred OpenAI path for supported Codex/agent workflows, but do not treat it as a universal replacement for OpenAI API keys.

## Short Version

OpenAI supports signing in to Codex with a ChatGPT account. This can provide access through a user's ChatGPT subscription for Codex-supported workflows.

This is different from using a ChatGPT Plus/Pro subscription as a general OpenAI API billing method. The normal OpenAI API remains a separate usage-based product.

For Leetgrind, the clean architecture is to model this as a separate provider:

- `openai-codex`: Codex subscription auth / Sign in with ChatGPT / Codex SDK path.
- `openai-api-key`: standard OpenAI API key path.
- `openrouter`: OpenRouter API key path.
- Future providers: local models, GitHub Copilot, other OpenAI-compatible providers.

## What Is Officially Supported

OpenAI Codex documentation describes two authentication routes for OpenAI-hosted models:

- Sign in with ChatGPT, used for subscription access.
- API key, used for usage-based OpenAI API access.

Source: [OpenAI Codex authentication](https://developers.openai.com/codex/auth).

OpenAI Codex pricing documentation states that Codex is included in ChatGPT plans, while API key usage is billed separately through the OpenAI API.

Source: [OpenAI Codex pricing](https://developers.openai.com/codex/pricing).

OpenAI also provides a Codex SDK intended to integrate Codex into custom applications.

Source: [OpenAI Codex SDK](https://developers.openai.com/codex/sdk).

## Important Boundary

The phrase "OpenAI OAuth" is too broad and can be misleading.

Better wording for Leetgrind:

> Codex subscription auth: Sign in with ChatGPT for Codex-supported workflows.

Avoid wording like:

> Use ChatGPT Plus/Pro as a free replacement for the OpenAI API.

OpenAI's help center still explains that ChatGPT subscriptions and OpenAI API billing are separate.

Source: [OpenAI Help: ChatGPT subscription and API billing are separate](https://help.openai.com/en/articles/8156019-i-want-to-move-my-chatgpt-subscription-to-the-api).

## Why It Matters For Leetgrind

Leetgrind wants deep local AI integration:

- adaptive mentor behavior;
- coding interview practice;
- code review and explanation;
- mock interviews;
- progress tracking;
- RAG over local learning material and user history;
- potentially multi-agent workflows.

Codex subscription auth is most attractive for agentic coding and coding-interview flows, especially if Leetgrind later embeds a local IDE-like experience.

Examples:

- Generate and refine coding tasks.
- Review user solutions.
- Explain compiler/runtime/test failures.
- Act as an interviewer during coding interviews.
- Help plan learning paths from repo-like local context.

However, not every Leetgrind feature should depend only on Codex subscription auth.

Likely fallback-needed areas:

- embeddings for RAG;
- bulk generation of lesson content;
- background jobs and scheduled analysis;
- structured evaluation at high volume;
- non-Codex model usage;
- provider choice by the user.

## Proposed Provider Model

Leetgrind should keep AI access behind a provider abstraction.

Suggested provider types:

```ts
type AiProviderKind =
  | "openai-codex"
  | "openai-api-key"
  | "openrouter"
  | "local";
```

The rest of the application should not care whether a model call came from Codex auth, OpenAI API key, OpenRouter, or a local model.

At minimum, the provider layer should expose:

```ts
interface AiProvider {
  id: string;
  kind: AiProviderKind;
  displayName: string;
  listModels(): Promise<AiModel[]>;
  runText(input: AiTextRequest): Promise<AiTextResult>;
  runStructured<T>(input: AiStructuredRequest<T>): Promise<T>;
  streamText(input: AiTextRequest): AsyncIterable<AiTextChunk>;
}
```

Coding-specific operations can either be separate methods or higher-level services above the provider layer:

```ts
interface CodingMentorService {
  generateTask(input: GenerateTaskInput): Promise<CodingTask>;
  evaluateSolution(input: EvaluateSolutionInput): Promise<SolutionEvaluation>;
  generateHint(input: GenerateHintInput): Promise<HintResult>;
}
```

## Credential Storage

Do not store Codex subscription auth tokens directly in PGLite unless there is a strong reason.

Prefer:

- Codex's own auth storage where possible.
- OS credential storage if integrating directly.
- A local encrypted credential store if the app later needs its own auth manager.

For standard provider API keys, Leetgrind can store encrypted local credentials or ask for environment variables.

User-visible distinction:

- "Sign in with ChatGPT for Codex"
- "Use OpenAI API key"
- "Use OpenRouter API key"

## What Existing Tools Do

### OpenAI Codex

The OpenAI Codex codebase contains separate auth modes for API key and ChatGPT auth. It refreshes ChatGPT auth tokens through `https://auth.openai.com/oauth/token` and uses a Codex backend path for ChatGPT-authenticated Codex requests.

Useful reference:

- [openai/codex auth manager](https://github.com/openai/codex/blob/main/codex-rs/login/src/auth/manager.rs)
- [openai/codex model provider info](https://github.com/openai/codex/blob/main/codex-rs/model-provider-info/src/lib.rs)

The provider logic distinguishes the normal OpenAI API base URL from the ChatGPT-authenticated Codex backend.

### OpenCode

OpenCode documents a ChatGPT Plus/Pro auth option for OpenAI.

Source: [OpenCode providers documentation](https://opencode.ai/docs/providers).

Its Codex plugin uses a browser OAuth flow, refresh tokens, and a Codex backend endpoint:

- [OpenCode Codex plugin](https://github.com/anomalyco/opencode/blob/main/packages/opencode/src/plugin/codex.ts)

This is useful as an implementation reference, but Leetgrind should not blindly copy private assumptions from OpenCode. Prefer official Codex SDK/auth behavior where possible.

### OpenClaw

OpenClaw documents an `openai-codex` style provider that uses ChatGPT/Codex sign-in separately from standard OpenAI API keys.

Source:

- [OpenClaw OpenAI provider docs](https://github.com/openclaw/openclaw/blob/main/docs/providers/openai.md)

There are also live issues showing that direct Codex backend integration can be fragile when scopes, Cloudflare, auth challenges, or backend behavior change.

Relevant example:

- [OpenClaw issue about openai-codex provider failures](https://github.com/openclaw/openclaw/issues/68033)

## Product Wording

Recommended wording in product docs:

> Leetgrind supports OpenAI through Codex subscription auth where available. This lets a user sign in with ChatGPT and use supported Codex workflows under their ChatGPT plan. Leetgrind also supports API-key based providers for standard API usage and fallback flows.

Avoid:

> Leetgrind uses OpenAI OAuth to access all OpenAI APIs with a ChatGPT subscription.

## Implementation Guidance For MVP

Do not make Codex subscription auth the only AI path in the MVP.

Recommended order:

1. Build provider abstraction first.
2. Implement OpenRouter or OpenAI API key provider first because it is simpler and easier to test.
3. Add `openai-codex` as a first-class provider using official Codex SDK/auth where possible.
4. Route coding-interview and agentic coding flows to `openai-codex` when available.
5. Keep RAG/embeddings/provider-agnostic tasks able to use API-key providers.

## Main Risks

### Product Risk

Users may expect their ChatGPT subscription to power every AI feature. The UI must make the distinction clear:

- Codex subscription auth is for supported Codex workflows.
- API keys/OpenRouter may still be needed for other model calls.

### Technical Risk

Directly calling undocumented or semi-private ChatGPT backend endpoints can break. The safest path is to rely on official Codex SDK/CLI integration when possible.

### Capability Risk

Some models, endpoints, structured output modes, embeddings, or background workloads may not be available through Codex subscription auth.

### Rate Limit Risk

ChatGPT subscription access still has limits. Leetgrind should surface provider errors clearly and support fallback providers.

## Architecture Decision

For Leetgrind, Codex subscription auth should be treated as:

- a high-priority provider;
- especially useful for coding-agent workflows;
- separate from regular OpenAI API billing;
- not the only supported AI integration.

The Product Vision should say "Codex subscription auth" instead of generic "OpenAI OAuth".


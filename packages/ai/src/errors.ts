export type AiProviderErrorCode =
  | "missing-credentials"
  | "not-implemented"
  | "invalid-configuration"
  | "unsupported-capability"
  | "request-failed"
  | "invalid-response";

export class AiProviderError extends Error {
  readonly code: AiProviderErrorCode;
  readonly providerId?: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;

  constructor({
    code,
    message,
    providerId,
    statusCode,
    details,
    cause
  }: {
    code: AiProviderErrorCode;
    message: string;
    providerId?: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(message, cause ? { cause } : undefined);
    this.name = "AiProviderError";
    this.code = code;
    this.providerId = providerId;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function normalizeAiError(error: unknown, providerId?: string): AiProviderError {
  if (error instanceof AiProviderError) {
    return error;
  }

  if (error instanceof Error) {
    const maybeStatusCode =
      "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : undefined;
    const maybeMessage = error.message.toLowerCase();

    if (maybeMessage.includes("api key") || maybeMessage.includes("credential")) {
      return new AiProviderError({
        code: "missing-credentials",
        message: error.message,
        providerId,
        statusCode: maybeStatusCode,
        cause: error
      });
    }

    return new AiProviderError({
      code: "request-failed",
      message: error.message,
      providerId,
      statusCode: maybeStatusCode,
      cause: error
    });
  }

  return new AiProviderError({
    code: "request-failed",
    message: "Unknown AI provider error.",
    providerId,
    details: {
      value: error
    }
  });
}

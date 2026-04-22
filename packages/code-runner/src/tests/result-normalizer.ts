import {
  DEFAULT_TIMEOUT_MS,
  MAX_TIMEOUT_MS,
  type CodeRunError,
  type CodeRunResult,
  type CodeTestResult
} from "../runner.js";

export function normalizeTimeout(timeoutMs: number | undefined): number {
  if (!Number.isFinite(timeoutMs)) {
    return DEFAULT_TIMEOUT_MS;
  }

  const timeout = Math.trunc(timeoutMs ?? DEFAULT_TIMEOUT_MS);
  return Math.min(Math.max(timeout, 1), MAX_TIMEOUT_MS);
}

export function normalizeThrownError(error: unknown): CodeRunError {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";

  if (message.includes("Script execution timed out")) {
    return { kind: "timeout", message };
  }

  if (name === "AssertionError" || message.startsWith("Assertion failed")) {
    return { kind: "assertion", message };
  }

  if (error instanceof SyntaxError) {
    return { kind: "compile", message };
  }

  return { kind: "runtime", message };
}

export function summarizeResults(testResults: CodeTestResult[], durationMs: number): CodeRunResult {
  const stdout = testResults.map((result) => result.stdout).filter(Boolean).join("\n");
  const stderr = testResults.map((result) => result.stderr).filter(Boolean).join("\n");
  const firstError = testResults.find((result) => result.error)?.error;

  return {
    passed: testResults.every((result) => result.passed),
    stdout,
    stderr,
    durationMs,
    testResults,
    ...(firstError ? { error: firstError } : {})
  };
}

export function unsupportedLanguageResult(language: string, durationMs: number): CodeRunResult {
  const error: CodeRunError = {
    kind: "unsupported-language",
    message: `No runner is registered for ${language}.`
  };

  return {
    passed: false,
    stdout: "",
    stderr: error.message,
    durationMs,
    testResults: [],
    error
  };
}


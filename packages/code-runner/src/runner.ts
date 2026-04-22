export type SupportedLanguage = "javascript" | "typescript" | "python";

export type CodeRunErrorKind =
  | "assertion"
  | "compile"
  | "invalid-request"
  | "runtime"
  | "timeout"
  | "unsupported-language";

export interface CodeRunError {
  kind: CodeRunErrorKind;
  message: string;
}

export interface CodeTestCase {
  id: string;
  name: string;
  input?: unknown;
  expected?: unknown;
  testSource?: string;
  hidden?: boolean;
  timeoutMs?: number;
}

export interface CodeTestResult {
  id: string;
  name: string;
  passed: boolean;
  hidden: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  message?: string;
  error?: CodeRunError;
}

export interface CodeRunRequest {
  language: SupportedLanguage;
  source: string;
  testCases?: CodeTestCase[];
  testSource?: string;
  timeoutMs?: number;
}

export interface CodeRunResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  testResults: CodeTestResult[];
  error?: CodeRunError;
}

export interface CodeRunner {
  run(request: CodeRunRequest): Promise<CodeRunResult>;
}

export const DEFAULT_TIMEOUT_MS = 1_000;
export const MAX_TIMEOUT_MS = 5_000;


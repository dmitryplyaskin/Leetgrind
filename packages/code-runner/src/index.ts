export type SupportedLanguage = "javascript" | "typescript" | "python";

export interface CodeRunRequest {
  language: SupportedLanguage;
  source: string;
  testSource?: string;
  timeoutMs?: number;
}

export interface CodeRunResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
  testResults?: Array<{
    name: string;
    passed: boolean;
    message?: string;
  }>;
}

export interface CodeRunner {
  run(request: CodeRunRequest): Promise<CodeRunResult>;
}


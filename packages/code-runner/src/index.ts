export {
  DEFAULT_TIMEOUT_MS,
  MAX_TIMEOUT_MS,
  type CodeRunError,
  type CodeRunErrorKind,
  type CodeRunRequest,
  type CodeRunResult,
  type CodeRunner,
  type CodeTestCase,
  type CodeTestResult,
  type SupportedLanguage
} from "./runner.js";
export { JavaScriptRunner } from "./languages/javascript-runner.js";

import { JavaScriptRunner } from "./languages/javascript-runner.js";
import type { CodeRunRequest, CodeRunResult, CodeRunner } from "./runner.js";
import { unsupportedLanguageResult } from "./tests/result-normalizer.js";

export class InProcessCodeRunner implements CodeRunner {
  constructor(private readonly javascriptRunner: CodeRunner = new JavaScriptRunner()) {}

  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    const startedAt = performance.now();

    if (request.language === "javascript") {
      return this.javascriptRunner.run(request);
    }

    return unsupportedLanguageResult(request.language, performance.now() - startedAt);
  }
}

export function createCodeRunner(): CodeRunner {
  return new InProcessCodeRunner();
}


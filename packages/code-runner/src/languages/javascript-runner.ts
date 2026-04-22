import { Script, createContext } from "node:vm";
import {
  type CodeRunRequest,
  type CodeRunResult,
  type CodeRunner,
  type CodeTestCase,
  type CodeTestResult
} from "../runner.js";
import { normalizeTestCases } from "../tests/test-case.js";
import { normalizeThrownError, normalizeTimeout, summarizeResults } from "../tests/result-normalizer.js";

type CapturedOutput = {
  stdout: string[];
  stderr: string[];
};

export class JavaScriptRunner implements CodeRunner {
  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    const startedAt = performance.now();
    const testCases = normalizeTestCases(request.testCases);
    const testResults = testCases.map((testCase) => this.runTestCase(request, testCase));

    return summarizeResults(testResults, performance.now() - startedAt);
  }

  private runTestCase(request: CodeRunRequest, testCase: CodeTestCase): CodeTestResult {
    const startedAt = performance.now();
    const output: CapturedOutput = { stdout: [], stderr: [] };
    const timeoutMs = normalizeTimeout(testCase.timeoutMs ?? request.timeoutMs);

    try {
      const script = new Script(this.buildScript(request.source, testCase, request.testSource), {
        filename: `leetgrind-${testCase.id}.js`
      });

      const module = { exports: {} };
      const context = createContext(
        {
          assert: createAssert(),
          console: createConsole(output),
          constructor: undefined,
          eval: undefined,
          expected: testCase.expected,
          Function: undefined,
          input: testCase.input,
          module,
          exports: module.exports,
          WebAssembly: undefined
        },
        {
          codeGeneration: {
            strings: false,
            wasm: false
          },
          name: `leetgrind-test-${testCase.id}`
        }
      );

      script.runInContext(context, {
        displayErrors: false,
        timeout: timeoutMs
      });

      return {
        id: testCase.id,
        name: testCase.name,
        passed: true,
        hidden: testCase.hidden ?? false,
        durationMs: performance.now() - startedAt,
        stdout: output.stdout.join("\n"),
        stderr: output.stderr.join("\n")
      };
    } catch (error) {
      const normalized = normalizeThrownError(error);

      return {
        id: testCase.id,
        name: testCase.name,
        passed: false,
        hidden: testCase.hidden ?? false,
        durationMs: performance.now() - startedAt,
        stdout: output.stdout.join("\n"),
        stderr: output.stderr.concat(normalized.message).join("\n"),
        message: normalized.message,
        error: normalized
      };
    }
  }

  private buildScript(source: string, testCase: CodeTestCase, fallbackTestSource: string | undefined): string {
    const testSource = testCase.testSource ?? fallbackTestSource ?? defaultTestSource;

    return `
"use strict";
${source}
const __leetgrindModuleExport = module.exports;
globalThis.solution = typeof solution !== "undefined"
  ? solution
  : typeof __leetgrindModuleExport === "function"
    ? __leetgrindModuleExport
    : __leetgrindModuleExport && typeof __leetgrindModuleExport.solution === "function"
      ? __leetgrindModuleExport.solution
      : __leetgrindModuleExport && typeof __leetgrindModuleExport.default === "function"
        ? __leetgrindModuleExport.default
        : undefined;
${testSource}
`;
  }
}

const defaultTestSource = `
assert.ok(typeof solution === "function", "solution must be a function");
const __leetgrindArgs = Array.isArray(input) ? input : typeof input === "undefined" ? [] : [input];
const __leetgrindActual = solution(...__leetgrindArgs);
assert.deepEqual(__leetgrindActual, expected);
`;

function createConsole(output: CapturedOutput): Console {
  const writeStdout = (...args: unknown[]) => output.stdout.push(args.map(formatConsoleValue).join(" "));
  const writeStderr = (...args: unknown[]) => output.stderr.push(args.map(formatConsoleValue).join(" "));

  return {
    ...console,
    debug: writeStdout,
    error: writeStderr,
    info: writeStdout,
    log: writeStdout,
    warn: writeStderr
  };
}

function createAssert() {
  return {
    deepEqual(actual: unknown, expected: unknown, message?: string) {
      if (!deepEqual(actual, expected)) {
        throw new Error(message ?? `Assertion failed: expected ${formatConsoleValue(expected)}, received ${formatConsoleValue(actual)}`);
      }
    },
    equal(actual: unknown, expected: unknown, message?: string) {
      if (!Object.is(actual, expected)) {
        throw new Error(message ?? `Assertion failed: expected ${formatConsoleValue(expected)}, received ${formatConsoleValue(actual)}`);
      }
    },
    ok(value: unknown, message?: string) {
      if (!value) {
        throw new Error(message ?? "Assertion failed: expected value to be truthy");
      }
    }
  };
}

function deepEqual(actual: unknown, expected: unknown): boolean {
  return stableStringify(actual) === stableStringify(expected);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function formatConsoleValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  const formatted = stableStringify(value);
  return typeof formatted === "string" ? formatted : String(value);
}

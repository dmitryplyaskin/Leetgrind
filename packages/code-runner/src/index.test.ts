import { describe, expect, it } from "vitest";
import { createCodeRunner } from "./index.js";

describe("JavaScript code runner", () => {
  it("runs public test cases and captures stdout", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: `
        function solution(a, b) {
          console.log("adding", a, b);
          return a + b;
        }
      `,
      testCases: [{ id: "sum", name: "adds two numbers", input: [2, 3], expected: 5 }]
    });

    expect(result.passed).toBe(true);
    expect(result.stdout).toContain("adding 2 3");
    expect(result.testResults).toMatchObject([{ id: "sum", passed: true }]);
  });

  it("reports assertion failures per test case", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: "function solution(value) { return value + 1; }",
      testCases: [{ id: "wrong", name: "detects wrong output", input: 1, expected: 3 }]
    });

    expect(result.passed).toBe(false);
    expect(result.error?.kind).toBe("assertion");
    expect(result.testResults[0]?.message).toContain("expected 3");
  });

  it("accepts CommonJS function exports as the solution", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: "module.exports = function (values) { return values.length; };",
      testCases: [{ id: "exported", name: "uses module exports", input: [[1, 2, 3]], expected: 3 }]
    });

    expect(result.passed).toBe(true);
  });

  it("captures stderr without failing successful tests", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: `
        function solution() {
          console.error("diagnostic");
          return true;
        }
      `,
      testCases: [{ id: "stderr", name: "captures stderr", expected: true }]
    });

    expect(result.passed).toBe(true);
    expect(result.stderr).toContain("diagnostic");
  });

  it("enforces execution timeouts", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: "function solution() { while (true) {} }",
      testCases: [{ id: "timeout", name: "stops infinite loops", expected: true }],
      timeoutMs: 25
    });

    expect(result.passed).toBe(false);
    expect(result.error?.kind).toBe("timeout");
  });

  it("does not expose host process or require by default", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: "function solution() { return true; }",
      testCases: [
        {
          id: "globals",
          name: "checks host globals",
          testSource: `
            assert.equal(typeof process, "undefined");
            assert.equal(typeof require, "undefined");
            assert.ok(solution());
          `
        }
      ]
    });

    expect(result.passed).toBe(true);
  });

  it("disables dynamic code generation inside the runner context", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "javascript",
      source: "function solution() { return globalThis.constructor.constructor('return process')(); }",
      testCases: [{ id: "dynamic-code", name: "blocks Function constructor", expected: 1 }]
    });

    expect(result.passed).toBe(false);
    expect(result.error?.kind).toBe("runtime");
  });

  it("returns a normalized unsupported-language result", async () => {
    const runner = createCodeRunner();

    const result = await runner.run({
      language: "python",
      source: "def solution(): return True"
    });

    expect(result.passed).toBe(false);
    expect(result.error?.kind).toBe("unsupported-language");
  });
});

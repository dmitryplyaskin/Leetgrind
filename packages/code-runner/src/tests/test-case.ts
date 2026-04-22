import type { CodeTestCase } from "../runner.js";

export function normalizeTestCases(requestedCases: CodeTestCase[] | undefined): CodeTestCase[] {
  if (!requestedCases || requestedCases.length === 0) {
    return [
      {
        id: "default",
        name: "Default test",
        testSource: "assert.ok(typeof solution !== 'undefined', 'solution must be defined');"
      }
    ];
  }

  return requestedCases.map((testCase, index) => ({
    ...testCase,
    id: testCase.id || `case-${index + 1}`,
    name: testCase.name || `Case ${index + 1}`,
    hidden: testCase.hidden ?? false
  }));
}


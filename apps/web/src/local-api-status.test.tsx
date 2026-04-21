// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalApiStatus } from "./local-api-status";

vi.mock("./trpc", () => ({
  trpc: {
    health: {
      get: {
        useQuery: () => ({
          data: { ok: true },
          isError: false
        })
      }
    }
  }
}));

describe("LocalApiStatus", () => {
  it("renders the local API status label", () => {
    render(<LocalApiStatus />);

    expect(screen.getByLabelText("Local API online")).toBeTruthy();
    expect(screen.getByText("Local API")).toBeTruthy();
  });
});

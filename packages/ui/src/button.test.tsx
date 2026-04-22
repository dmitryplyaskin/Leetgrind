// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { leetgrindTheme } from "./theme";

describe("Button", () => {
  it("renders an accessible button", () => {
    render(
      <MantineProvider theme={leetgrindTheme}>
        <Button>Start setup</Button>
      </MantineProvider>,
    );

    expect(screen.getByRole("button", { name: "Start setup" })).toBeVisible();
  });
});

// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "../../shared/i18n/i18n";
import i18n from "i18next";
import { AiProvidersRoute } from "./settings-ai-providers";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: React.ComponentPropsWithoutRef<"a"> & { to?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}));

vi.mock("../../shared/api/trpc", () => ({
  trpc: {
    useUtils: () => ({
      ai: {
        providers: { list: { invalidate: vi.fn() } },
        settings: { get: { invalidate: vi.fn() } }
      }
    }),
    ai: {
      providers: {
        list: {
          useQuery: () => ({
            data: [
              {
                id: "provider-1",
                displayName: "OpenRouter",
                kind: "openrouter",
                isDefault: true,
                hasSecret: true,
                isImplemented: true,
                config: {
                  textModel: "openai/gpt-4o-mini",
                  embeddingModel: "openai/text-embedding-3-small",
                  appName: "Leetgrind",
                  appUrl: "https://leetgrind.local"
                },
                capabilities: {
                  textGeneration: true,
                  objectGeneration: true,
                  textStreaming: true,
                  embeddings: true
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            error: null,
            isLoading: false
          })
        },
        save: {
          useMutation: () => ({
            isPending: false,
            mutate: vi.fn()
          })
        },
        remove: {
          useMutation: () => ({
            isPending: false,
            mutate: vi.fn()
          })
        },
        setDefault: {
          useMutation: () => ({
            isPending: false,
            mutate: vi.fn()
          })
        },
        test: {
          useMutation: () => ({
            isPending: false,
            mutate: vi.fn(),
            data: null
          })
        }
      }
    }
  }
}));

function renderRoute() {
  render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={leetgrindTheme}>
        <AiProvidersRoute />
      </MantineProvider>
    </I18nextProvider>
  );
}

describe("AiProvidersRoute", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders the provider form and saved providers in English", () => {
    renderRoute();

    expect(
      screen.getByRole("heading", { name: /Configure OpenRouter and secure secrets/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/Display name/i)).toBeVisible();
    expect(screen.getByText(/Saved providers/i)).toBeVisible();
    expect(screen.getByText(/Recognized provider kinds/i)).toBeVisible();
  });

  it("renders the provider form in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderRoute();

    expect(
      screen.getByRole("heading", { name: /Настрой OpenRouter и secure storage секретов/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/Название/i)).toBeVisible();
    expect(screen.getByText(/Сохраненные провайдеры/i)).toBeVisible();
  });
});

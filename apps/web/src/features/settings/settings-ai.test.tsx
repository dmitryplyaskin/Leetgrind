// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "../../shared/i18n/i18n";
import i18n from "i18next";
import { AiSettingsRoute } from "./settings-ai";

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
      documents: { list: { invalidate: vi.fn() } },
      agents: { listRecentRuns: { invalidate: vi.fn() } },
      ai: {
        providers: { list: { invalidate: vi.fn() } },
        settings: { get: { invalidate: vi.fn() } }
      }
    }),
    ai: {
      settings: {
        get: {
          useQuery: () => ({
            data: {
              defaultProviderId: "provider-1",
              providers: [
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
              ]
            },
            error: null,
            isLoading: false
          })
        }
      },
      providers: {
        test: {
          useMutation: () => ({
            data: {
              providerId: "provider-1",
              status: "ok",
              checkedAt: new Date(),
              latencyMs: 5,
              message: "Connection succeeded.",
              model: "openai/gpt-4o-mini",
              capabilities: {
                textGeneration: true,
                objectGeneration: true,
                textStreaming: true,
                embeddings: true
              }
            },
            isPending: false,
            mutate: vi.fn()
          })
        }
      }
    },
    agents: {
      listRecentRuns: {
        useQuery: () => ({
          data: [
            {
              id: "run-1",
              kind: "provider-test",
              status: "succeeded",
              providerId: "provider-1",
              model: "openai/gpt-4o-mini",
              error: null,
              startedAt: new Date(),
              completedAt: new Date(),
              createdAt: new Date()
            }
          ]
        })
      },
      runPreview: {
        useMutation: () => ({
          data: null,
          isPending: false,
          mutate: vi.fn()
        })
      }
    },
    documents: {
      list: {
        useQuery: () => ({
          data: []
        })
      }
    },
    rag: {
      documents: {
        ingest: {
          useMutation: () => ({
            isPending: false,
            mutate: vi.fn()
          })
        },
        search: {
          useQuery: () => ({
            data: [],
            isFetching: false
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
        <AiSettingsRoute />
      </MantineProvider>
    </I18nextProvider>
  );
}

describe("AiSettingsRoute", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders the AI settings route in English", () => {
    renderRoute();

    expect(
      screen.getByRole("heading", { name: /Provider status, content RAG, and preview runs/i })
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Manage providers/i })).toBeVisible();
    expect(screen.getByText(/Default provider/i)).toBeVisible();
  });

  it("renders the AI settings route in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderRoute();

    expect(
      screen.getByRole("heading", { name: /Статус провайдера, content RAG и preview-запуски/i })
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Управлять провайдерами/i })).toBeVisible();
    expect(screen.getByText(/Провайдер по умолчанию/i)).toBeVisible();
  });
});

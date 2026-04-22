// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leetgrindTheme } from "@leetgrind/ui";
import "./i18n";
import i18n from "i18next";
import { LessonDetailRoute } from "./lesson-detail";
import { LessonsRoute } from "./lessons";

const lessonListData = [
  {
    id: "lesson-1",
    title: "Effect dependencies",
    summary: "Follow-up lesson"
  }
];

const lessonDetailData = {
  id: "lesson-1",
  title: "Effect dependencies",
  summary: "Follow-up lesson",
  payload: {
    body: "Track values read by the effect.",
    takeaways: ["Model reads first"],
    practicePrompt: "Review one effect"
  }
};

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: React.ComponentPropsWithoutRef<"a"> & { to?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useParams: () => ({ lessonId: "lesson-1" })
}));

vi.mock("./trpc", () => ({
  trpc: {
    useUtils: () => ({
      lessons: {
        list: {
          invalidate: vi.fn()
        }
      }
    }),
    goals: {
      list: {
        useQuery: () => ({
          data: []
        })
      }
    },
    skills: {
      list: {
        useQuery: () => ({
          data: []
        })
      }
    },
    lessons: {
      list: {
        useQuery: () => ({
          data: lessonListData,
          error: null
        })
      },
      get: {
        useQuery: () => ({
          data: lessonDetailData,
          error: null
        })
      },
      generate: {
        useMutation: () => ({
          error: null,
          isPending: false,
          mutate: vi.fn()
        })
      }
    }
  }
}));

function renderUi(node: React.ReactNode) {
  render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={leetgrindTheme}>{node}</MantineProvider>
    </I18nextProvider>
  );
}

describe("lesson routes", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders the lessons library", () => {
    renderUi(<LessonsRoute />);

    expect(screen.getByRole("heading", { name: /^Lessons$/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /Create a lesson/i })).toBeVisible();
    expect(screen.getByText(/Effect dependencies/i)).toBeVisible();
  });

  it("renders lesson detail in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderUi(<LessonDetailRoute />);

    expect(screen.getByRole("heading", { name: /Effect dependencies/i })).toBeVisible();
    expect(screen.getByText(/Ключевые выводы/i)).toBeVisible();
    expect(screen.getByText(/Model reads first/i)).toBeVisible();
  });
});

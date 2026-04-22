import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AppSurface,
  Box,
  Button,
  Container,
  Group,
  Kicker,
  PageLead,
  PageTitle,
  Stack,
  Text,
} from "@leetgrind/ui";
import { AssessmentResultRoute } from "./assessment-result";
import { AssessmentSessionRoute } from "./assessment-session";
import { AssessmentsNewRoute } from "./assessments-new";
import { DashboardRoute } from "./dashboard";
import { GoalDetailRoute } from "./goal-detail";
import { HistoryRoute } from "./history";
import "./i18n";
import { LessonDetailRoute } from "./lesson-detail";
import { LessonsRoute } from "./lessons";
import { OnboardingRoute } from "./onboarding";
import { AiProvidersRoute } from "./settings-ai-providers";
import { AiSettingsRoute } from "./settings-ai";
import { SkillDetailRoute } from "./skill-detail";
import { SkillLessonsRoute } from "./skill-lessons";
import { ThemeToggle } from "./theme";
import { createTrpcClient, trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = createTrpcClient();

function AppShell() {
  const { i18n, t } = useTranslation();
  const [isNavigationHidden, setIsNavigationHidden] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("leetgrind.sidebarHidden") === "true";
  });
  const onboarding = trpc.onboarding.getState.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  const preferredLocale = onboarding.data?.profile.preferences.uiLocale;
  const toggleNavigationLabel = isNavigationHidden
    ? t("app.navigation.showMenu")
    : t("app.navigation.hideMenu");
  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: t("app.dashboard"),
      to: "/dashboard",
    },
    {
      icon: ArrowRight,
      label: t("app.onboarding"),
      to: "/onboarding",
    },
    {
      icon: BookOpen,
      label: t("app.lessons"),
      to: "/lessons",
    },
    {
      icon: ClipboardCheck,
      label: t("app.assessments"),
      to: "/assessments/new",
    },
    {
      icon: Settings2,
      label: t("app.aiSettings"),
      to: "/settings/ai",
    },
    {
      icon: Clock3,
      label: t("app.history"),
      to: "/history",
    },
  ] as const;

  useEffect(() => {
    if (
      (preferredLocale === "ru" || preferredLocale === "en") &&
      i18n.language !== preferredLocale
    ) {
      void i18n.changeLanguage(preferredLocale);
    }
  }, [i18n, preferredLocale]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "leetgrind.sidebarHidden",
        String(isNavigationHidden),
      );
    }
  }, [isNavigationHidden]);

  return (
    <AppSurface>
      <Box
        className={
          isNavigationHidden
            ? "app-shell-frame app-shell-frame--nav-hidden"
            : "app-shell-frame"
        }
      >
        {isNavigationHidden ? (
          <Tooltip
            label={toggleNavigationLabel}
            position="right"
            openDelay={350}
          >
            <ActionIcon
              aria-label={toggleNavigationLabel}
              className="app-sidebar__reveal"
              color="gray"
              onClick={() => setIsNavigationHidden(false)}
              title={toggleNavigationLabel}
              type="button"
              variant="default"
            >
              <PanelLeftOpen size={18} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Box component="aside" className="app-sidebar">
            <Group className="app-sidebar__top" gap={6} wrap="nowrap">
              <Tooltip label="Leetgrind" position="right" openDelay={350}>
                <Link
                  to="/"
                  aria-label="Leetgrind"
                  className="app-sidebar__brand"
                  title="Leetgrind"
                >
                  <Box component="span" className="app-sidebar__brand-mark">
                    Lg
                  </Box>
                  <Text component="span" className="app-sidebar__wordmark">
                    Leetgrind
                  </Text>
                </Link>
              </Tooltip>
              <Tooltip
                label={toggleNavigationLabel}
                position="right"
                openDelay={350}
              >
                <ActionIcon
                  aria-label={toggleNavigationLabel}
                  className="app-sidebar__collapse"
                  color="gray"
                  onClick={() => setIsNavigationHidden(true)}
                  title={toggleNavigationLabel}
                  type="button"
                  variant="subtle"
                >
                  <PanelLeftClose size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Stack component="nav" gap={6} className="app-sidebar__nav">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Tooltip
                    key={item.to}
                    label={item.label}
                    position="right"
                    openDelay={350}
                  >
                    <Link
                      to={item.to}
                      aria-label={item.label}
                      className="app-sidebar__link"
                      activeProps={{
                        className:
                          "app-sidebar__link app-sidebar__link--active",
                      }}
                      title={item.label}
                    >
                      <Icon size={20} strokeWidth={2} aria-hidden="true" />
                      <Text
                        component="span"
                        className="app-sidebar__link-label"
                      >
                        {item.label}
                      </Text>
                    </Link>
                  </Tooltip>
                );
              })}
            </Stack>
            <Box className="app-sidebar__footer">
              <ThemeToggle
                labels={{
                  dark: t("app.theme.dark"),
                  light: t("app.theme.light"),
                  toggle: t("app.theme.toggle"),
                }}
              />
            </Box>
          </Box>
        )}
        <Box component="main" className="app-main">
          <Outlet />
        </Box>
      </Box>
    </AppSurface>
  );
}

function HomeRoute() {
  const { t } = useTranslation();

  return (
    <Container>
      <Box
        component="section"
        mih="100vh"
        py={{ base: 48, md: 72 }}
        style={{ alignContent: "center", display: "grid" }}
      >
        <Stack gap="lg" maw={820} miw={0} w="100%">
          <Kicker>{t("home.eyebrow")}</Kicker>
          <PageTitle>{t("home.title")}</PageTitle>
          <PageLead>{t("home.copy")}</PageLead>
          <Group gap="sm">
            <Button
              component={Link}
              to="/onboarding"
              leftSection={<ArrowRight size={16} />}
            >
              {t("home.start")}
            </Button>
            <Button
              color="gray"
              component={Link}
              to="/dashboard"
              leftSection={<LayoutDashboard size={16} />}
              variant="default"
            >
              {t("home.dashboard")}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Container>
  );
}

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingRoute,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardRoute,
});

const assessmentsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/new",
  component: AssessmentsNewRoute,
});

const assessmentSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/$sessionId",
  component: AssessmentSessionRoute,
});

const assessmentResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/$sessionId/result",
  component: AssessmentResultRoute,
});

const goalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals/$goalId",
  component: GoalDetailRoute,
});

const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills/$skillId",
  component: SkillDetailRoute,
});

const lessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons",
  component: LessonsRoute,
});

const lessonDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons/$lessonId",
  component: LessonDetailRoute,
});

const skillLessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills/$skillId/lessons",
  component: SkillLessonsRoute,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryRoute,
});

const aiSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/ai",
  component: AiSettingsRoute,
});

const aiProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/ai/providers",
  component: AiProvidersRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  dashboardRoute,
  assessmentsNewRoute,
  assessmentSessionRoute,
  assessmentResultRoute,
  goalDetailRoute,
  skillDetailRoute,
  lessonsRoute,
  lessonDetailRoute,
  skillLessonsRoute,
  historyRoute,
  aiSettingsRoute,
  aiProvidersRoute,
]);

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

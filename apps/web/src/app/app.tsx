import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
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
import { useEffect, useState, type ReactNode } from "react";
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
import { AssessmentResultRoute } from "../features/assessments/assessment-result";
import { AssessmentSessionRoute } from "../features/assessments/assessment-session";
import { AssessmentsNewRoute } from "../features/assessments/assessments-new";
import { DashboardRoute } from "../features/dashboard/dashboard";
import { GoalDetailRoute } from "../features/goals/goal-detail";
import { HistoryRoute } from "../features/history/history";
import "../shared/i18n/i18n";
import { LessonDetailRoute } from "../features/lessons/lesson-detail";
import { LessonsRoute } from "../features/lessons/lessons";
import { OnboardingRoute } from "../features/onboarding/onboarding";
import { AiProvidersRoute } from "../features/settings/settings-ai-providers";
import { AiSettingsRoute } from "../features/settings/settings-ai";
import { SkillDetailRoute } from "../features/skills/skill-detail";
import { SkillLessonsRoute } from "../features/skills/skill-lessons";
import { ThemeToggle } from "./theme";
import { createTrpcClient, trpc } from "../shared/api/trpc";

const queryClient = new QueryClient();
const trpcClient = createTrpcClient();

function AppBrand() {
  return (
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
  );
}

function RouteLoading() {
  const { t } = useTranslation();

  return (
    <Container>
      <Box
        component="section"
        mih="70vh"
        py={{ base: 48, md: 72 }}
        style={{ alignContent: "center", display: "grid" }}
      >
        <Stack gap="sm" maw={560}>
          <Kicker>Leetgrind</Kicker>
          <PageTitle>{t("common.loading")}</PageTitle>
          <PageLead>{t("common.loadingDetail")}</PageLead>
        </Stack>
      </Box>
    </Container>
  );
}

function useOnboardingState() {
  return trpc.onboarding.getState.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
}

function AppShell() {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const onboarding = useOnboardingState();
  const [isNavigationHidden, setIsNavigationHidden] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("leetgrind.sidebarHidden") === "true";
  });
  const preferredLocale = onboarding.data?.profile.preferences.uiLocale;
  const isOnboardingComplete = onboarding.data?.isComplete ?? false;
  const isCompactShell = onboarding.isLoading || !isOnboardingComplete;
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

  if (isCompactShell) {
    return (
      <AppSurface>
        <Box className="app-shell-frame app-shell-frame--nav-hidden">
          <Box
            component="header"
            style={{
              alignItems: "center",
              borderBottom: "1px solid var(--mantine-color-default-border)",
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 20px",
            }}
          >
            <AppBrand />
            <ThemeToggle
              labels={{
                dark: t("app.theme.dark"),
                light: t("app.theme.light"),
                toggle: t("app.theme.toggle"),
              }}
            />
          </Box>
          <Box component="main" className="app-main">
            <Outlet />
          </Box>
        </Box>
      </AppSurface>
    );
  }

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
              <AppBrand />
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

function BootstrapRoute() {
  const onboarding = useOnboardingState();

  if (onboarding.isLoading) {
    return <RouteLoading />;
  }

  return (
    <Navigate
      replace
      to={onboarding.data?.isComplete ? "/dashboard" : "/onboarding"}
    />
  );
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const onboarding = useOnboardingState();
  const location = useLocation();

  if (onboarding.isLoading) {
    return <RouteLoading />;
  }

  if (!onboarding.data?.isComplete && location.pathname !== "/onboarding") {
    return <Navigate replace to="/onboarding" />;
  }

  return <>{children}</>;
}

function withOnboardingGate(Component: () => ReactNode) {
  return function ProtectedRoute() {
    return (
      <OnboardingGate>
        <Component />
      </OnboardingGate>
    );
  };
}

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BootstrapRoute,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingRoute,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: withOnboardingGate(DashboardRoute),
});

const assessmentsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/new",
  component: withOnboardingGate(AssessmentsNewRoute),
});

const assessmentSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/$sessionId",
  component: withOnboardingGate(AssessmentSessionRoute),
});

const assessmentResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assessments/$sessionId/result",
  component: withOnboardingGate(AssessmentResultRoute),
});

const goalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals/$goalId",
  component: withOnboardingGate(GoalDetailRoute),
});

const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills/$skillId",
  component: withOnboardingGate(SkillDetailRoute),
});

const lessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons",
  component: withOnboardingGate(LessonsRoute),
});

const lessonDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons/$lessonId",
  component: withOnboardingGate(LessonDetailRoute),
});

const skillLessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills/$skillId/lessons",
  component: withOnboardingGate(SkillLessonsRoute),
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: withOnboardingGate(HistoryRoute),
});

const aiSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/ai",
  component: withOnboardingGate(AiSettingsRoute),
});

const aiProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/ai/providers",
  component: withOnboardingGate(AiProvidersRoute),
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

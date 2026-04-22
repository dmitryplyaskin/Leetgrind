import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import { ArrowRight, BookOpen, ClipboardCheck, Clock3, LayoutDashboard, Settings2 } from "lucide-react";
import { useEffect } from "react";
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
  Text
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
  const onboarding = trpc.onboarding.getState.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });
  const preferredLocale = onboarding.data?.profile.preferences.uiLocale;
  const navLinkStyle = {
    alignItems: "center",
    borderRadius: "var(--mantine-radius-sm)",
    color: "var(--lg-color-muted)",
    display: "inline-flex",
    gap: "var(--mantine-spacing-xs)",
    minHeight: 40,
    paddingInline: "var(--mantine-spacing-sm)",
    textDecoration: "none",
  };
  const activeNavLinkStyle = {
    ...navLinkStyle,
    background: "var(--lg-color-surface-subtle)",
    color: "var(--lg-color-text)",
  };

  useEffect(() => {
    if (
      (preferredLocale === "ru" || preferredLocale === "en") &&
      i18n.language !== preferredLocale
    ) {
      void i18n.changeLanguage(preferredLocale);
    }
  }, [i18n, preferredLocale]);

  return (
    <AppSurface>
      <Box
        component="header"
        pos="sticky"
        top={0}
        style={{
          backdropFilter: "blur(12px)",
          background:
            "color-mix(in srgb, var(--lg-color-canvas) 90%, transparent)",
          borderBottom: "1px solid var(--lg-color-border)",
          zIndex: 20,
        }}
      >
        <Container py="sm">
          <Group align="center" justify="space-between" wrap="nowrap">
            <Link
              to="/"
              style={{
                color: "var(--lg-color-text)",
                flexShrink: 0,
                fontSize: "var(--mantine-font-size-lg)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Leetgrind
            </Link>
            <Group
              component="nav"
              gap={4}
              justify="flex-end"
              wrap="nowrap"
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                overflowX: "auto",
                overscrollBehaviorX: "contain",
                scrollbarWidth: "none",
              }}
            >
              <Link
                to="/dashboard"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.dashboard")}
                </Text>
                <Box hiddenFrom="sm">
                  <LayoutDashboard size={18} />
                </Box>
              </Link>
              <Link
                to="/onboarding"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.onboarding")}
                </Text>
                <Box hiddenFrom="sm">
                  <ArrowRight size={18} />
                </Box>
              </Link>
              <Link
                to="/lessons"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.lessons")}
                </Text>
                <Box hiddenFrom="sm">
                  <BookOpen size={18} />
                </Box>
              </Link>
              <Link
                to="/assessments/new"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.assessments")}
                </Text>
                <Box hiddenFrom="sm">
                  <ClipboardCheck size={18} />
                </Box>
              </Link>
              <Link
                to="/settings/ai"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.aiSettings")}
                </Text>
                <Box hiddenFrom="sm">
                  <Settings2 size={18} />
                </Box>
              </Link>
              <Link
                to="/history"
                style={navLinkStyle}
                activeProps={{ style: activeNavLinkStyle }}
              >
                <Text component="span" visibleFrom="sm" size="sm">
                  {t("app.history")}
                </Text>
                <Box hiddenFrom="sm">
                  <Clock3 size={18} />
                </Box>
              </Link>
              <ThemeToggle
                labels={{
                  dark: t("app.theme.dark"),
                  light: t("app.theme.light"),
                  toggle: t("app.theme.toggle"),
                }}
              />
            </Group>
          </Group>
        </Container>
      </Box>
      <Outlet />
    </AppSurface>
  );
}

function HomeRoute() {
  const { t } = useTranslation();

  return (
    <Container>
      <Box
        component="section"
        mih="calc(100vh - 65px)"
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

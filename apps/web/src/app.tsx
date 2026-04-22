import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AppSurface,
  Button,
  Container,
  Kicker,
  PageLead,
  PageTitle,
} from "@leetgrind/ui";
import { DashboardRoute } from "./dashboard";
import "./i18n";
import { OnboardingRoute } from "./onboarding";
import { ThemeToggle } from "./theme";
import { createTrpcClient, trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = createTrpcClient();

function AppShell() {
  const { t } = useTranslation();

  return (
    <AppSurface>
      <header className="sticky top-0 z-20 border-b border-[var(--lg-border)] bg-[var(--lg-bg)]/90 backdrop-blur">
        <Container className="flex items-center justify-between py-3">
          <Link
            to="/"
            className="text-lg font-semibold tracking-normal text-[var(--lg-text)]"
          >
            Leetgrind
          </Link>
          <nav className="flex items-center gap-1 text-sm text-[var(--lg-muted)]">
            <Link
              to="/dashboard"
              className="rounded-md px-3 py-2 transition-colors hover:bg-[var(--lg-surface-muted)] hover:text-[var(--lg-text)]"
              activeProps={{
                className: "bg-[var(--lg-surface-muted)] text-[var(--lg-text)]",
              }}
            >
              <span className="hidden sm:inline">{t("app.dashboard")}</span>
              <LayoutDashboard className="h-4 w-4 sm:hidden" />
            </Link>
            <Link
              to="/onboarding"
              className="rounded-md px-3 py-2 transition-colors hover:bg-[var(--lg-surface-muted)] hover:text-[var(--lg-text)]"
              activeProps={{
                className: "bg-[var(--lg-surface-muted)] text-[var(--lg-text)]",
              }}
            >
              <span className="hidden sm:inline">{t("app.onboarding")}</span>
              <ArrowRight className="h-4 w-4 sm:hidden" />
            </Link>
            <ThemeToggle
              labels={{
                dark: t("app.theme.dark"),
                light: t("app.theme.light"),
                toggle: t("app.theme.toggle"),
              }}
            />
          </nav>
        </Container>
      </header>
      <Outlet />
    </AppSurface>
  );
}

function HomeRoute() {
  const { t } = useTranslation();

  return (
    <Container>
      <section className="grid min-h-[calc(100vh-65px)] content-center gap-8 py-12">
        <div className="max-w-3xl space-y-5">
          <Kicker>{t("home.eyebrow")}</Kicker>
          <PageTitle className="md:text-6xl">{t("home.title")}</PageTitle>
          <PageLead>{t("home.copy")}</PageLead>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/onboarding">
                <ArrowRight className="h-4 w-4" />
                {t("home.start")}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                {t("home.dashboard")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  dashboardRoute,
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

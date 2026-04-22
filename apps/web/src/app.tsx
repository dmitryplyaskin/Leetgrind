import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@leetgrind/ui";
import { DashboardRoute } from "./dashboard";
import "./i18n";
import { LocalApiStatus } from "./local-api-status";
import { OnboardingRoute } from "./onboarding";
import { createTrpcClient, trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = createTrpcClient();

function AppShell() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            Leetgrind
          </Link>
          <nav className="flex items-center gap-2 text-sm text-zinc-300">
            <Link to="/dashboard" className="rounded px-3 py-2 hover:bg-zinc-900">
              {t("app.dashboard")}
            </Link>
            <Link to="/onboarding" className="rounded px-3 py-2 hover:bg-zinc-900">
              {t("app.onboarding")}
            </Link>
            <LocalApiStatus
              label={t("app.localApi")}
              stateLabels={{
                online: t("app.apiState.online"),
                offline: t("app.apiState.offline"),
                checking: t("app.apiState.checking")
              }}
            />
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  );
}

function HomeRoute() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl content-center gap-8 px-6 py-12">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-medium uppercase text-emerald-300">{t("home.eyebrow")}</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{t("home.title")}</h1>
        <p className="text-lg leading-8 text-zinc-300">{t("home.copy")}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/onboarding">
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("home.start")}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t("home.dashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: AppShell
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingRoute
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardRoute
});

const routeTree = rootRoute.addChildren([indexRoute, onboardingRoute, dashboardRoute]);

const router = createRouter({
  routeTree,
  context: {
    queryClient
  }
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "@leetgrind/ui";
import { LocalApiStatus } from "./local-api-status";
import "./styles.css";
import { createTrpcClient, trpc } from "./trpc";

const queryClient = new QueryClient();
const trpcClient = createTrpcClient();

const rootRoute = createRootRoute({
  component: () => (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            Leetgrind
          </Link>
          <nav className="flex items-center gap-2 text-sm text-zinc-300">
            <Link to="/" className="rounded px-3 py-2 hover:bg-zinc-900">
              Dashboard
            </Link>
            <LocalApiStatus />
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl content-center gap-8 px-6 py-12">
      <div className="max-w-2xl space-y-5">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">
          Local-first interview preparation
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          AI mentor, coding practice, and skill progress in one local workspace.
        </h1>
        <p className="text-lg leading-8 text-zinc-300">
          The base app shell is ready for onboarding, assessments, RAG, coding
          tasks, spaced repetition, and mock interviews.
        </p>
        <Button>Start setup</Button>
      </div>
    </section>
  )
});

const routeTree = rootRoute.addChildren([indexRoute]);

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);

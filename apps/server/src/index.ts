import cors from "cors";
import express from "express";
import type { Express } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { AppContext, CreateAppContextOptions } from "./context.js";
import { createAppContext } from "./context.js";
import { appRouter, type AppRouter } from "./router.js";

export type { AppRouter };
export { appRouter, createAppContext };

export interface CreateAppOptions {
  context?: AppContext | Promise<AppContext>;
  contextOptions?: CreateAppContextOptions;
}

export async function createApp(options: CreateAppOptions = {}): Promise<Express> {
  const app = express();
  const context = await Promise.resolve(options.context ?? createAppContext(options.contextOptions));

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "leetgrind-server" });
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: async () => context
    })
  );

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3000);
  const app = await createApp();

  app.listen(port, "127.0.0.1", () => {
    console.log(`Leetgrind server listening on http://127.0.0.1:${port}`);
  });
}

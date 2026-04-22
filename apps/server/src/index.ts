import cors from "cors";
import express from "express";
import type { Express } from "express";
import type { Server } from "node:http";
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

export async function createApp(
  options: CreateAppOptions = {},
): Promise<Express> {
  const app = express();
  const context = await Promise.resolve(
    options.context ?? createAppContext(options.contextOptions),
  );

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "leetgrind-server" });
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: async () => context,
    }),
  );

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    const port = Number(process.env.PORT ?? 3000);
    const context = await createAppContext();
    const app = await createApp({ context });
    const server = app.listen(port, "127.0.0.1", () => {
      console.log(`Leetgrind server listening on http://127.0.0.1:${port}`);
    });
    let isShuttingDown = false;

    const shutdown = async (signal: NodeJS.Signals) => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;
      console.log(`Received ${signal}. Closing Leetgrind server.`);

      await closeHttpServer(server);
      await context.database.close();
    };

    process.once("SIGINT", () => {
      void shutdown("SIGINT").finally(() => process.exit(0));
    });
    process.once("SIGTERM", () => {
      void shutdown("SIGTERM").finally(() => process.exit(0));
    });
  };

  await startServer().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

async function closeHttpServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

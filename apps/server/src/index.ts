import cors from "cors";
import express from "express";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import { z } from "zod";

const t = initTRPC.create({
  transformer: superjson
});

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    ok: true,
    service: "leetgrind-server",
    time: new Date()
  })),
  echo: t.procedure.input(z.object({ message: z.string() })).mutation(({ input }) => input)
});

export type AppRouter = typeof appRouter;

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "leetgrind-server" });
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter
  })
);

app.listen(port, "127.0.0.1", () => {
  console.log(`Leetgrind server listening on http://127.0.0.1:${port}`);
});


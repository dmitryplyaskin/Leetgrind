import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { AppContext } from "./context.js";

const t = initTRPC.context<AppContext>().create({
  transformer: superjson
});

export const router = t.router;
export const publicProcedure = t.procedure;

import { router, publicProcedure } from "../trpc.js";

export const healthRouter = router({
  get: publicProcedure.query(() => ({
    ok: true,
    service: "leetgrind-server",
    time: new Date()
  }))
});

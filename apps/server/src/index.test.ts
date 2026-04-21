import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AppContext } from "./context.js";
import { appRouter, createApp, createAppContext } from "./index.js";

describe("server API", () => {
  let context: AppContext;

  beforeEach(async () => {
    context = await createAppContext({
      database: {
        dataDir: null,
        runMigrations: true
      }
    });
  });

  afterEach(async () => {
    await context?.database.close();
  });

  it("returns the local server health payload", async () => {
    const app = await createApp({ context });
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      ok: true,
      service: "leetgrind-server"
    });
  });

  it("serves typed tRPC profile and goals procedures", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.health.get()).resolves.toMatchObject({
      ok: true,
      service: "leetgrind-server"
    });

    const profile = await caller.profile.upsert({
      displayName: "Dima",
      targetRole: "Frontend Engineer"
    });
    const goal = await caller.goals.create({
      title: "System design interview",
      targetRole: "Senior Frontend Engineer"
    });
    const goals = await caller.goals.list();

    expect(profile.displayName).toBe("Dima");
    expect(goals).toHaveLength(1);
    expect(goals[0]?.id).toBe(goal.id);
  });

  it("rejects invalid tRPC input", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.goals.create({ title: "" })).rejects.toThrow();
  });
});

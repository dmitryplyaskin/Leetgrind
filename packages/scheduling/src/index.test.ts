import { describe, expect, it, vi } from "vitest";
import { scheduleSm2Review } from "./index";

describe("scheduleSm2Review", () => {
  it("starts with a one-day interval for a successful first review", () => {
    vi.setSystemTime(new Date("2026-04-21T00:00:00.000Z"));

    const next = scheduleSm2Review(undefined, 5);

    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt.toISOString()).toBe("2026-04-22T00:00:00.000Z");
  });

  it("resets repetitions when quality is low", () => {
    vi.setSystemTime(new Date("2026-04-21T00:00:00.000Z"));

    const next = scheduleSm2Review(
      {
        repetitions: 4,
        intervalDays: 21,
        easinessFactor: 2.5,
        dueAt: new Date("2026-05-12T00:00:00.000Z")
      },
      2
    );

    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt.toISOString()).toBe("2026-04-22T00:00:00.000Z");
  });
});


import { documentsRouter } from "./routers/documents-router.js";
import { goalsRouter } from "./routers/goals-router.js";
import { healthRouter } from "./routers/health-router.js";
import { onboardingRouter } from "./routers/onboarding-router.js";
import { profileRouter } from "./routers/profile-router.js";
import { skillsRouter } from "./routers/skills-router.js";
import { router } from "./trpc.js";

export const appRouter = router({
  health: healthRouter,
  onboarding: onboardingRouter,
  profile: profileRouter,
  goals: goalsRouter,
  skills: skillsRouter,
  documents: documentsRouter
});

export type AppRouter = typeof appRouter;

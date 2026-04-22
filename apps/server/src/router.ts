import { dashboardRouter } from "./routers/dashboard-router.js";
import { documentsRouter } from "./routers/documents-router.js";
import { goalsRouter } from "./routers/goals-router.js";
import { healthRouter } from "./routers/health-router.js";
import { historyRouter } from "./routers/history-router.js";
import { onboardingRouter } from "./routers/onboarding-router.js";
import { profileRouter } from "./routers/profile-router.js";
import { recommendationsRouter } from "./routers/recommendations-router.js";
import { skillsRouter } from "./routers/skills-router.js";
import { router } from "./trpc.js";

export const appRouter = router({
  health: healthRouter,
  dashboard: dashboardRouter,
  onboarding: onboardingRouter,
  profile: profileRouter,
  goals: goalsRouter,
  skills: skillsRouter,
  documents: documentsRouter,
  history: historyRouter,
  recommendations: recommendationsRouter
});

export type AppRouter = typeof appRouter;

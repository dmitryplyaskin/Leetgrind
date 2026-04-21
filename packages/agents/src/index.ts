import type { AiProvider } from "@leetgrind/ai";
import type { Attempt, Evidence, Goal, Skill } from "@leetgrind/domain";

export interface AgentRunContext {
  provider: AiProvider;
  goal?: Goal;
  skills: Skill[];
}

export interface MentorEvaluationInput {
  attempt: Attempt;
  context: AgentRunContext;
}

export interface MentorEvaluationResult {
  summary: string;
  score: number;
  evidence: Evidence[];
  nextActions: string[];
}

export interface MentorAgent {
  evaluate(input: MentorEvaluationInput): Promise<MentorEvaluationResult>;
}


import { useParams } from "@tanstack/react-router";
import { LessonsRoute } from "../lessons/lessons";

export function SkillLessonsRoute() {
  const { skillId } = useParams({ from: "/skills/$skillId/lessons" });

  return <LessonsRoute skillId={skillId} />;
}

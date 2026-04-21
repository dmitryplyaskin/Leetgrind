export type SkillLevel = "unknown" | "weak" | "developing" | "strong";
export interface Goal {
    id: string;
    title: string;
    description?: string;
    targetRole?: string;
    createdAt: Date;
}
export interface Skill {
    id: string;
    slug: string;
    title: string;
    level: SkillLevel;
    description?: string;
}
export interface SkillEdge {
    fromSkillId: string;
    toSkillId: string;
    relation: "prerequisite" | "related" | "specialization" | "supports-goal";
    weight: number;
}
export interface Attempt {
    id: string;
    userId: string;
    learningItemId: string;
    submittedAt: Date;
    hintCount: number;
    payload: unknown;
}
export interface Evidence {
    id: string;
    skillId: string;
    sourceAttemptId?: string;
    summary: string;
    confidence: number;
    createdAt: Date;
}

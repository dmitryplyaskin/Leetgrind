import type { SkillEdgeRelation } from "../index.js";

export interface SkillTemplate {
  slug: string;
  title: string;
  description: string;
  track: string;
}

export interface SkillEdgeTemplate {
  fromSlug: string;
  toSlug: string;
  relation: SkillEdgeRelation;
  weight: number;
}

export interface SkillGraphTemplate {
  skills: SkillTemplate[];
  edges: SkillEdgeTemplate[];
}

export const commonSkillGraphTemplate: SkillGraphTemplate = {
  skills: [
    {
      slug: "html-basics",
      title: "HTML basics",
      description: "Semantic structure, forms, accessibility fundamentals.",
      track: "frontend-basics"
    },
    {
      slug: "css-basics",
      title: "CSS basics",
      description: "Selectors, cascade, layout primitives, responsive styling.",
      track: "frontend-basics"
    },
    {
      slug: "javascript",
      title: "JavaScript",
      description: "Language fundamentals, runtime model, async programming.",
      track: "javascript-typescript"
    },
    {
      slug: "typescript",
      title: "TypeScript",
      description: "Static typing, narrowing, generics, application contracts.",
      track: "javascript-typescript"
    },
    {
      slug: "react",
      title: "React",
      description: "Components, hooks, state, rendering, and composition.",
      track: "frontend-basics"
    },
    {
      slug: "browser-rendering",
      title: "Browser rendering",
      description: "Critical rendering path, layout, painting, and performance.",
      track: "browser-fundamentals"
    },
    {
      slug: "web-apis",
      title: "Web APIs",
      description: "DOM, fetch, storage, events, workers, and browser capabilities.",
      track: "browser-fundamentals"
    },
    {
      slug: "algorithms",
      title: "Algorithms",
      description: "Problem solving patterns, complexity, recursion, search.",
      track: "algorithms-data-structures"
    },
    {
      slug: "data-structures",
      title: "Data structures",
      description: "Arrays, hash maps, trees, graphs, heaps, and queues.",
      track: "algorithms-data-structures"
    },
    {
      slug: "dynamic-programming",
      title: "Dynamic programming",
      description: "State definition, transitions, memoization, tabulation.",
      track: "algorithms-data-structures"
    },
    {
      slug: "python",
      title: "Python",
      description: "Syntax, data model, standard library, and typing basics.",
      track: "python-backend-basics"
    },
    {
      slug: "backend-apis",
      title: "Backend APIs",
      description: "HTTP APIs, validation, persistence boundaries, and errors.",
      track: "python-backend-basics"
    },
    {
      slug: "databases",
      title: "Databases",
      description: "Relational modeling, indexes, transactions, and querying.",
      track: "system-design-basics"
    },
    {
      slug: "system-design",
      title: "System design",
      description: "Scalability, reliability, data flow, and tradeoff analysis.",
      track: "system-design-basics"
    }
  ],
  edges: [
    { fromSlug: "html-basics", toSlug: "react", relation: "prerequisite", weight: 0.8 },
    { fromSlug: "css-basics", toSlug: "react", relation: "prerequisite", weight: 0.7 },
    { fromSlug: "javascript", toSlug: "typescript", relation: "prerequisite", weight: 1 },
    { fromSlug: "javascript", toSlug: "react", relation: "prerequisite", weight: 1 },
    { fromSlug: "typescript", toSlug: "react", relation: "related", weight: 0.8 },
    { fromSlug: "browser-rendering", toSlug: "react", relation: "related", weight: 0.7 },
    { fromSlug: "web-apis", toSlug: "browser-rendering", relation: "related", weight: 0.6 },
    { fromSlug: "data-structures", toSlug: "algorithms", relation: "prerequisite", weight: 0.9 },
    { fromSlug: "algorithms", toSlug: "dynamic-programming", relation: "prerequisite", weight: 0.8 },
    { fromSlug: "python", toSlug: "backend-apis", relation: "prerequisite", weight: 0.8 },
    { fromSlug: "databases", toSlug: "backend-apis", relation: "related", weight: 0.7 },
    { fromSlug: "backend-apis", toSlug: "system-design", relation: "prerequisite", weight: 0.7 },
    { fromSlug: "databases", toSlug: "system-design", relation: "prerequisite", weight: 0.8 },
    { fromSlug: "algorithms", toSlug: "system-design", relation: "related", weight: 0.5 }
  ]
};

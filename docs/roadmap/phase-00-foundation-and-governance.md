# Phase 00: Foundation And Governance

Status: done, then maintained continuously.

## Goal

Create the technical and process foundation that lets AI agents work safely in the project without losing architecture context.

## Current State

Already completed:

- pnpm workspace monorepo.
- `apps/web` Vite + React shell.
- `apps/server` Express + tRPC shell.
- Package boundaries for domain, database, AI, agents, RAG, code runner, scheduling, UI, and shared contracts.
- Baseline dependencies installed.
- `pnpm build` and `pnpm typecheck` pass.
- GRACE-inspired documentation started:
  - `AGENTS.md`;
  - `docs/requirements.xml`;
  - `docs/technology.xml`;
  - `docs/development-plan.xml`;
  - `docs/knowledge-graph.xml`;
  - `docs/verification-plan.xml`;
  - `docs/operational-packets.xml`.

## What To Maintain

### AGENTS.md

Keep this as the first file an agent reads. It should describe:

- required reading order;
- module boundaries;
- allowed commands;
- verification gate;
- multi-agent rules;
- stop conditions.

### GRACE XML Artifacts

Keep XML artifacts valid and aligned:

- requirements define what the product must do;
- technology defines approved tools and dependency rules;
- development plan defines modules and phases;
- knowledge graph defines dependency direction;
- verification plan defines checks;
- operational packets define execution workflow.

### Human-Readable Roadmap

Keep this `docs/roadmap` folder aligned with XML artifacts. Use Markdown for readable planning and XML for agent contracts.

## Implementation Rules

When a new architectural decision is made:

1. Update the roadmap if it affects work sequencing.
2. Update `docs/technology.xml` if it affects libraries, runtime, commands, or forbidden patterns.
3. Update `docs/development-plan.xml` if it affects module responsibility or phase order.
4. Update `docs/knowledge-graph.xml` if it affects dependencies.
5. Update `docs/verification-plan.xml` if it affects checks.

## Verification

Required:

```powershell
pnpm typecheck
```

For dependency, build, package export, Vite, server, or tsconfig changes:

```powershell
pnpm build
```

For XML artifact changes:

```powershell
$files = @(
  'docs/requirements.xml',
  'docs/technology.xml',
  'docs/development-plan.xml',
  'docs/knowledge-graph.xml',
  'docs/verification-plan.xml',
  'docs/operational-packets.xml'
)
foreach ($file in $files) {
  [xml](Get-Content -Raw -LiteralPath $file) | Out-Null
}
```

## Done Criteria

- Agents can identify the correct module before editing.
- Agent instructions are project-specific, not generic.
- Build and typecheck are reliable.
- The roadmap and GRACE artifacts agree on the next phase.


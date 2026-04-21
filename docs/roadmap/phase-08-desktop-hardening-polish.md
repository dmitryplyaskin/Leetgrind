# Phase 08: Desktop Readiness, Hardening, And Polish

Status: planned.

## Goal

Prepare Leetgrind to feel reliable as a local product and to evolve toward a Tauri desktop client.

## User Outcome

The app feels stable, understandable, and safe. The user can trust local data, provider settings, code execution boundaries, and long-running AI workflows.

## Target Modules

- all modules;
- especially `apps/server`, `apps/web`, `packages/db`, `packages/ai`, `packages/code-runner`.

## Desktop Readiness

Prepare for Tauri without immediately requiring it:

- keep server/runtime boundaries clear;
- avoid browser-only assumptions in domain and db packages;
- document filesystem paths;
- define where local data lives;
- make provider credential storage replaceable;
- separate web UI from runtime process decisions.

Future Tauri work:

```txt
apps/desktop/
  Tauri shell
  local process integration
  credential storage integration
  controlled code execution adapters
```

## Data Reliability

Implement:

- export/import local data;
- backup file format;
- schema versioning;
- migration strategy;
- reset local data option;
- diagnostics page.

Routes:

```txt
/settings/data
/settings/diagnostics
```

## AI Reliability

Implement:

- provider status page;
- model availability cache;
- normalized provider errors;
- fallback provider selection;
- rate limit messaging;
- agent run trace viewer;
- prompt/version metadata.

## Code Execution Hardening

Before expanding languages:

- document sandbox boundaries;
- enforce timeout;
- cap output size;
- isolate execution where possible;
- prevent filesystem and network access unless intentionally allowed;
- record runner version and environment.

## UX Polish

Focus on core workflows:

- onboarding clarity;
- dashboard actionability;
- editor ergonomics;
- mobile layout;
- empty states;
- loading and streaming states;
- error recovery;
- accessible controls.

Avoid:

- marketing landing page replacing actual product;
- decorative UI that does not help workflow;
- hiding important AI/provider failures.

## Observability

Local observability should include:

- structured logs;
- agent run records;
- provider/model usage;
- retrieval events;
- code run history;
- migration version;
- last successful verification or health check.

## Verification

Required:

```powershell
pnpm typecheck
pnpm build
```

Manual:

- export and import data;
- change provider settings;
- recover from provider failure;
- run coding practice safely;
- inspect diagnostics.

## Risks

- Premature Tauri migration before web product loop works.
- Credentials stored unsafely.
- Local database changes without migration discipline.
- Code execution surface expanding faster than safety controls.

## Done Criteria

- Data export/import exists.
- Diagnostics and provider status are visible.
- Core workflows handle loading, empty, and error states.
- Tauri migration path is documented and low-risk.


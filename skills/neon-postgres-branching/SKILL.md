---
name: neon-postgres-branching
description: >-
  Choose and create the right Neon branch type for testing and development.
  Use when users ask about Neon branching, migration testing with real data,
  isolated test environments, schema-only branch workflows for sensitive data,
  or branch creation via Neon CLI or Neon MCP. Triggers include "Neon branch",
  "test migrations safely", "branch production data", "schema-only branch",
  and "sensitive data testing".
---

# Neon Postgres Branching

Help users choose between Neon's two branch creation approaches:

- **Normal branch** for realistic migration and query testing with real data.
- **Schema-only branch (Beta)** for sensitive data workflows where structure is needed without copying rows.

## Branch Type Decision

Use this decision rule first:

1. If the user wants to test complex migrations, performance, or behavior against production-like data, choose a **normal branch**.
2. If the user needs to avoid copying sensitive data, choose a **schema-only branch**.

If the request is ambiguous, ask one clarifying question:
"Do you need realistic data for testing, or only schema structure because the data is sensitive?"

## Tool Selection: CLI or MCP

Always support both Neon CLI and Neon MCP server. Prefer the tool the user already has installed and authenticated.

MCP link: https://neon.com/docs/ai/neon-mcp-server.md
CLI link: https://neon.com/docs/reference/cli-quickstart

### Selection order

1. Check MCP first in MCP-enabled environments:
   - If Neon MCP tools are available and authenticated (for example, listing projects works), use MCP.
2. If MCP is unavailable or not authenticated, check CLI:
   - Run `neon --version` to confirm CLI is installed.
   - Run `neon projects list` to confirm auth/context.
3. If CLI is missing, direct installation via quickstart.
4. If CLI is installed but not authenticated, guide the user through `neon auth` (or API key auth), then continue.

### MCP branch flow

1. Choose normal vs schema-only based on data sensitivity and migration-testing goals.
2. Use branch tools (for example, `create_branch`) to create the branch.
3. Validate with read tools (for example, `describe_branch`).
4. For migration workflows, prefer branch-based migration flows before applying to main.

## Create a Normal Branch (Preferred for Real-Data Migration Testing)

Use this when the user needs realistic testing conditions.
Real production-like data can expose edge cases your seed or data migration scripts miss, which helps catch migration issues before going live.

Link: https://neon.com/docs/introduction/branching.md

### Steps

1. Use MCP if already available/authenticated; otherwise verify CLI with `neon --version`.
2. Ensure project context is set (`neon set-context --project-id <your-project-id>`) or include `--project-id` on commands.
3. Create branch:

```bash
neon branches create --name <branch-name>
```

4. Optionally fetch a connection string for the new branch:

```bash
neon connection-string <branch-name>
```

## Create a Schema-Only Branch (Beta, Sensitive Data)

Use this when users must not copy production rows into the test branch.

Link: https://neon.com/docs/guides/branching-schema-only.md

### Steps

1. Use MCP if already available/authenticated; otherwise verify CLI with `neon --version`.
2. Create schema-only branch:

```bash
neon branch create --schema-only
```

If multiple projects exist, include:

```bash
neon branch create --schema-only --project-id <your-project-id>
```

### Beta Support Guidance (Mandatory)

Schema-only branching is in Beta. If users report unexpected behavior, errors, or missing capabilities:

1. Ask them to share feedback in the Neon Console:
   - https://console.neon.tech/app/projects?modal=feedback
2. Recommend opening a support conversation in the Neon Discord:
   - https://discord.gg/92vNTzKDGp

## Notes and Caveats

- Schema-only branches are for structure-only cloning and sensitive/compliant data controls.
- Schema-only branches are independent root branches (no parent branch and no shared history), so reset-from-parent does not apply.
- For migration testing that depends on real-world row shapes, volumes, and edge cases, prefer normal branches.
- Root branch allowances and per-branch storage limits can cap how many schema-only branches users can create.
- If a user is unsure, default recommendation is:
  - **Normal branch** for migration validation.
  - **Schema-only branch** for compliance and privacy constraints.

## Useful Workflow Patterns

If the user asks for process recommendations (not just a single command), suggest these:

- **One branch per PR:** Create branch when PR opens, delete when merged/closed, keep migration tests isolated.
- **One branch per test run:** Create branch at pipeline start, run migrations/tests, delete at end for deterministic CI.
- **One branch per developer:** Isolated dev environments with production-like shape; avoid team collisions on shared test data.
- **PII-aware branching:** If production has sensitive data, derive dev/PR branches from an anonymized branch or use schema-only branches.
- **Ephemeral lifecycle hygiene:** Set branch expiration and automate cleanup so old branches do not accumulate avoidable storage/history cost.

## Examples

### Example 1: Migration testing with realistic data

**User input:** "I need to test a risky migration against production-like data."

**Agent output shape:**

1. Recommend a normal branch and explain why.
2. Share docs link: https://neon.com/docs/introduction/branching
3. Check the available/authenticated tool path first (MCP, otherwise CLI with `neon --version`).
4. Provide commands:
   - `neon branches create --name migration-test`
   - `neon connection-string migration-test`

### Example 2: Sensitive data development workflow

**User input:** "We cannot copy production data because of compliance."

**Agent output shape:**

1. Recommend schema-only branch and explain why.
2. Share docs link: https://neon.com/docs/guides/branching-schema-only
3. Check the available/authenticated tool path first (MCP, otherwise CLI with `neon --version`).
4. Provide command:
   - `neon branch create --schema-only --project-id <your-project-id>`
5. Mention Beta support path:
   - https://console.neon.tech/app/projects?modal=feedback
   - https://discord.gg/92vNTzKDGp

## Further reading

- https://neon.com/docs/guides/branch-expiration.md
- https://neon.com/docs/guides/reset-from-parent.md
- https://neon.com/docs/guides/neon-github-integration.md
- https://neon.com/docs/ai/neon-mcp-server.md
- https://neon.com/branching

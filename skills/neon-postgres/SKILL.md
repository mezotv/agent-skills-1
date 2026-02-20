---
name: neon-postgres
description: Guides and best practices for working with Neon Serverless Postgres. Covers getting started, local development with Neon, choosing a connection method, Neon features, authentication (@neondatabase/auth), PostgREST-style data API (@neondatabase/neon-js), Neon CLI, and Neon's Platform API/SDKs. Use for any Neon-related questions.
---

# Neon Serverless Postgres

Neon is a serverless Postgres platform that separates compute and storage to offer autoscaling, branching, instant restore, and scale-to-zero. It's fully compatible with Postgres and works with any language, framework, or ORM that supports Postgres.

## Neon Documentation

The Neon documentation is the source of truth for all Neon-related information. Always verify claims against the official docs before responding. Neon features and APIs evolve, so prefer fetching current docs over relying on training data.

### Fetching docs as markdown

Any Neon doc page can be fetched as markdown in two ways:

1. **Append `.md` to the URL** (simplest): `https://neon.com/docs/introduction/branching.md`
2. **Request `text/markdown`** on the standard URL: `curl -H "Accept: text/markdown" https://neon.com/docs/introduction/branching`

Both return the same markdown content. Use whichever method your tools support.

### Finding the right page

The docs index lists every available page with its URL and a short description:

```
https://neon.com/docs/llms.txt
```

Common doc URLs are organized in the topic links below. If you need a page not listed here, search the [docs index](https://neon.com/docs/llms.txt) — don't guess URLs.

## Getting Started

Use this for first-time setup: org/project selection, connection strings, driver installation, optional auth, and initial schema setup.

Link: `references/getting-started.md`

## Connection Methods

Use this when you need to pick the correct transport and driver based on runtime constraints (TCP, HTTP, WebSocket, edge, serverless, long-running).

Link: `references/connection-methods.md`

## Developer Tools

Use this for local development enablement with `npx neon init`, VSCode extension setup, and Neon MCP server configuration.

Link: `references/devtools.md`

## Neon CLI

Use this for terminal-first workflows, scripts, and CI/CD automation with `neonctl`.

Link: `references/neon-cli.md`

## Neon REST API

Use this for direct HTTP automation, endpoint-level control, API key auth, rate-limit handling, and operation polling.

Link: `references/neon-rest-api.md`

## Neon TypeScript SDK

Use this when implementing typed programmatic control of Neon resources in TypeScript via `@neondatabase/api-client`.

Link: `references/neon-typescript-sdk.md`

## Neon Python SDK

Use this when implementing programmatic Neon management in Python with the `neon-api` package.

Link: `references/neon-python-sdk.md`

## Interactive API Explorer

Use this when you need to inspect endpoint payloads quickly, prototype requests, or verify exact request/response shapes before coding.

Link: https://api-docs.neon.tech/reference/getting-started-with-neon-api

## OpenAPI Specification

Use this for strict schema lookup, API code generation, or validating endpoint/field names in automation workflows.

Link: https://neon.com/api_spec/release/v2.json

## Serverless Driver

Use this for `@neondatabase/serverless` patterns, including HTTP queries, WebSocket transactions, and runtime-specific optimizations.

Link: `references/neon-serverless.md`

## Neon Auth

Use this for managed authentication setup, UI components, auth methods, and common integration pitfalls in Next.js and React apps.

Link: `references/neon-auth.md`

## Neon JS SDK

Use this for combined Neon Auth + Data API workflows with PostgREST-style querying and typed client setup.

Link: `references/neon-js.md`

## Drizzle ORM

Use this when implementing Drizzle with Neon across serverless, edge, and long-running runtime environments.

Link: `references/neon-drizzle.md`

## Next.js Integration

Use this when the user is building a Next.js app and needs Neon-specific setup patterns for serverless functions, routing, and production deployment.

Link: https://neon.com/docs/guides/nextjs.md

## Django Integration

Use this when the user is connecting Neon to Django projects, including settings, migrations, and deployment-safe connection patterns.

Link: https://neon.com/docs/guides/django.md

## Prisma Integration

Use this when the user wants Prisma with Neon, including schema/migration workflow and runtime connection setup.

Link: https://neon.com/docs/guides/prisma.md

## ORM Selection Guide

Use this when the user is choosing between ORMs and needs compatibility and trade-off guidance for Neon.

Link: https://neon.com/docs/get-started/orms.md

## Branching

Use this when the user is planning isolated environments, schema migration testing, preview deployments, or branch lifecycle automation.

Link: `references/branching.md`

## Autoscaling

Use this when the user needs compute to scale automatically with workload and wants guidance on CU sizing and runtime behavior.

Link: https://neon.com/docs/introduction/autoscaling.md

## Scale to Zero

Use this when optimizing idle costs and discussing suspend/resume behavior, including cold-start trade-offs.

Link: https://neon.com/docs/introduction/scale-to-zero.md

## Instant Restore

Use this when the user needs point-in-time recovery or wants to restore data state without traditional backup restore workflows.

Link: https://neon.com/docs/introduction/branch-restore.md

## Read Replicas

Use this for read-heavy workloads where the user needs dedicated read-only compute without duplicating storage.

Link: https://neon.com/docs/introduction/read-replicas.md

## Connection Pooling

Use this when the user is in serverless or high-concurrency environments and needs safe, scalable Postgres connection management.

Link: https://neon.com/docs/connect/connection-pooling.md

## IP Allow Lists

Use this when the user needs to restrict database access by trusted networks, IPs, or CIDR ranges.

Link: https://neon.com/docs/introduction/ip-allow.md

## Logical Replication

Use this when integrating CDC pipelines, external Postgres sync, or replication-based data movement.

Link: https://neon.com/docs/guides/logical-replication-guide.md

## What Is Neon

Use this for architecture explanations and terminology (organizations, projects, branches, endpoints) before giving implementation advice.

Link: `references/what-is-neon.md`

---
name: neon-functions
description: >-
  Deploy long-running serverless functions that run alongside your Neon
  Postgres database, close to your data, managed through the same Neon CLI and
  API. Suited to WebSocket servers, long agent HTTP streams, APIs, and
  server-sent event servers. Use when users ask about "Neon Functions", "Neon
  Compute", serverless functions on Neon, running code next to Postgres,
  triggering async jobs, or background tasks tied to a Neon project. Triggers
  include "Neon Functions", "Neon Compute", "serverless functions", "WebSocket
  server", "server-sent events", "long-running functions", "run code near my
  database", and "async jobs on Neon".
---

# Neon Functions

This is a preview feature and only available in `us-east-2`. Neon Functions (Compute) are long-running serverless functions that run alongside your Postgres database — well suited to WebSocket servers, long agent HTTP streams, APIs, and server-sent event servers — so your code executes close to your data, and you deploy and manage everything through the same Neon CLI and API you already use.

Use this skill to help the user deploy functions, trigger async jobs, and manage compute next to their database. Deliver a deployed function, a configured trigger/job, or a precise answer from the official Neon docs.

## What It Does

- **Long-running** — Built for persistent and long-lived workloads like WebSocket servers, long agent HTTP streams, APIs, and server-sent event servers.
- **Close to your database** — Compute runs alongside your Postgres database for low-latency data access.
- **Asynchronous jobs** — Trigger jobs asynchronously for background and event-driven work.
- **Same CLI and API** — Deploy code and manage functions through the same Neon CLI and API as the rest of your project.
- **Branchable and serverless** — Built on the same instant, branchable, serverless model as Neon Postgres.

## Availability

Neon Functions (Compute) is a preview (early access) feature available only in the `us-east-2` region. Confirm the user's Neon project is in `us-east-2` before proceeding. If the user does not yet have access, point them to sign up for early access from the Neon Console or https://neon.com.

## Neon Documentation

The Neon documentation is the source of truth and Functions is evolving rapidly, so always verify against the official docs. Any doc page can be fetched as markdown by appending `.md` to the URL or by requesting `Accept: text/markdown`. Find the right page from the docs index and the changelog announcements.

## Further reading

- https://neon.com
- https://neon.com/docs/changelog/2026-05-29.md
- https://neon.com/docs/changelog/2026-06-05.md

---
name: neon-ai-gateway
description: >-
  Route, log, and rate-limit LLM calls through a single API built into your
  Neon project, with access to frontier and open-source models powered by
  Databricks. Use when users ask about the "Neon AI Gateway", routing LLM calls
  to OpenAI, Anthropic, or Gemini through Neon, model routing, per-request LLM
  logging, streaming responses, or AI cost and rate controls. Triggers include
  "Neon AI Gateway", "LLM proxy", "model routing", "one API for all models",
  "log LLM requests", and "rate limit AI calls".
---

# Neon AI Gateway

This is a preview feature and only available in `us-east-2`. The Neon AI Gateway is one API for all frontier and open-source models, letting you route, log, and rate-limit LLM calls to providers like OpenAI, Anthropic, and Gemini through a single proxy built into your Neon project, powered by Databricks.

Use this skill to help the user send model calls through the gateway, configure routing and logging, and apply cost controls. Deliver a working gateway request, a configured routing/logging setup, or a precise answer from the official Neon docs.

## What It Does

- **Model routing** — One API in front of frontier and open-source models. Switch providers (OpenAI, Anthropic, Gemini, and more) without rewiring your app.
- **Per-request logging** — Every request is logged for observability, debugging, and auditing.
- **Streaming responses** — Streaming is supported out of the box.
- **Rate limiting and cost controls** — Apply limits and budgets to AI workloads.
- **No extra infrastructure** — The gateway lives inside your Neon project. It runs on the same infrastructure that handles 125 trillion tokens per month on Databricks.

## Availability

The AI Gateway is a preview (early access) feature available only in the `us-east-2` region. Confirm the user's Neon project is in `us-east-2` before proceeding. If the user does not yet have access, point them to sign up for early access from the Neon Console or https://neon.com.

## Neon Documentation

The Neon documentation is the source of truth and AI Gateway is evolving rapidly, so always verify against the official docs. Any doc page can be fetched as markdown by appending `.md` to the URL or by requesting `Accept: text/markdown`. Find the right page from the docs index and the changelog announcements.

## Further reading

- https://neon.com
- https://neon.com/docs/changelog/2026-05-29.md
- https://neon.com/docs/changelog/2026-06-05.md

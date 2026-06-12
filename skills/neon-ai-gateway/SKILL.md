---
name: neon-ai-gateway
description: >-
  One API and one credential for frontier and open-source LLMs, built into your
  Neon branch and powered by Databricks. Use when a user wants to call an LLM,
  add AI/chat/an agent to their app, route between model providers (OpenAI,
  Anthropic, Google/Gemini, Meta, Alibaba, DeepSeek), or avoid juggling
  separate provider API keys and accounts — especially when they already use
  Neon and want AI requests to branch with their project. Works with the OpenAI
  SDK, Anthropic SDK, google-genai, the Vercel AI SDK, and Mastra by changing
  only the base URL. Triggers include "call an LLM", "add AI to my app",
  "chat completion", "model routing", "LLM proxy/gateway", "one API for all
  models", "use Claude/GPT/Gemini", "AI SDK", "Mastra agent", "Neon AI
  Gateway", and "log/rate-limit AI calls".
---

# Neon AI Gateway

This is a preview feature and only available in `us-east-2`. The Neon AI Gateway is the LLM inference layer built into your Neon branch: one API and one Neon credential give you access to frontier and open-source models from Anthropic, OpenAI, Google, Meta, Alibaba, DeepSeek, and Databricks — powered by Databricks. Your existing OpenAI/Anthropic/Gemini SDK works by changing only the base URL.

Use this skill to help the user send model calls through the gateway, wire it into the AI SDK or Mastra, and switch providers without rewiring code. Deliver a working inference request, a configured agent, or a precise answer from the official Neon docs.

## When to Use

Reach for the AI Gateway whenever an app or agent needs to call an LLM and the user would rather not manage model providers themselves:

- **One credential instead of many provider accounts.** A single Neon credential reaches the whole `databricks-*` catalog across seven providers. No separate OpenAI / Anthropic / Google billing, keys, or signups to provision and rotate.
- **Switch models without rewiring.** The unified endpoint is OpenAI-compatible and works with every model in the catalog — change one `model` field to move between Claude, GPT, and Gemini. Standard SDKs (OpenAI, Anthropic, google-genai) work with just a base-URL change.
- **AI follows your branches.** Each branch has its own gateway endpoint, scoped with the same lineage as your database. AI requests from a preview/feature branch are isolated to that branch — the same isolation your data already gets — which makes preview, CI, and agent environments self-contained.
- **No extra infrastructure, and it's already next to your data.** The gateway lives inside your Neon project (and is injected into Neon Functions automatically), runs on the same Databricks infrastructure that serves trillions of tokens a month, and supports streaming (SSE) out of the box.

If the user already has a deep, single-provider integration and no interest in Neon branching or multi-model routing, a direct provider SDK is fine — but the moment they want one credential, model portability, or branch-scoped AI, this is the reason to use it.

## What It Does

- **One API for all models** — Frontier and open-source models behind a single endpoint, addressed by `databricks-`prefixed IDs (e.g. `databricks-claude-sonnet-4-6`, `databricks-gpt-5-mini`, `databricks-gemini-2-5-flash`).
- **Standard SDKs, one URL change** — OpenAI SDK and AI SDK (OpenAI-compatible MLflow/Responses routes), Anthropic SDK (native Messages), google-genai (native Gemini).
- **Branch-scoped** — Each branch gets its own gateway host; the Neon credential authorizes requests for that branch and its descendants.
- **Streaming** — Server-sent events work on all endpoints with no extra configuration.

## Setup

The gateway is part of `neon.ts` (see the `neon` skill for the branch-first workflow and `neon.ts` basics). Enable it under `preview.aiGateway`:

```typescript
// neon.ts
import { defineConfig } from "@neondatabase/config/v1";

export default defineConfig({
  preview: {
    aiGateway: true,
  },
});
```

```bash
neonctl deploy   # provisions the gateway on the linked branch
```

## Environment variables

When `preview.aiGateway` is enabled, Neon injects the gateway credentials as **OpenAI-standard** env vars (so the OpenAI SDK and AI SDK work from the environment with no config), plus `NEON_`-branded aliases. Inside a deployed Neon Function these are injected automatically; locally, `neonctl env pull` writes them to `.env`/`.env.local` (or use `neon-env run -- <cmd>` to inject at runtime without a file):

| Variable                   | Meaning                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`           | Gateway bearer token (a Neon credential, `nt_live_...`)                                                                   |
| `OPENAI_BASE_URL`          | OpenAI-dialect route on the branch gateway host: `https://<branch-id>-api.ai.<region>.aws.neon.tech/ai-gateway/openai/v1` |
| `NEON_AI_GATEWAY_TOKEN`    | Same bearer as `OPENAI_API_KEY` (survives a user overriding `OPENAI_*` with their own keys)                               |
| `NEON_AI_GATEWAY_BASE_URL` | Bare branch gateway host (`scheme://host`, **no path**) — the `@neondatabase/ai-sdk-provider` appends routes itself       |

Endpoint dialects on the gateway host:

- `/ai-gateway/mlflow/v1` — unified, OpenAI **Chat Completions**-compatible; recommended default, works with every provider.
- `/ai-gateway/openai/v1` — OpenAI **Responses** API (required for `gpt-5-…-codex` variants and `gpt-5-5-pro`). This is what `OPENAI_BASE_URL` points at, because the `@ai-sdk/openai` provider uses the Responses API by default.
- `/ai-gateway/anthropic/v1` — native Anthropic Messages (extended thinking, prompt caching).
- `/ai-gateway/gemini/v1beta/...` — native Gemini `generateContent`.

If you need chat completions from the injected `OPENAI_BASE_URL`, swap the dialect: `baseUrl.replace("/openai/v1", "/mlflow/v1")` (this is what the Mastra example does).

For typed access, `parseEnv` (from `@neondatabase/env`) returns `env.aiGateway` (`apiKey`, `baseUrl`) derived from your `neon.ts`.

## Use with the Vercel AI SDK

The `with-ai-sdk` example deploys an agent as a Neon Function that streams text and generates images. The `@ai-sdk/openai` provider reads `OPENAI_API_KEY` and `OPENAI_BASE_URL` from the injected env automatically — no client config needed; just pick a catalog model:

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const result = streamText({
  model: openai("databricks-gpt-5-mini"),
  messages,
  tools: {
    image_generation: openai.tools.imageGeneration({
      outputFormat: "jpeg",
      size: "1024x1024",
    }),
  },
});
return result.toUIMessageStreamResponse();
```

For multi-provider routing from a single call, the dedicated `@neondatabase/ai-sdk-provider` reads `NEON_AI_GATEWAY_BASE_URL` + `NEON_AI_GATEWAY_TOKEN` and routes each model to the best endpoint (Anthropic → Messages, OpenAI/Codex → Responses, everything else → MLflow):

```typescript
import { neon } from "@neondatabase/ai-sdk-provider/v1";
import { generateText } from "ai";

const { text } = await generateText({
  model: neon("databricks-claude-haiku-4-5"), // or databricks-gpt-5-3-codex, databricks-gemini-2-5-flash, ...
  prompt: "Summarize Postgres for me.",
});
```

## Use with Mastra

The `with-mastra` example runs a memory-backed agent (threads/messages in Postgres via `@mastra/pg`) as a Neon Function, with its model pointed at the gateway. It reads `env.aiGateway` from `parseEnv` and uses the **chat-completions** (MLflow) dialect:

```typescript
import { Agent } from "@mastra/core/agent";
import { parseEnv } from "@neondatabase/env/v1";
import config from "../neon";

const env = parseEnv(config);
const gatewayUrl = env.aiGateway.baseUrl.replace("/openai/v1", "/mlflow/v1");

export const personalAssistant = new Agent({
  id: "personal-assistant",
  name: "personal-assistant",
  instructions:
    "You are a warm, concise personal assistant with long-term memory.",
  model: {
    id: `neon/claude-haiku-4-5`,
    url: gatewayUrl,
    apiKey: env.aiGateway.apiKey,
  },
  memory,
});
```

## Use with plain SDKs

OpenAI SDK against the unified chat-completions endpoint (model swaps are a one-field change):

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEON_AI_GATEWAY_TOKEN,
  baseURL: `${process.env.NEON_AI_GATEWAY_BASE_URL}/ai-gateway/mlflow/v1`,
});

const res = await client.chat.completions.create({
  model: "databricks-claude-sonnet-4-6", // swap to databricks-gpt-5-4, databricks-gemini-2-5-flash, ...
  messages: [{ role: "user", content: "What is Neon?" }],
});
```

The Anthropic SDK (`baseURL: .../ai-gateway/anthropic`) and google-genai (`baseUrl: .../ai-gateway/gemini`) work the same way for native provider features. Fetch the current model catalog from the Neon API (`GET https://console.neon.tech/api/v2/ai_gateway/models`) or the Models doc — all IDs use the `databricks-` prefix.

## Availability

The AI Gateway is a preview (early access) feature available only on new projects in the `us-east-2` region; it can't be enabled on existing projects. Foundation model access requires a paid Neon plan. Confirm the user's project is a new project in `us-east-2`. If the user does not yet have access, point them to the private beta sign-up: https://neon.com/blog/were-building-backends#access

## Neon Documentation

The Neon documentation is the source of truth and the AI Gateway is evolving rapidly, so always verify against the official docs. Any doc page can be fetched as markdown by appending `.md` to the URL or by requesting `Accept: text/markdown`. Find the right page from the docs index (https://neon.com/docs/llms.txt) and the changelog announcements.

## Further reading

- https://neon.com/docs/ai-gateway/overview.md
- https://neon.com/docs/ai-gateway/get-started.md
- https://neon.com/docs/ai-gateway/models.md
- https://neon.com/docs/ai-gateway/chat-completions.md
- https://neon.com/docs/ai-gateway/anthropic-messages.md
- https://neon.com/docs/ai-gateway/openai-responses.md
- https://neon.com/docs/ai-gateway/gemini.md
- https://neon.com/docs/ai-gateway/authentication.md
- https://neon.com/docs/ai-gateway/troubleshooting.md

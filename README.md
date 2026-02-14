<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://neon.com/brand/neon-logo-dark-color.svg?new">
  <source media="(prefers-color-scheme: light)" srcset="https://neon.com/brand/neon-logo-light-color.svg?new">
  <img width="250px" alt="Neon Logo fallback" src="https://neon.com/brand/neon-logo-dark-color.svg?new">
</picture>

# Agent Skills

A collection of [Agent Skills](https://agentskills.io/) for Neon Serverless Postgres.

## What are Agent Skills?

As per the Agent Skills spec, skills are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. Once installed, skills are automatically invoked by the agent upon detection of relevant tasks.

It all starts with the `SKILL.md` file in the skill's directory. It's the entry point and allows agents to progressively discover information as needed.

## Available Skills

### Neon Postgres

[skills/neon-postgres](skills/neon-postgres/SKILL.md)

A comprehensive guide and best practices for working with Neon Serverless Postgres. It covers:

**Core Guides:**

- Getting started with Neon
- Developer tools (VSCode extension, MCP server, neon init CLI)
- Choosing connection methods (decision tree by language/platform/runtime)
- Feature overview (branching, autoscaling, scale-to-zero, instant restore)

**Database Drivers & ORMs:**

- `@neondatabase/serverless` - HTTP/WebSocket queries for serverless/edge functions
- Drizzle ORM integration

**Authentication & Full SDK:**

- `@neondatabase/auth` - Authentication only
- `@neondatabase/neon-js` - Auth + Data API (PostgREST-style queries)

**Platform API & SDKs:**

- REST API for managing Neon resources
- TypeScript SDK (`@neondatabase/api-client`)
- Python SDK (`neon-api`)

## Installation

```bash
npx skills add neondatabase/agent-skills
```

### Claude Code Plugin

You can also install the skills as a Claude Code plugin, which bundles both the skills and the [Neon MCP Server](https://mcp.neon.tech) for natural language database management:

```
/plugin marketplace add neondatabase/agent-skills
/plugin install neon-postgres@neon
```

After installation, you'll be prompted to authenticate with Neon via OAuth when you first use MCP tools.

The top-level `skills/` directory remains the source of truth. Plugin folders symlink only the skill directories they expose.

### Cursor Plugin

This repository also includes Cursor plugin packaging with the same scope as the Claude plugin, using a multi-plugin layout so each plugin is self-contained under `plugins/`.

- `plugins/neon-postgres/` contains plugin-specific files (`.cursor-plugin/plugin.json`, branding assets)
- both plugin manifests are co-located in `plugins/neon-postgres/` (`.cursor-plugin/plugin.json` and `.claude-plugin/plugin.json`)
- `plugins/neon-postgres/skills/neon-postgres` is a symlink to top-level `skills/neon-postgres`
- `plugins/neon-postgres/mcp.json` is plugin-local MCP config

Cursor marketplace metadata is in `.cursor-plugin/marketplace.json`.

## Usage

Example prompts:

```
Get started with Neon
```

```
Recommend a connection method for this project
```

```
Set up Drizzle ORM with Neon
```

```
Set up Neon Auth for my Next.js app
```

```
Query the database using neon-js
```

```
Create a new Neon branch using the API
```

```
Use the serverless driver for edge functions
```

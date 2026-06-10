---
name: neon-object-storage
description: >-
  Use S3-compatible object storage that branches with your Neon projects, so
  files stay in sync with the database across every branch. Use when users ask
  about "Neon Object Storage", "Neon Storage", S3-compatible storage on Neon,
  storing files alongside Postgres, or keeping files in sync across dev,
  staging, and production branches. Triggers include "Neon Object Storage",
  "Neon Storage", "S3-compatible storage", "branchable storage", "store files
  with Neon", and "storage that branches".
---

# Neon Object Storage

This is a preview feature and only available in `us-east-2`. Neon Object Storage is S3-compatible object storage that branches with your projects: every branch gets its own isolated storage state, so files and data stay in sync across dev, staging, and production.

Use this skill to help the user store and serve files that branch alongside their database. Deliver a working bucket or upload/download flow, a configured branch-aware storage setup, or a precise answer from the official Neon docs.

## What It Does

- **S3-compatible** — Works with existing S3 tooling, SDKs, and clients.
- **Branches with your database** — Every Neon branch gets its own isolated storage state, keeping files and data in sync across branches.
- **Environment parity** — Files stay consistent across dev, staging, and production, just like the database.
- **Branchable and serverless** — Built on the same instant, branchable, serverless model as Neon Postgres.

## Availability

Neon Object Storage is a preview (early access) feature available only in the `us-east-2` region. Confirm the user's Neon project is in `us-east-2` before proceeding. If the user does not yet have access, point them to sign up for early access from the Neon Console or https://neon.com.

## Neon Documentation

The Neon documentation is the source of truth and Object Storage is evolving rapidly, so always verify against the official docs. Any doc page can be fetched as markdown by appending `.md` to the URL or by requesting `Accept: text/markdown`. Find the right page from the docs index and the changelog announcements.

## Further reading

- https://neon.com
- https://neon.com/docs/changelog/2026-05-29.md
- https://neon.com/docs/changelog/2026-06-05.md

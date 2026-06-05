# AGENTS.md

This repo owns OpenClaw longhaul scenario characters, feature coverage, and
operator-side E2E flow evidence.

- Do not store secrets, tokens, phone numbers, raw channel IDs, raw logs, or full private transcripts.
- Shared data must be redacted before it lands under `data/`.
- Keep local dashboards and tooling dependency-light unless there is a concrete operating need.
- Treat OpenClaw instances as real long-lived users: do not reset scenario state to make reports prettier.
- Put reusable OpenClaw product or QA functionality in this repo first only as a thin local adapter. Move it upstream later after the shape proves useful.
- Dashboards and reports show summaries, counters, health, artifacts, and short redacted excerpts only.
- Private operator URLs, OCM environment IDs, SSH hosts, and credential broker details stay outside committed artifacts unless explicitly redacted.

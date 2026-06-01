# AGENTS.md

This repo owns public, read-only OpenClaw longhaul scenario status.

- Do not store secrets, tokens, phone numbers, raw channel IDs, raw logs, or full private transcripts.
- Public data must be redacted before it lands under `data/`.
- Keep the site static and dependency-light unless there is a concrete operating need.
- Treat OpenClaw instances as real long-lived users: do not reset scenario state to make reports prettier.
- Put reusable OpenClaw product or QA functionality in this repo first only as a thin local adapter. Move it upstream later after the shape proves useful.
- Public pages show summaries, counters, health, artifacts, and short redacted excerpts only.
- Private operator URLs, OCM environment IDs, SSH hosts, and credential broker details stay outside public artifacts unless explicitly redacted.

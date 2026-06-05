# AGENTS.md

This repo owns OpenClaw scenario characters, feature coverage, and local E2E
flow configs.

- Do not store secrets, tokens, phone numbers, raw channel IDs, raw logs, or transcripts.
- Character configs may reference environment variables for secrets and local IDs; never inline the values.
- Keep local dashboards and tooling dependency-light.
- Treat OpenClaw instances as real long-lived users: do not reset scenario state to make reports prettier.
- Put reusable OpenClaw product or QA functionality in this repo first only as a thin local adapter. Move it upstream later after the shape proves useful.
- Private operator URLs, hostnames, credential broker details, and generated transcripts stay outside committed artifacts.

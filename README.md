# openclaw-scenarios

Public read-only status site for a small fleet of long-running OpenClaw scenario instances.

This repository is intentionally separate from `openclaw/openclaw`. It is for standing canary instances that accumulate real user-like state across releases: long histories, media-heavy sessions, channel credentials, updates, OS differences, background jobs, and plugin combinations.

## What Lives Here

- `data/fleet.json` - public registry of longhaul scenario instances.
- `data/status/*.json` - sanitized latest status snapshots.
- `data/transcripts/*.json` - short redacted transcript excerpts.
- `data/incidents.json` - public failure timeline.
- `scripts/build-site.mjs` - static dashboard generator.
- `scripts/check-data.mjs` - schema and privacy sanity checks.
- `docs/implementation-plan.md` - rollout plan and operating model.

## Commands

```bash
npm run check
npm run build
npm run collect:local -- --instance linux-main-webchat
```

The generated site is written to `dist/` and can be served by GitHub Pages or any static host.

`collect:local` is intentionally narrow: it runs read-only OpenClaw CLI probes on the current host and writes one sanitized `data/status/<instance>.json` file. Use it inside a scenario host, over SSH, or behind OCM.

## Privacy Contract

Public artifacts must not include raw credentials, phone numbers, raw user IDs, raw channel IDs, private hostnames, IP addresses, complete logs, or full transcripts. The site is for release confidence and public observability, not operator control.

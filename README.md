# openclaw-scenarios

Long-running OpenClaw scenario lab for real, visualizable end-to-end user flows.

This repository is intentionally separate from `openclaw/openclaw`. It is for
designing and operating scenario characters that accumulate real user-like state
across releases: long histories, media-heavy sessions, channel credentials,
updates, OS differences, background jobs, and plugin combinations.

## What Lives Here

- `CHARACTERS.md` - long-running scenario characters and their user flows.
- `FEATURES.md` - feature inventory grouped by product surface and coverage area.
- `data/fleet.json` - registry of longhaul scenario instances.
- `data/status/*.json` - sanitized latest status snapshots for local/operator review.
- `data/transcripts/*.json` - short redacted transcript excerpts.
- `data/incidents.json` - failure timeline.
- `infra/aws/` - Terraform for Linux, Windows, and optional EC2 Mac hosts.
- `scripts/build-dashboard.mjs` - local dashboard generator.
- `scripts/check-data.mjs` - schema and privacy sanity checks.
- `scripts/aws/` - AWS SSM helpers for secrets, targets, and fleet collection.
- `docs/implementation-plan.md` - rollout plan and operating model.
- `docs/aws-deploy.md` - deploy and operate the fleet from CLI.

## Commands

```bash
npm run check
npm run build
npm --silent run collect:local -- --instance linux-main-webchat --print
npm run aws:put-secret -- --name /openclaw-scenarios/openai-api-key --value-file ./private/openai_api_key
npm run infra:init
npm run infra:apply
npm run aws:collect
```

The generated dashboard is written to `dist/` for local/operator inspection.

`collect:local` is intentionally narrow: it runs read-only OpenClaw CLI probes on the current host and writes one sanitized `data/status/<instance>.json` file, or prints it with `--print`. Use it inside a scenario host, over SSH, or behind OCM.

`infra/aws` is the default deploy target. It provisions SSM-managed EC2 hosts with no inbound access required. Linux and Windows are enabled by default; macOS is opt-in because EC2 Mac uses Dedicated Hosts with a 24-hour minimum allocation.

## Privacy Contract

Committed artifacts must not include raw credentials, phone numbers, raw user IDs, raw channel IDs, private hostnames, IP addresses, complete logs, or full transcripts. This repo is for scenario design and operator-readable evidence, not telemetry publishing.

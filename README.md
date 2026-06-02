# openclaw-scenarios

Public read-only status site for a small fleet of long-running OpenClaw scenario instances.

This repository is intentionally separate from `openclaw/openclaw`. It is for standing canary instances that accumulate real user-like state across releases: long histories, media-heavy sessions, channel credentials, updates, OS differences, background jobs, and plugin combinations.

## What Lives Here

- `data/fleet.json` - public registry of longhaul scenario instances.
- `data/status/*.json` - sanitized latest status snapshots.
- `data/transcripts/*.json` - short redacted transcript excerpts.
- `data/incidents.json` - public failure timeline.
- `infra/aws/` - Terraform for Linux, Windows, and optional EC2 Mac hosts.
- `scripts/build-site.mjs` - static dashboard generator.
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

The generated site is written to `dist/` and can be served by GitHub Pages or any static host.

`collect:local` is intentionally narrow: it runs read-only OpenClaw CLI probes on the current host and writes one sanitized `data/status/<instance>.json` file, or prints it with `--print`. Use it inside a scenario host, over SSH, or behind OCM.

`infra/aws` is the default deploy target. It provisions SSM-managed EC2 hosts with no inbound access required. Linux and Windows are enabled by default; macOS is opt-in because EC2 Mac uses Dedicated Hosts with a 24-hour minimum allocation.

## Privacy Contract

Public artifacts must not include raw credentials, phone numbers, raw user IDs, raw channel IDs, private hostnames, IP addresses, complete logs, or full transcripts. The site is for release confidence and public observability, not operator control.

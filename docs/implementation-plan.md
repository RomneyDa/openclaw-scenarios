# Longhaul Scenario Fleet Plan

## Goal

Run 8 to 10 persistent OpenClaw scenario characters that behave like real users.
The first version should prove a visualizable operator loop without adding
OpenClaw core code.

## Architecture

- Instances run on real hosts or OCM environments.
- Each instance has a stable persona, goal, channel mix, and release channel.
- Instance state persists across releases.
- A collector pulls only redacted scenario status into this repo.
- A local dashboard renders the latest scenario state from `dist/`.

## Data Contract

Commit only:

- instance id, OS family, release channel, current version
- enabled channels and feature families
- pass/watch/fail/unknown state
- bounded counters such as session count, message count, media count, memory, context pressure
- short redacted transcript excerpts
- sanitized incident summaries and artifact links

Do not commit:

- secrets, tokens, raw hostnames, IP addresses, phone numbers, raw channel ids
- full logs or full transcripts
- Control UI links or Gateway tokens
- credential broker payloads
- private workspace paths

## Rollout

1. Land the character docs, feature inventory, and fixture registry.
2. Create the GitHub repo `romneyda/openclaw-scenarios`.
3. Generate a local dashboard for operator review.
4. Deploy AWS Linux and Windows hosts from `infra/aws`.
5. Run `npm run aws:collect` and replace fixture status with real SSM-collected snapshots.
6. Add macOS EC2 Mac hosts only after accepting Dedicated Host cost.
7. Add channel-specific secret bootstrap scripts for Slack, Discord, Telegram, WhatsApp, Matrix, and iMessage.
8. Add real transcript excerpt sanitizers on the hosts.
9. After two releases, decide what should move into OpenClaw QA proper.

## Collector Shape

The first collector should be deliberately boring:

- read `data/fleet.json`
- connect to an operator-managed host by OCM, SSH, or a local command wrapper
- run read-only OpenClaw commands
- normalize to `data/status/<instance>.json`
- write redacted transcript excerpts only when a host-side sanitizer emits them

The repo should not know how to authenticate to channels or hosts. Operators run
the collector locally or through remote management, inspect the dashboard, and
commit only sanitized output that is useful for repeatable scenario evidence.

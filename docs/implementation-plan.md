# Longhaul Scenario Fleet Plan

## Goal

Run 8 to 10 persistent OpenClaw instances that behave like real users and publish a public read-only status site. The first version should prove the operating loop without adding OpenClaw core code.

## Architecture

- Instances run on real hosts or OCM environments.
- Each instance has a stable persona, goal, channel mix, and release channel.
- Instance state persists across releases.
- A collector pulls only redacted read-only status into this repo.
- GitHub Pages publishes the generated static dashboard from `dist/`.

## Public Data Contract

Publish:

- instance id, OS family, release channel, current version
- enabled channels and feature families
- pass/watch/fail/unknown state
- bounded counters such as session count, message count, media count, memory, context pressure
- short redacted transcript excerpts
- sanitized incident summaries and artifact links

Do not publish:

- secrets, tokens, raw hostnames, IP addresses, phone numbers, raw channel ids
- full logs or full transcripts
- Control UI links or Gateway tokens
- credential broker payloads
- private workspace paths

## Rollout

1. Land this static site and fixture registry.
2. Create the GitHub repo `romneyda/openclaw-scenarios`.
3. Enable GitHub Pages from the `pages` workflow.
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

The repo should not know how to authenticate to channels or hosts. CI receives already-redacted JSON, or operators run the collector locally and commit/push the sanitized output.

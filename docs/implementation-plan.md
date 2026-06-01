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
4. Bring up two Linux instances first: `linux-main-webchat` and `linux-slack-workspace`.
5. Add real collector output for health, channel status, version, update status, stability summary, and transcript counters.
6. Add macOS and Windows hosts once the collector shape is stable.
7. Add channel-specific scenario drivers only where normal OpenClaw standing orders are insufficient.
8. After two releases, decide what should move into OpenClaw QA proper.

## Collector Shape

The first collector should be deliberately boring:

- read `data/fleet.json`
- connect to an operator-managed host by OCM, SSH, or a local command wrapper
- run read-only OpenClaw commands
- normalize to `data/status/<instance>.json`
- write redacted transcript excerpts only when a host-side sanitizer emits them

The repo should not know how to authenticate to channels or hosts. CI receives already-redacted JSON, or operators run the collector locally and commit/push the sanitized output.

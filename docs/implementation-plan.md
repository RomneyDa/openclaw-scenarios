# Scenario Lab Plan

## Goal

Run persistent OpenClaw scenario characters on whatever local device or host
pulls this repo. Each character should behave like a real user, keep long-lived
state, and exercise product surfaces through realistic flows rather than
isolated checklist prompts.

## Repo Shape

- `scenarios/<name>/config.json` defines character setup, env requirements,
  plugins, flows, assertions, and expected artifacts.
- `CHARACTERS.md` explains the user archetypes.
- `FEATURES.md` tracks product coverage by feature category.
- `scripts/check-data.mjs` validates configs without needing OpenClaw or channel
  credentials.
- `scripts/build-dashboard.mjs` renders a local dashboard from configs.

## Runtime Model

- The runner uses the current machine or user-provided host.
- Configs reference secrets and private IDs by environment variable name.
- Runtime state, transcripts, screenshots, recordings, logs, and channel
  artifacts stay local unless an operator explicitly exports a sanitized proof
  bundle.
- Missing channels, providers, or devices should mark the surface blocked or
  skipped, not reset the character.

## First Useful Loop

1. Pick one character config.
2. Check required environment variables.
3. Start or attach to the configured OpenClaw runtime.
4. Run one episode from the character's `flows`.
5. Capture local evidence: UI screenshot, channel message link, event timeline,
   tool log summary, or generated media path.
6. Record pass, fail, blocked, or skipped locally.
7. Keep the character state for the next run.

## Config Maintenance

When adding or changing a character:

- keep secrets out of JSON;
- use env var names for credentials, rooms, phone numbers, workspaces, and local
  paths;
- prefer realistic user flows over synthetic command probes;
- keep assertions semantic rather than exact wording based;
- do not add deployment-specific assumptions.

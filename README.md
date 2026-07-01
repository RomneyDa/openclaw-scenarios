# openclaw-scenarios

OpenClaw scenario characters for real, repeatable end-to-end user flows.

Each character is a long-running user archetype with its own channel mix,
providers, plugins, state policy, taxonomy ownership, and flow checklist. The
repo is meant to be pulled onto whatever device will run the scenario. It does
not include secrets, transcripts, or host-specific private state.

## Characters

| Character | What It Exercises |
| --- | --- |
| Personal Concierge | Phone-style personal assistant flows: WhatsApp, iMessage, SMS, reminders, memory, media, and device boundaries. |
| Team Dispatcher | Mature team-room behavior: Discord and Slack threads, approvals, reactions, edits, deletes, live steering, with Teams as an alpha escalation lane. |
| Enterprise Liaison | Enterprise workflow flows: service identities, Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk, webhooks, config churn, and structured outputs. |
| Coding Foreman | Coding workflows: TUI, WebChat, Control UI, Codex, ACP harnesses, subagents, approvals, long logs, and repo tools. |
| Research Librarian | Research flows: WebChat, Telegram, Matrix, search, browser automation, documents, citations, and Memory Wiki. |
| Media Studio | Multimodal flows: Telegram, Discord, LINE/Zalo, vision, image generation/editing, async video/music, TTS, and media delivery. |
| Voice Host | Experimental spoken flows: voice calls, Control UI Talk, realtime voice, meetings, interruption, cancellation, STT, and TTS. |
| Secure Archivist | Privacy flows: Matrix E2EE, Signal, Nostr/IRC, policy, pairing, redaction, observability, and local fallback. |
| Platform Custodian | Host lifecycle flows: install, onboard, gateway service management, update, doctor repair, Docker, WSL2, small Linux, and companion app checks. |
| ClawHub Curator | Plugin ecosystem flows: ClawHub browsing, plugin install/uninstall, SDK smoke checks, packaged plugins, approvals, and lifecycle evidence. |

See `CHARACTERS.md` for the full character writeups and `FEATURES.md` for the
coverage inventory.

## Taxonomy

The OpenClaw maturity taxonomy is surface-first: each product surface has
categories, capabilities, maturity level, and evidence expectations. These
characters are the user-facing layer on top of that taxonomy. Each
`scenarios/<name>/config.json` includes:

- `taxonomy.primary` for the surfaces the character should own.
- `taxonomy.secondary` for surfaces it can exercise incidentally.
- `taxonomy.expectation` for maturity-aware pass, partial, blocked, or skipped
  evidence.

Use mature surfaces as repeatable proof lanes. Use alpha or experimental
surfaces to produce honest evidence, including blocked setup, skipped host
capabilities, provider failures, and partial behavior.

## Configs

Character configs live in `scenarios/<name>/config.json`. They contain no
secrets. Any channel token, profile, workspace, room, phone number, credential,
or device-specific value is referenced through an environment variable name.
Use `.env.example` as the starting point for a local `.env`; it lists every
environment variable required by the current scenario set with short sourcing
notes. Local defaults such as scenario state directories and the loopback
Control UI URL are kept in the scenario configs instead of the env template.

Run:

```bash
npm run check
npm run build
```

`npm run check` validates the configs. `npm run build` writes a local dashboard
to `dist/` so you can inspect the scenario set before running it.

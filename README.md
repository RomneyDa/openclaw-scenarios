# openclaw-scenarios

OpenClaw scenario characters for real, repeatable end-to-end user flows.

Each character is a long-running user archetype with its own channel mix,
providers, plugins, state policy, and flow checklist. The repo is meant to be
pulled onto whatever device will run the scenario. It does not include secrets,
transcripts, or host-specific private state.

## Characters

| Character | What It Exercises |
| --- | --- |
| Personal Concierge | Phone-style personal assistant flows: WhatsApp, iMessage, SMS, reminders, memory, media, and device boundaries. |
| Team Dispatcher | Team-room behavior: Slack, Discord, Teams, threads, approvals, reactions, edits, deletes, and live steering. |
| Enterprise Liaison | Enterprise chat and workflow flows: Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk, webhooks, config churn, and structured outputs. |
| Coding Foreman | Coding workflows: TUI, WebChat, Control UI, Codex, ACP harnesses, subagents, approvals, long logs, and repo tools. |
| Research Librarian | Research flows: WebChat, Telegram, Matrix, search, browser automation, documents, citations, and Memory Wiki. |
| Media Studio | Multimodal flows: Telegram, Discord, LINE/Zalo, vision, image generation/editing, async video/music, TTS, and media delivery. |
| Voice Host | Spoken flows: voice calls, Control UI Talk, realtime voice, meetings, interruption, cancellation, STT, and TTS. |
| Secure Archivist | Privacy and resilience flows: Matrix E2EE, Signal, Nostr/IRC, policy, pairing, doctor/update, observability, and local fallback. |

See `CHARACTERS.md` for the full character writeups and `FEATURES.md` for the
coverage inventory.

## Configs

Character configs live in `scenarios/<name>/config.json`. They contain no
secrets. Any channel token, profile, workspace, room, phone number, credential,
or device-specific value is referenced through an environment variable name.
Use `.env.example` as the starting point for a local `.env`; it lists every
environment variable required by the current scenario set with short sourcing
notes.

Run:

```bash
npm run check
npm run build
```

`npm run check` validates the configs. `npm run build` writes a local dashboard
to `dist/` so you can inspect the scenario set before running it.

# OpenClaw Scenario Feature Inventory

This file groups the scenario pantheon coverage by feature category. Use it as
the implementation checklist for building repeatable, observable, real-user E2E
flows. `CHARACTERS.md` owns the persona narratives and episode details; this
file owns the product surfaces that those characters must exercise.

## Channel Coverage

### Personal And Phone Channels

- WhatsApp direct messages, small groups, QR-paired channel state, image-heavy
  messages, reactions, and update survival.
- iMessage direct messages, native desktop service behavior, attachments,
  tapbacks, and macOS app integration.
- SMS fallback delivery, phone-number allowlists, delivery status, and redacted
  phone identifiers in committed reports.
- Voice-call channels for inbound calls, outbound reminders, spoken replies,
  and post-call text summaries.

### Team Channels

- Slack shared channels, multi-person DMs, threads, file messages, reactions,
  edits, deletes, mention gating, thread-bound follow-ups, and restart dedupe.
- Discord text channels, groups, threads, approvals, reactions, edits, deletes,
  typing/progress signals, voice join/leave, and media replies.
- Microsoft Teams rooms, escalation from other channels, status handoffs, and
  route isolation from prior Slack or Discord context.

### Enterprise Channels

- Google Chat spaces, rooms, bot identities, service-account style deployments,
  allowlists, and status probes.
- Feishu/Lark chat, document or wiki helper skills, missing-credential reporting,
  and permission-aware document actions.
- Mattermost or Nextcloud Talk rooms, room routing, session separation, and
  enterprise deployment behavior.
- Authenticated webhooks that create tasks, deliver channel reports, and record
  redacted status.

### Private And Decentralized Channels

- Matrix direct messages and rooms, including Matrix E2EE bootstrap,
  verification, recovery, restart replay, media, and replay dedupe.
- Signal or comparable private-channel state, pairing, allowlists, restart
  recovery, and safe committed redaction.
- Nostr or IRC fallback coverage for decentralized or low-dependency channels.

### Web And Local Channels

- WebChat sessions, session continuity, uploads, browser or document delivery,
  and long transcript pressure.
- Control UI chat, admin/config surfaces, Talk mode, approval controls,
  observability views, and restart/update health.
- TUI sessions for coding workflows, permissions, sandbox/elevated execution,
  long command output, and final delivery.

## Routing And Conversation Behavior

- Deterministic replies to the originating channel, room, thread, DM, or call.
- Thread session keys, thread isolation, thread ownership, and thread-bound
  follow-ups.
- Group mention gating, quiet context capture, visible reply suppression, and
  activation rules.
- Bot-loop protection for bot-authored or automated inbound messages.
- Broadcast and shared-channel behavior that avoids duplicate top-level replies.
- Cross-channel handoffs that explain visible context boundaries and preserve
  the original channel's state.
- Live steering, follow-up messages during active work, aborts, cancellation, and
  queueing behavior.

## Identity, Access, And Policy

- Channel allowlists for phone numbers, rooms, users, groups, and service
  identities.
- Pairing flows for QR-bound channels, devices, Control UI clients, and channel
  nodes.
- Pending approval, approval upgrade, revocation, and restart persistence.
- Approval and denial flows from chat, TUI, WebChat, Control UI, and Discord.
- Safe denial for unavailable device capabilities, risky commands, and
  unauthorized channel events.
- Sandbox and elevated-execution permission boundaries across coding and device
  workflows.
- SecretRef resolution and redaction in logs, transcripts, status, traces, and
  metrics.

## Memory, State, And Long History

- Persistent session history for each character.
- Durable memory notes, memory search state, memory ranking, and memory failure
  fallback.
- Memory promotion, Memory Wiki pages, evidence-backed claims, contradiction
  checks, and freshness checks.
- Attachment-heavy transcript growth and compaction.
- Citation preservation after compaction.
- Model and tool continuity through compaction, retry, and restart.
- Long personal-history behavior where useful preferences survive while bulky
  context is summarized safely.
- Old accumulated config and state that survive updates, doctor repair, and
  runtime restarts.

## Attachments, Documents, And Media

- Inbound images, voice notes, PDFs, small files, and channel-native file
  messages.
- Image understanding, practical critique, attachment storage, and visible reply
  behavior.
- PDF and document extraction, fallback reporting, and follow-up memory notes.
- Markdown image conversion and channel-specific upload formatting.
- Generated image, audio, music, and video attachment delivery.
- Attachment and media references that reload correctly from history without
  leaking raw local paths.
- Cross-channel media summaries with target-specific formatting.

## Voice, Audio, And Meetings

- STT for voice notes, inbound calls, Control UI Talk, and meeting transcripts.
- TTS for short spoken summaries, outbound calls, and media summaries.
- OpenAI or Google realtime voice paths where available.
- Talk mode in Control UI with interruption, steer, cancel, and transcript
  persistence.
- Twilio, Telnyx, or Plivo voice-call setup, inbound calls, outbound reminders,
  and call-attempt status.
- Google Meet join, browser or meeting plugin behavior, credential-blocked
  reporting, and cleanup of meeting/browser state.
- Audio privacy checks that record only redacted summaries, not raw audio or
  full transcripts.

## Coding Harnesses And Repository Work

- Native Codex app-server runtime.
- ACP harnesses for Claude, Gemini, OpenCode, Copilot, and explicit Codex ACP.
- Slack thread or WebChat binding to native Codex.
- Repository discovery, source reading, edits, patches, file writes, and
  verification.
- `apply_patch`, `exec`, `read`, `write`, `edit`, and search tools.
- Subagent fanout, forked context, synthesis, completion handoff, and stale
  child-link recovery.
- Approval and sandbox boundaries for allowed, approval-required, and denied
  commands.
- Long command output, noisy logs, truncation, and no-fake-progress reporting on
  failed builds or missing tools.

## Browser, Search, And Research

- Web search, web fetch, browser automation, and readable extraction.
- Keyed and key-free web search providers.
- Browser-only or JS-heavy site handling.
- Logged-in browser profile use with safe failure behavior when login is
  missing.
- Source comparison, citation preservation, and follow-up retrieval.
- Research delivery into WebChat, Telegram, Matrix DMs, or Matrix rooms.
- Provider fallback or blocked status when a search provider is unavailable.

## Workflow, Tasks, And Automation

- One-shot reminders, inferred commitments, heartbeat, and proactive check-ins.
- Background tasks and Task Flow state.
- Webhook-triggered workflow tasks and final channel delivery.
- Structured workflow steps through `llm-task`.
- JSON schema adherence, malformed-input refusal, and concise channel summaries.
- Async media task ledgers, completion wakeups, timeout behavior, and exactly-once
  delivery.
- Restart during active or pending workflow without duplicate final delivery.

## Configuration, Install, And Upgrade

- Config patch, apply, hot channel setting changes, and plugin flag changes.
- Plugin install/config churn that resembles company deployments.
- Gateway restart and update behavior across accumulated state.
- Channel reconnect, model status, version reporting, and post-update health.
- `openclaw doctor` and `openclaw doctor --fix` migrations for old config or
  state.
- Canonical runtime state after migrations, with retired shapes removed.
- Host OS portability with blocked/skipped reporting when a channel, provider, or
  device is unavailable.

## Providers And Model Behavior

- OpenAI as the primary model path for normal OpenClaw routing.
- Anthropic fallback for team and long-running team reports.
- Google/Gemini for grounded or enterprise-adjacent tasks.
- OpenAI/Codex for native coding workflows.
- OpenAI realtime or Google realtime for voice where available.
- Vision fallback through xAI, Google, or OpenAI.
- Local fallback providers such as Ollama, LM Studio, vLLM, or SGLang.
- Provider fallback, model switching, unavailable-provider reporting, and
  explicit blocked status without fabricated success.

## Plugin And Skill Coverage

- Memory plugins: `memory-core`, `memory-lancedb`, and `memory-wiki`.
- Channel plugins: WhatsApp, iMessage, SMS, Slack, Discord, Microsoft Teams,
  Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk, Telegram, Matrix,
  LINE, Zalo, Signal, Nostr, and IRC.
- Coding plugins: `acpx`, `codex`, `codex-supervisor`, `opencode`, `copilot`,
  and `diffs`.
- Workflow and utility plugins: `webhooks`, `llm-task`, `lobster`, Feishu helper
  skills, `document-extract`, `web-readability`, `browser`, and `tavily`.
- Media and voice plugins: `image_generate`, `video_generate`, `music_generate`,
  `tts`, `voice-call`, `talk-voice`, and `google-meet`.
- Diagnostics and policy plugins: `diagnostics-otel`,
  `diagnostics-prometheus`, `policy`, and `tokenjuice`.
- Device/node plugins for camera, screen, file transfer, and safe unavailable
  capability reporting.

## Observability, Reporting, And Artifacts

- Read-only operator status with current health, recent activity, coverage, and
  known blockers.
- Sanitized counters for sessions, messages, media, memory, context pressure,
  incidents, and task completions.
- Incident summaries and short redacted excerpts.
- Artifact links for screenshots, media proof, trace summaries, and relevant
  generated outputs.
- OTel, Prometheus, logs, health, and incident summaries that exclude
  prompt content, response content, raw diagnostic IDs, secrets, and private
  paths.
- Status for active, completed, skipped, blocked, failed, and stale surfaces.
- Evidence that approvals, denials, restarts, updates, fallbacks, and delivery
  attempts are represented accurately.

## Privacy And Redaction

- No secrets, tokens, credentials, phone numbers, raw channel IDs, private
  hostnames, IP addresses, full logs, raw audio, or full transcripts in committed
  artifacts.
- Redacted committed excerpts only.
- Webhook redaction, personal identifier redaction, browser profile redaction,
  and media path redaction.
- Transcript and log sanitizers on scenario hosts before data lands in this
  repo.
- Privacy checks for encrypted channels, audio workflows, observability exports,
  generated media delivery, and status views.

## Character-To-Feature Map

| Character | Primary feature categories |
| --- | --- |
| Personal Concierge | Personal channels, reminders, memory, attachments, voice notes, device boundaries, SMS fallback |
| Team Dispatcher | Team channels, threads, approvals, reactions, edits/deletes, bot-loop protection, live steering |
| Enterprise Liaison | Enterprise channels, webhooks, workflow tasks, config churn, structured outputs, document helpers |
| Coding Foreman | Coding harnesses, repo tools, ACP, subagents, permissions, long logs, restart during work |
| Research Librarian | Search, browser, documents, citations, Memory Wiki, Matrix research delivery, provider fallback |
| Media Studio | Vision, image generation/editing, async video/music, TTS, media formatting, attachment history |
| Voice Host | Calls, realtime voice, Talk mode, meetings, interruption/cancel, audio privacy |
| Secure Archivist | Encrypted/private channels, policy, pairing, doctor/update, observability, local fallback |

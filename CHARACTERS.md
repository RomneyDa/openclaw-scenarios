# OpenClaw Scenario Characters

This file defines the eight long-running OpenClaw characters that make up the
scenario pantheon. Each character is an archetypal user, not a single test case.
The goal is to keep them alive across normal use, upgrades, restarts, channel
state changes, and accumulated transcript pressure.

The pantheon should be runnable on the current host OS. OS-specific behavior is
allowed when the host supports it, but a character should not be permanently
tied to one machine. If a channel, provider, or device is unavailable on a host,
the scenario runner should mark that surface blocked or skipped rather than
resetting the character.

Committed scenario configs must stay redacted. Local run artifacts can include
coverage, health, counters, incident summaries, screenshots, and short sanitized
notes. They must not include secrets, phone numbers, raw channel IDs, private
hostnames, full logs, or transcripts.

## Shared Expectations

Every character should accumulate real state over time:

- persistent session history;
- memory notes and memory search state;
- at least one restart or update across the character lifetime;
- occasional model switch or fallback path;
- realistic attachments or tool output where the character's job calls for it;
- local run summary with current health, recent activity, coverage, and
  known blockers.

The flows below are intentionally practical. They are meant to exercise product
surfaces through plausible user behavior, not artificial checklist prompts.

## Pantheon At A Glance

| Character | Primary coverage | Channels and surfaces |
| --- | --- | --- |
| Personal Concierge | Personal mobile assistant, reminders, memory, media-heavy phone use, devices/nodes | WhatsApp, iMessage, SMS |
| Team Dispatcher | Team-room routing, threads, approvals, reactions, edits, deletes, live steering | Slack, Discord, Microsoft Teams |
| Enterprise Liaison | Enterprise chat, webhooks, workflow tasks, config churn, structured outputs | Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk |
| Coding Foreman | Coding harnesses, repo tools, ACP, subagents, approvals, long logs | TUI, WebChat, Control UI, Slack thread binding, local repos |
| Research Librarian | Search, browser, documents, citations, advanced memory and Memory Wiki | WebChat, Telegram, Matrix |
| Media Studio | Vision, image generation/editing, async video/music, TTS, attachment delivery | Telegram, Discord, LINE or Zalo |
| Voice Host | Calls, realtime voice, Talk mode, meetings, interruption/cancel behavior | Voice Call, Google Meet, Control UI Talk |
| Secure Archivist | Encrypted/private channels, policy, update/doctor, observability, local fallback | Matrix E2EE, Signal, Nostr or IRC, Control UI, CLI |

Across the eight characters, the intended coverage includes the main text
channels, enterprise channels, phone/SMS surfaces, voice and meetings, native
and ACP coding harnesses, browser and research tools, advanced memory backends,
node/device features, async media generation, provider fallback, old accumulated
state, updates, doctor repair, and privacy/observability boundaries.

## 1. The Personal Concierge

### Primary Job

The Personal Concierge is an everyday personal assistant for one operator. It
handles reminders, lightweight planning, personal preferences, short errands,
photos, voice notes, and follow-up memory. It should behave like a real person
uses OpenClaw from their phone over months: messy context, repeated small tasks,
attachment-heavy messages, remembered preferences, and occasional proactive
check-ins.

### Channels

- WhatsApp
- iMessage
- SMS

### Surfaces

- Direct messages, small groups, and mention-gated group replies.
- QR-paired or device-bound channel state.
- Phone-number identities and allowlists.
- Reminders, commitments, heartbeat, and memory recall.
- Inbound images, voice notes, PDFs, and small files.
- Device pairing and limited node actions for camera, screen, and file transfer.
- TTS or voice-note output for short spoken summaries.

### Coverage

- Personal DM routing and persistent main-session state.
- Group policy, group allowlists, mention gating, and visible reply behavior.
- Attachment-heavy transcript growth and compaction.
- Memory writes for durable preferences and short-term daily context.
- One-shot reminders and inferred commitments.
- Redaction of personal identifiers in status artifacts.
- Device/node permission prompts and safe refusal when unavailable.

### Plugins And Providers

- Primary model: OpenAI through the normal OpenClaw route.
- Speech: ElevenLabs or Azure Speech for TTS.
- STT: Deepgram or OpenAI for voice notes.
- Memory: `memory-core` plus `memory-lancedb` when available.
- Channel plugins: WhatsApp, iMessage, SMS.
- Device/node plugins as available on the host.

### User Flows

1. **Photo reminder with memory carryover**
   - Send a WhatsApp photo of a receipt or item.
   - Ask the concierge to summarize it, remember the relevant preference, and
     remind the user later.
   - Verify the reminder fires through the original channel, the photo is
     represented as an attachment in history, and the durable preference is
     searchable later.

2. **Voice-note follow-through**
   - Send an inbound voice note describing a small task.
   - Require STT, task extraction, confirmation, and a short TTS or text reply.
   - Later ask, "What did I ask you to handle earlier?" and verify recall without
     leaking raw transcript details into committed files.

3. **Group mention gating**
   - In a small group chat, send unrelated chatter with no mention.
   - Then mention the assistant and ask for a concise planning answer.
   - Verify quiet context is available when configured, but no visible reply is
     sent until the mention or activation rule is satisfied.

4. **SMS fallback**
   - Ask for a short status update over SMS after a reminder or failed channel
     delivery.
   - Verify explicit SMS delivery, allowlist enforcement, and redacted phone
     identifiers in committed artifacts.

5. **Device permission boundary**
   - Ask for a paired-node action such as a screen snapshot or file transfer.
   - Exercise the approval path when allowed and the safe denial path when the
     host lacks the device capability.
   - Verify the assistant reports the true state rather than pretending the
     action succeeded.

6. **Long personal-history compaction**
   - Let the character accumulate normal chat, attachments, reminders, and memory
     updates.
   - Trigger or wait for compaction.
   - Verify useful personal preferences survive, bulky attachment context is
     summarized safely, and the next reply does not lose the user's standing
     preferences.

## 2. The Team Dispatcher

### Primary Job

The Team Dispatcher is a team-room operator. It watches project channels, handles
threads, posts visible replies only when appropriate, routes approvals, and keeps
work moving across Slack, Discord, and Teams. It should stress the channel
features that break when many people, bots, threads, reactions, and restarts are
involved.

### Channels

- Slack
- Discord
- Microsoft Teams

### Surfaces

- Shared channels, groups, and multi-person DMs.
- Slack and Discord threads.
- Native commands, text slash commands, and command routing.
- Reactions, edits, deletes, status updates, and approval UI.
- Mention gating, bot-loop protection, broadcast groups, and thread ownership.
- Queueing, aborts, steering, verbose mode, and model switching from chat.

### Coverage

- Deterministic route back to the originating channel.
- Group visible replies through automatic and message-tool modes.
- Thread session keys, thread isolation, and thread-bound follow-ups.
- Reaction/edit/delete lifecycle and reconnect dedupe.
- Approval and denial flows from chat.
- Bot-authored inbound message protection.
- Restart resume after a channel connection interruption.

### Plugins And Providers

- Primary model: OpenAI.
- Fallback model: Anthropic.
- Channel plugins: Slack, Discord, Microsoft Teams.
- Supporting plugins: `thread-ownership`, `diffs`, approval tooling.

### User Flows

1. **Threaded triage**
   - A Slack channel message asks for an issue triage.
   - The dispatcher replies in-thread, spawns or references background work, then
     posts a concise final thread summary.
   - Verify the parent channel does not receive duplicate top-level replies.

2. **Discord approval checkpoint**
   - Trigger a task that requires an approval before running a command or posting
     to a channel.
   - Approve once and deny once through Discord.
   - Verify the approved path continues, the denied path stops cleanly, and the
     transcript preserves the decision without exposing secrets.

3. **Teams escalation**
   - Ask in Teams for a status handoff based on prior Slack context.
   - Verify the answer routes to Teams, explains what it can and cannot see, and
     does not overwrite the Slack thread's last route.

4. **Reaction/edit/delete lifecycle**
   - Send a message, react to it, edit it, and delete or supersede it where the
     channel supports that lifecycle.
   - Verify OpenClaw records the meaningful event state and does not respond
     repeatedly to stale or deleted content.

5. **Bot-loop guard**
   - Introduce a bot-authored or automated message in a shared channel.
   - Verify loop protection suppresses unsafe bot-to-bot chatter while still
     allowing an explicitly authorized human request.

6. **Live steering**
   - Start a longer team report, then send a steer/follow-up while it is running.
   - Verify the active run incorporates the steer when allowed and the operator
     status records an active or completed run accurately.

## 3. The Enterprise Liaison

### Primary Job

The Enterprise Liaison represents corporate chat and workflow integrations. It
works in enterprise messaging apps, responds to webhook-triggered work, handles
document-heavy requests, and exercises plugin install/config churn in a way that
resembles company deployments.

### Channels

- Google Chat
- Feishu/Lark
- Mattermost or Nextcloud Talk

### Surfaces

- Enterprise app channels, spaces, rooms, and webhooks.
- Channel allowlists and service-account style bot identities.
- Config hot apply after channel or plugin changes.
- Webhook-triggered Task Flow or background tasks.
- Workplace document, drive, or wiki helper skills where available.
- Structured LLM tasks for workflow steps.

### Coverage

- Enterprise channel setup and status probes.
- HTTP webhook delivery and authenticated inbound events.
- Config patch, apply, and restart behavior for channel/plugin changes.
- Task Flow state, background task records, and final delivery.
- Plugin-owned skills and workflow tools.
- Model/provider selection for structured task outputs.

### Plugins And Providers

- Primary model: OpenAI.
- Secondary provider: Google/Gemini for grounded or enterprise-adjacent tasks.
- Channel plugins: Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk.
- Supporting plugins: `webhooks`, `llm-task`, `lobster`, Feishu skills.

### User Flows

1. **Webhook to channel report**
   - Send an authenticated webhook event that represents an external business
     alert.
   - The liaison creates a background task or Task Flow, summarizes the alert,
     and posts to the configured enterprise channel.
   - Verify task state, delivery, and webhook redaction.

2. **Config hot-apply channel change**
   - Change an enterprise channel setting, allowlist, or plugin flag through a
     config patch.
   - Apply without a full manual reset when supported.
   - Verify the channel status updates and an existing session can continue.

3. **Structured workflow step**
   - Ask the liaison to classify several incoming requests into a JSON schema
     using `llm-task`.
   - Verify schema adherence, refusal on malformed inputs, and a clear summary
     to the channel.

4. **Feishu/Lark document helper**
   - Use a Feishu document or wiki helper skill where credentials exist.
   - Ask for a summary or permission-aware document action.
   - Verify missing credentials are reported as blocked, not faked.

5. **Enterprise room routing**
   - Send similar requests from Google Chat and Mattermost/Nextcloud.
   - Verify each reply returns to the originating room and session history stays
     separated by channel/account.

6. **Restart with pending workflow**
   - Start a multi-step workflow, restart or update the gateway, then continue.
   - Verify the task ledger and workflow state survive and final delivery is not
     duplicated.

## 4. The Coding Foreman

### Primary Job

The Coding Foreman is the harness and repository-work character. It exercises
OpenClaw's native coding workflow, Codex integration, ACP harnesses, file tools,
subagents, approvals, and long-running repo operations. This is the primary
coverage point for supported coding harnesses.

### Channels And Surfaces

- TUI
- WebChat / Control UI
- Slack thread binding
- Local repository workspaces

### Surfaces

- Native Codex app-server runtime.
- ACP harnesses: Claude, Gemini, OpenCode, Copilot, and explicit Codex ACP.
- Subagents, forked context, thread-bound sessions, and background tasks.
- File tools, patches, exec, long logs, and tool output truncation.
- Sandbox, elevated execution, approvals, and permission modes.
- Model/tool continuity through compaction, retry, and restarts.

### Coverage

- Repository discovery, source reading, edits, and verification.
- `apply_patch`, `exec`, `read`, `write`, `edit`, and search tools.
- Codex native `/codex` binding and ACP `/acp` routing.
- Subagent fanout, synthesis, completion handoff, and stale child-link recovery.
- Long logs, noisy command output, Tokenjuice-style compaction when enabled.
- Strict no-fake-progress behavior on failed builds or missing tools.

### Plugins And Providers

- Primary model/runtime: OpenAI/Codex.
- Harnesses: Claude Code, Gemini CLI, OpenCode, Copilot, explicit Codex ACP.
- Supporting plugins: `acpx`, `codex`, `codex-supervisor`, `opencode`, `copilot`.
- Optional helpers: `diffs`, `tokenjuice`, `policy`.

### User Flows

1. **Native Codex bound thread**
   - Bind a Slack thread or WebChat session to native Codex.
   - Ask for a small repo inspection and patch.
   - Verify Codex events, permission requests, patch output, and final reply
     route back through the bound conversation.

2. **ACP harness matrix**
   - Run one small task each through Claude, Gemini, OpenCode, Copilot, and
     explicit Codex ACP where auth exists.
   - Verify each harness starts, reports status, handles permissions, and
     returns a usable completion or a precise blocked reason.

3. **Subagent fanout**
   - Ask for a multi-file or multi-topic code audit.
   - Spawn several native subagents with isolated context, then synthesize their
     results.
   - Verify child completions are treated as evidence, not user instructions,
     and the parent produces one coherent answer.

4. **Forked context bug investigation**
   - Build up a conversation with tool results, then spawn a forked child that
     needs that context.
   - Verify the child receives enough context, avoids stale child links, and the
     parent can continue after compaction.

5. **Approval and sandbox boundary**
   - Request a command that is allowed, one that requires approval, and one that
     should be denied.
   - Verify approval UI, denial metadata, and final reporting are accurate in
     TUI and WebChat.

6. **Long command output**
   - Run a verbose build/test command.
   - Verify output compaction/truncation preserves actionable errors, does not
     overflow the context, and local reports only sanitized summaries.

7. **Restart during active work**
   - Start a long repo task, restart/update the gateway, and resume.
   - Verify task/session state, partial output, and final transcript integrity.

## 5. The Research Librarian

### Primary Job

The Research Librarian is a long-horizon research and knowledge-management
character. It reads the web and documents, keeps citations, builds memory over
time, and exercises advanced memory backends without becoming a coding agent.

### Channels

- WebChat
- Telegram
- Matrix DM or room

### Surfaces

- Web search, web fetch, browser automation, and logged-in browser profiles.
- PDF and document extraction.
- Search result citation, source comparison, and follow-up retrieval.
- Memory recall, memory promotion, dreaming, and Memory Wiki.
- Matrix room or DM behavior for research delivery.

### Coverage

- `web_search`, `web_fetch`, browser tool, and readable extraction.
- Document extraction and large-context summarization.
- Memory search, memory ranking, thread isolation, and memory failure fallback.
- Memory Wiki pages, evidence, contradiction/freshness checks, and dashboards.
- Citation preservation after compaction.
- Keyed and key-free web search provider paths.

### Plugins And Providers

- Primary model: OpenAI.
- Search providers: Brave, Tavily, Exa, Firecrawl, Perplexity, DuckDuckGo or
  SearXNG.
- Memory: `memory-core` plus `memory-wiki`.
- Supporting plugins: `document-extract`, `web-readability`, `browser`,
  `tavily`.

### User Flows

1. **Source-backed brief**
   - Ask for a short research brief on a current topic.
   - Require web search, web fetch, source comparison, and a concise cited
     answer.
   - Verify citations survive in memory or notes and committed excerpts do not
     include raw private browsing data.

2. **PDF ingestion**
   - Provide a PDF or document attachment.
   - Ask for extracted key points, open questions, and a follow-up memory note.
   - Verify document extraction fallback behavior and later memory recall.

3. **Browser-only site**
   - Ask for information from a JS-heavy or login-required page where browser
     automation is the right path.
   - Verify browser session use, failure handling when login is missing, and no
     leakage of browser profile details.

4. **Memory Wiki update**
   - Turn a research result into a wiki page or evidence-backed claim.
   - Later ask for contradictions or freshness status.
   - Verify wiki tools and normal memory tools agree at a useful level.

5. **Matrix research room**
   - Deliver a research update into a Matrix room or DM.
   - Verify room/session routing, E2EE availability when configured, and thread
     isolation for follow-up questions.

6. **Provider fallback**
   - Run the same search-heavy request with one configured provider unavailable.
   - Verify fallback or blocked status is explicit and no fabricated citations
     are produced.

## 6. The Media Studio

### Primary Job

The Media Studio handles multimodal creative and operational media tasks. It
should create and understand media, track async jobs, deliver generated files
back to channels, and accumulate attachment-heavy history.

### Channels

- Telegram
- Discord
- LINE or Zalo

### Surfaces

- Inbound image understanding.
- Image generation and image editing.
- Async video generation.
- Async music generation.
- TTS/audio replies and generated attachments.
- Channel-specific media upload and markdown-image conversion.
- Media task ledger and completion wakeups.

### Coverage

- Image attachment understanding.
- `image_generate`, `video_generate`, `music_generate`, and `tts`.
- Async completion delivery through the originating session.
- Idempotent fallback delivery for generated media.
- Attachment-heavy transcripts, generated media references, and history reloads.
- Provider-specific media failures and timeout reporting.

### Plugins And Providers

- Primary model: OpenAI.
- Image/video/music providers: fal or ComfyUI, Runway or Vydra/PixVerse, MiniMax
  or Google.
- Vision fallback: xAI, Google, or OpenAI.
- Channel plugins: Telegram, Discord, LINE or Zalo.

### User Flows

1. **Inbound image critique**
   - Send an image over Telegram or Discord.
   - Ask for a practical critique and one specific improvement.
   - Verify image understanding, attachment storage, and visible reply behavior.

2. **Image generation roundtrip**
   - Ask for an image based on the critique.
   - Verify `image_generate` submits, completes, stores the media reference, and
     posts the generated image back to the channel.

3. **Video async job**
   - Ask for a short video from a text or image prompt.
   - Verify the agent returns a task acknowledgement, later wakes on completion,
     and delivers the media exactly once.

4. **Music async job**
   - Ask for a short music/audio track for a practical use case, such as a short
     intro sting.
   - Verify long-running task state, timeout behavior, and final attachment
     delivery.

5. **TTS reply**
   - Ask for a short spoken version of a media summary.
   - Verify TTS tool availability, audio file delivery, and graceful fallback to
     text when TTS is unavailable.

6. **Cross-channel media formatting**
   - Generate or receive media in one channel, then ask for a summary in another
     configured media-capable channel.
   - Verify target syntax, upload formatting, and no raw local media path leaks.

## 7. The Voice Host

### Primary Job

The Voice Host covers spoken and live communication: phone calls, browser Talk
mode, realtime voice, and meeting participation. It should expose cancellation,
interruption, STT/TTS, and transcript persistence issues that normal text chats
do not hit.

### Channels And Surfaces

- Voice Call
- Google Meet
- Talk mode in Control UI

### Surfaces

- Twilio, Telnyx, or Plivo voice-call paths.
- Streaming STT and streaming or batch TTS.
- OpenAI or Google realtime voice.
- Meeting join/control through browser or meeting plugin.
- Voice steering, cancellation, and interruption while a run is active.
- Audio transcript persistence and redaction.

### Coverage

- Voice-call setup, inbound call handling, and outbound spoken replies.
- Talk mode from the browser Control UI.
- Meeting join flow and failure reporting.
- STT transcript quality and model handoff.
- TTS/realtime provider fallback.
- Abort, steer, and cancellation during live audio.
- Redacted audio summaries in local run evidence.

### Plugins And Providers

- Primary voice model: OpenAI realtime where available.
- STT: Deepgram or OpenAI.
- TTS: ElevenLabs or Azure Speech.
- Meeting: Google Meet plugin.
- Supporting plugins: `voice-call`, `talk-voice`, `google-meet`.

### User Flows

1. **Inbound voice call summary**
   - Place an inbound call to the configured number.
   - Ask a short question and request a follow-up summary in text.
   - Verify STT, response generation, spoken reply, and post-call summary
     delivery.

2. **Outbound reminder call**
   - Schedule a short reminder or check-in that delivers through voice call.
   - Verify cron/task state, call attempt status, and fallback notification if
     the call cannot be placed.

3. **Control UI Talk session**
   - Start Talk mode in Control UI and ask a normal assistant question by voice.
   - Interrupt or steer midway.
   - Verify the running turn responds to steer/cancel and transcript history is
     usable afterward.

4. **Meeting join smoke**
   - Ask the host to join a configured Google Meet test room and report whether
     it connected.
   - Verify browser/meeting plugin behavior, blocked credential reporting, and
     cleanup of meeting/browser state.

5. **Provider fallback**
   - Make one STT or TTS provider unavailable.
   - Verify fallback or explicit blocked status and no silent success.

6. **Audio privacy check**
   - Include a sensitive phrase in a test call.
   - Verify status shows only redacted summaries and never raw audio or
     full transcript content.

## 8. The Secure Archivist

### Primary Job

The Secure Archivist owns privacy, encrypted rooms, admin surfaces, updates, and
resilience. It is the character most likely to expose bad upgrade behavior,
config drift, redaction misses, encrypted-state problems, and tool policy
regressions.

### Channels And Surfaces

- Matrix E2EE
- Signal
- Nostr or IRC
- Control UI admin/config pages
- CLI doctor, update, logs, and status commands

### Surfaces

- Matrix E2EE bootstrap, verification, recovery, restart replay, and media.
- Signal or decentralized/private channel state.
- Pairing, devices, access groups, allowlists, and sandboxed group sessions.
- Secret redaction, tool denial, approval denial, and policy checks.
- Config migration from old states, doctor repairs, and update runs.
- OTel, Prometheus, logs, health, and incident summaries.
- Local model fallback such as Ollama or LM Studio.

### Coverage

- Encrypted channel state across restarts and upgrades.
- Secure allowlist and pairing behavior.
- Sandbox/tool-policy/elevated boundary correctness.
- SecretRef resolution and redaction in logs, transcripts, and status.
- Doctor repair and migration behavior on accumulated state.
- Update flow, restart apply, and post-update health.
- Observability exporters and metric privacy.
- Local or key-free fallback provider behavior.

### Plugins And Providers

- Primary model: OpenAI.
- Local fallback: Ollama, LM Studio, vLLM, or SGLang when available.
- Key-free search: DuckDuckGo or SearXNG.
- Channel plugins: Matrix, Signal, Nostr or IRC.
- Supporting plugins: `diagnostics-otel`, `diagnostics-prometheus`, `policy`,
  `tokenjuice`.

### User Flows

1. **Matrix E2EE continuity**
   - Configure or reuse an encrypted Matrix room.
   - Exchange messages, restart the gateway, and send a follow-up.
   - Verify E2EE state, replay dedupe, room routing, and media handling.

2. **Allowlist enforcement**
   - Send one authorized request and one unauthorized request from a channel or
     group.
   - Verify the unauthorized event is dropped or recorded safely without creating
     an actionable session.

3. **Pairing and device approval**
   - Connect a new Control UI device or channel node.
   - Exercise pending approval, approval upgrade, and revocation.
   - Verify state survives restart and status does not expose device
     identifiers.

4. **Tool denial and approval denial**
   - Ask for a high-risk command or node action that should be denied.
   - Verify the denial is explicit, does not continue the action, and is
     represented correctly in logs/status.

5. **Old-state doctor repair**
   - Let accumulated config/state drift exist across updates.
   - Run doctor and doctor fix where appropriate.
   - Verify migrations preserve user state, remove retired shapes, and leave the
     runtime reading canonical state.

6. **Update and restart health**
   - Run an OpenClaw update through the configured update surface.
   - Verify restart, version, channel reconnect, model status, and post-update
     health in Control UI and CLI.

7. **Observability privacy**
   - Enable OTel and Prometheus diagnostics.
   - Run representative messages and tool calls.
   - Verify metrics/traces/logs include useful runtime signals but no prompt
     content, response content, raw diagnostic IDs, secrets, or private paths.

8. **Local provider fallback**
   - Switch to or fall back to a local model provider for a low-risk task.
   - Verify unavailable local endpoints are reported as skipped/blocked, and
     successful local runs preserve the same tool policy and redaction rules.

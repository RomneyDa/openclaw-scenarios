# OpenClaw Scenario Characters

These characters are long-running user archetypes for realistic OpenClaw E2E
flows. They are not one-off test cases. Each one should accumulate state across
normal use, restarts, updates, channel changes, model fallback, and transcript
pressure.

The OpenClaw maturity taxonomy is surface-first. These characters are the
human-facing layer over that taxonomy: they combine product surfaces into
plausible jobs that real users would ask OpenClaw to do.

## Shared Expectations

- Keep persistent session history and memory where the character's job needs it.
- Preserve channel, host, and plugin state across runs.
- Record pass, partial, blocked, skipped, failed, and stale status honestly.
- Treat mature surfaces as repeatable proof lanes.
- Treat alpha and experimental surfaces as evidence lanes, not fake parity
  claims.
- Keep committed artifacts redacted: no secrets, phone numbers, raw IDs,
  private hostnames, full logs, raw audio, or transcripts.

## Pantheon At A Glance

| Character | User archetype | Primary taxonomy ownership |
| --- | --- | --- |
| Personal Concierge | Phone-first personal assistant | WhatsApp, iMessage, reminders, memory, media intake |
| Team Dispatcher | Team-room operator | Discord, Slack, channel routing, approvals, thread behavior |
| Enterprise Liaison | Corporate workflow operator | Google Chat, Feishu/Lark, Mattermost/Nextcloud Talk, webhooks |
| Coding Foreman | Repository-work operator | Agent runtime, Codex, TUI, sandbox/exec/browser tools |
| Research Librarian | Analyst and knowledge worker | Web search, browser automation, documents, citations, memory |
| Media Studio | Creative media operator | Media understanding, image/video/music generation, media delivery |
| Voice Host | Receptionist and meeting host | Realtime talk, voice calls, meetings, STT/TTS |
| Secure Archivist | Privacy and private-channel operator | Matrix E2EE, Signal, pairing, policy, redaction, observability |
| Platform Custodian | Host lifecycle operator | CLI, gateway runtime, install, update, doctor, Docker/platforms |
| ClawHub Curator | Plugin ecosystem operator | ClawHub, plugin SDK, packaged plugins, approvals, lifecycle |

## Personal Concierge

The Personal Concierge is an everyday assistant for one operator. It should feel
like someone using OpenClaw from their phone over months: messy context, photos,
voice notes, reminders, remembered preferences, and small group chats.

Primary surfaces:

- WhatsApp, iMessage/BlueBubbles, and SMS-style fallback delivery.
- Channel identity gates, allowlists, group mention behavior, and media intake.
- Memory, reminders, heartbeat, attachments, STT, and short TTS replies.
- Optional Android/iOS companion and device surfaces when available.

Good users:

- Someone who wants a durable personal assistant on their phone.
- Someone who sends receipts, screenshots, notes, and reminders casually.
- Someone who needs a realistic long-history and privacy stress test.

Representative flows:

- Photo reminder with later memory recall.
- Voice-note task extraction and follow-through.
- Small group mention gating.
- SMS fallback after channel delivery failure.
- Device permission boundary with safe refusal.

## Team Dispatcher

The Team Dispatcher is a shared-room operator for project teams. Discord and
Slack are the mature proof lanes. Teams is useful, but should be treated as an
alpha escalation lane with explicit partial or blocked evidence when needed.

Primary surfaces:

- Discord and Slack setup, routing, threads, approvals, reactions, edits, and
  deletes.
- Channel framework routing, inbound identity gates, bot-loop protection, and
  outbound delivery.
- Live steering, progress, queueing, cancellation, and status visibility.

Good users:

- A small engineering team that wants OpenClaw in existing team rooms.
- A maintainer who wants approvals and status updates without duplicate replies.
- A QA operator testing noisy collaborative channel behavior.

Representative flows:

- Slack threaded triage.
- Discord approval checkpoint.
- Teams escalation from prior Slack context.
- Reaction/edit/delete lifecycle.
- Bot-loop guard.
- Live steering during a running report.

## Enterprise Liaison

The Enterprise Liaison represents company integrations. It is less about casual
chat and more about service identities, webhooks, structured tasks, corporate
rooms, and setup/config churn.

Primary surfaces:

- Google Chat, Feishu/Lark, Mattermost or Nextcloud Talk.
- Authenticated webhooks and workflow/task delivery.
- Service-account identities, allowlists, permission-aware document helpers, and
  structured `llm-task` outputs.
- Config hot apply, plugin setup, and restart behavior.

Good users:

- An IT or ops team testing corporate channel rollout.
- A workflow owner routing alerts into internal rooms.
- A maintainer checking that long-tail enterprise channels fail honestly when
  credentials are missing.

Representative flows:

- Authenticated webhook to enterprise channel report.
- Config hot-apply channel change.
- Structured workflow classification.
- Feishu/Lark document helper with missing-credential behavior.
- Enterprise room routing across two workplace channels.
- Restart with pending workflow.

## Coding Foreman

The Coding Foreman is the main coding-agent character. It owns real repository
work, Codex, ACP harnesses, subagents, tool policy, long command output, and
workspace state.

Primary surfaces:

- Agent runtime and OpenAI/Codex provider path.
- TUI, WebChat, Control UI, Slack thread binding, and local repository
  workspaces.
- Browser automation, exec, sandbox tools, approvals, subagents, and tool
  output handling.

Good users:

- A developer asking OpenClaw to inspect, patch, and verify a repo.
- A maintainer comparing native Codex and ACP harness behavior.
- A QA operator stressing long logs, subagent fanout, and approval policy.

Representative flows:

- Native Codex bound thread.
- ACP harness matrix.
- Subagent fanout and synthesis.
- Forked-context bug investigation.
- Approval and sandbox boundary.
- Long command output.
- Restart during active work.

## Research Librarian

The Research Librarian is a long-horizon analyst and knowledge-management
character. It searches, reads, cites, stores memory, and revisits claims later.

Primary surfaces:

- Web search, web fetch, browser automation, readable extraction, and document
  extraction.
- WebChat, Telegram, and Matrix delivery.
- Memory, Memory Wiki, citation preservation, contradiction checks, and
  freshness checks.

Good users:

- A researcher who needs source-backed briefs.
- A knowledge worker ingesting PDFs and returning later for recall.
- A maintainer testing citation and memory behavior after compaction.

Representative flows:

- Source-backed brief.
- PDF ingestion.
- Browser-only or login-required site handling.
- Memory Wiki update and contradiction check.
- Matrix research room delivery.
- Search provider fallback.

## Media Studio

The Media Studio handles creative and operational media. It should make
alpha-heavy media behavior observable: provider attempt metadata, async task
state, fallback paths, timeouts, and exactly-once channel delivery.

Primary surfaces:

- Media understanding and media generation.
- Image, video, and music generation tools.
- Telegram and Discord media delivery, with LINE/Zalo or other long-tail media
  channels as secondary lanes.

Good users:

- A creator asking for image critique, generation, edits, video, music, or TTS.
- A support or marketing operator moving generated media between channels.
- A QA operator checking async media task ledgers and fallback delivery.

Representative flows:

- Inbound image critique.
- Image generation roundtrip.
- Async video job.
- Async music job.
- TTS reply.
- Cross-channel media formatting.

## Voice Host

The Voice Host is a receptionist, call handler, and meeting participant. Voice
Call is experimental and realtime talk is alpha, so this character should be
comfortable producing blocked and partial evidence.

Primary surfaces:

- Voice and realtime talk.
- Voice-call channel.
- Control UI Talk and meeting plugin behavior.
- STT, TTS, interruption, cancellation, transcript persistence, and audio
  privacy.

Good users:

- Someone testing whether OpenClaw can answer or place short calls.
- Someone using browser Talk mode for live interaction.
- A QA operator checking audio privacy, cancellation, and meeting cleanup.

Representative flows:

- Inbound voice call summary.
- Outbound reminder call.
- Control UI Talk session with interruption.
- Google Meet smoke.
- STT/TTS provider fallback.
- Audio privacy check.

## Secure Archivist

The Secure Archivist owns private-channel and privacy behavior. It no longer
owns platform update and doctor survival; that work belongs to Platform
Custodian.

Primary surfaces:

- Matrix E2EE, Signal, Nostr or IRC fallback.
- Pairing, allowlists, access groups, policy, tool denial, and approval denial.
- Redaction in logs, status, telemetry, diagnostics, and local evidence.
- Local model or key-free search fallback for low-risk tasks.

Good users:

- A security-conscious operator using encrypted or private channels.
- A maintainer checking redaction, pairing, and policy regressions.
- A QA operator testing observability without leaking prompt or private data.

Representative flows:

- Matrix E2EE continuity.
- Allowlist enforcement.
- Pairing and device approval.
- Tool denial and approval denial.
- Observability privacy.
- Local provider fallback.

## Platform Custodian

The Platform Custodian owns host lifecycle, installation, update, doctor, and
service survival. It keeps platform proof out of Secure Archivist and makes host
availability explicit.

Primary surfaces:

- CLI setup, onboarding, plugin/channel setup, service management, doctor, and
  update.
- Gateway runtime lifecycle, health, RPC/websocket, hosted web surfaces, and
  network access.
- macOS and Linux gateway hosts, Docker/Podman, and optional WSL2, Raspberry Pi,
  Android, iOS, Kubernetes, and Nix lanes.

Good users:

- An operator installing OpenClaw on a real device.
- A maintainer proving upgrade survival across accumulated state.
- A QA operator checking Docker, service, and platform capability drift.

Representative flows:

- First-run onboard smoke.
- Doctor fix migration.
- Update and restart health.
- Docker host survival.
- Platform capability report.

## ClawHub Curator

The ClawHub Curator owns the plugin ecosystem. Coding Foreman should stay
focused on repository work; plugin discovery, install lifecycle, SDK behavior,
and marketplace proof belong here.

Primary surfaces:

- Plugin SDK and bundled plugin architecture.
- ClawHub and external plugin distribution.
- OpenClaw App SDK.
- Plugin approval, install/uninstall, packaged plugin, and manifest behavior.

Good users:

- A plugin author checking SDK and manifest behavior.
- A maintainer validating packaged plugin release candidates.
- An operator browsing, installing, approving, and removing plugins.

Representative flows:

- Catalog browse and install.
- Plugin approval boundary.
- SDK smoke.
- Install/uninstall/restart lifecycle.
- Packaged plugin release-candidate check.

# OpenClaw Scenario Feature Inventory

This repo turns the OpenClaw maturity taxonomy into long-running user
characters. The taxonomy is the source of truth for product surfaces, maturity
levels, categories, and coverage IDs. This file explains how the scenario
characters group those surfaces into realistic user experiences.

## Taxonomy Families

### Core Surfaces

- Gateway runtime: approvals, HTTP APIs, hosted web surfaces, RPC events, device
  auth, network discovery, node capabilities, health, protocol compatibility,
  lifecycle, and security controls.
- CLI: setup, onboarding, auth setup, plugin and channel setup, service
  management, observability, doctor, and updates.
- Agent runtime: agent turn execution, external runtimes, subagents, hosted and
  local providers, model selection, provider auth, streaming, tool calls, and
  execution controls.
- Session, memory, and context: transcript persistence, session routing, memory,
  token management, context engine behavior, diagnostics, and cross-client
  parity.
- Channel framework: setup, routing, inbound identity gates, group/thread
  behavior, media handling, outbound delivery, native commands, approvals, and
  status controls.
- Security, auth, pairing, and secrets: approval policy, channel access control,
  device pairing, plugin trust, remote access, and credential hygiene.
- Observability: health, repair, logs, diagnostic collection, telemetry export,
  and session diagnostics.
- Automation: cron, hooks, event ingress, polling, heartbeat, background tasks,
  and Task Flow state.
- Gateway Web App: Control UI, WebChat, browser trust, configuration,
  operator console, and browser realtime talk.
- TUI: runtime modes, local shell execution, commands, session management, and
  output safety.

### Platform And App Surfaces

- macOS and Linux gateway hosts, including service lifecycle, diagnostics,
  local gateway integration, permissions, and repair.
- Docker and Podman hosting, including image validation, container operations,
  networking, and volume-backed state.
- Windows via WSL2, native Windows, Raspberry Pi, Kubernetes, and Nix install
  paths as maturity-specific platform lanes.
- macOS, Android, iOS, watchOS, Linux, and Windows companion surfaces, including
  chat, remote connections, voice, device commands, media capture, and
  notifications where available.

### Channel Surfaces

- Mature or beta proof lanes: Discord, Telegram, Slack, WhatsApp, and
  iMessage/BlueBubbles.
- Alpha enterprise and private lanes: Matrix, Google Chat, Microsoft Teams,
  Signal, Feishu/Lark, Zalo, Mattermost, LINE, IRC, Nextcloud Talk, Nostr, and
  related long-tail channels.
- Experimental voice-call lane for call setup, identity, routing, media, and
  realtime voice behavior.

### Provider And Tool Surfaces

- OpenAI and Codex provider path, including model auth, Responses/tool
  compatibility, native Codex harness, multimodal input, and realtime audio.
- Anthropic, Google, OpenRouter, long-tail hosted providers, and local model
  providers such as Ollama, vLLM, SGLang, and LM Studio.
- Web search tools, browser automation, exec and sandbox tools, and image, video,
  and music generation tools.

## Character Ownership

| Character | Primary taxonomy ownership | Secondary surfaces |
| --- | --- | --- |
| Personal Concierge | WhatsApp, iMessage/BlueBubbles, channel framework, automation, session/memory, media intake | Android, iOS, security/pairing |
| Team Dispatcher | Discord, Slack, channel framework, approvals, access gates | Microsoft Teams, agent runtime, observability |
| Enterprise Liaison | Google Chat, Feishu/Lark, Mattermost/Nextcloud Talk, webhooks, workflow automation | Plugin architecture, Google provider, security |
| Coding Foreman | Agent runtime, OpenAI/Codex provider path, TUI, exec/browser/sandbox tools | WebChat/Control UI, plugins, security |
| Research Librarian | Web search, browser automation, session/memory, WebChat | Telegram, Matrix, provider fallback |
| Media Studio | Media understanding/generation, image/video/music tools, Telegram, Discord | LINE/Zalo and long-tail media channels |
| Voice Host | Voice and realtime talk, voice-call channel, Control UI Talk | OpenAI/Google realtime provider paths |
| Secure Archivist | Matrix E2EE, Signal, security, pairing, redaction, observability | Nostr/IRC, local providers, channel framework |
| Platform Custodian | CLI, gateway runtime, macOS/Linux hosts, Docker/Podman | WSL2, Raspberry Pi, Android, iOS, observability |
| ClawHub Curator | Plugin SDK, ClawHub, external plugin distribution, App SDK | Security, agent runtime, Control UI |

## Maturity Expectations

- Stable and beta surfaces should produce repeatable pass/fail proof.
- Alpha surfaces should produce useful partial evidence with clear setup,
  provider, channel, or host blockers.
- Experimental surfaces should not be treated as parity gates. They should prove
  current behavior honestly and record what prevented a stronger result.
- Missing host capabilities are skipped or blocked, not reset or faked.
- Long-running characters keep accumulated state across runs so update, doctor,
  memory, channel reconnect, and compaction behavior stays realistic.

## Dashboard Direction

The local dashboard should visualize the character layer and the taxonomy layer:

- character health, state age, and recent run status;
- primary and secondary taxonomy surfaces for each character;
- pane type for each channel or surface: API-real, UI-real, device-real, CLI, or
  blocked;
- raw event summaries, outbound delivery attempts, tool calls, approvals, and
  redacted artifacts;
- pass, partial, blocked, skipped, and stale status by taxonomy surface.

## Privacy And Redaction

Committed artifacts must not contain secrets, tokens, credentials, phone
numbers, raw channel IDs, private hostnames, IP addresses, full logs, raw audio,
or transcripts. Scenario hosts may keep local evidence, but committed reports
should contain only redacted counters, short incident summaries, screenshots
when safe, and sanitized proof notes.

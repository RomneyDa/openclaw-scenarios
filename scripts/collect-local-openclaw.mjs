import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(new URL(relativePath, root), "utf8"));
}

function runOpenClaw(args) {
  const result = spawnSync("openclaw", args, {
    encoding: "utf8",
    timeout: 20_000,
    maxBuffer: 1024 * 1024
  });
  if (result.status !== 0) {
    return { ok: false };
  }
  try {
    return { ok: true, json: JSON.parse(result.stdout) };
  } catch {
    return { ok: true };
  }
}

function normalizeProbeStatus(result) {
  if (!result.ok) {
    return "unknown";
  }
  return "ready";
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

const args = parseArgs(process.argv.slice(2));
const instanceId = args.instance;
if (!instanceId) {
  throw new Error("usage: npm run collect:local -- --instance <id>");
}

const fleet = await readJson("data/fleet.json");
const instance = fleet.instances.find((entry) => entry.id === instanceId);
if (!instance) {
  throw new Error(`unknown instance: ${instanceId}`);
}

const health = runOpenClaw(["gateway", "health", "--json"]);
const stability = runOpenClaw(["gateway", "stability", "--json", "--limit", "25"]);
const sessions = runOpenClaw(["sessions", "list", "--json"]);
const channels = runOpenClaw(["channels", "status", "--json"]);

const diagnostics =
  stability.ok && stability.json
    ? countArray(stability.json.events ?? stability.json.records ?? stability.json.items)
    : 0;
const sessionCount = sessions.ok && sessions.json ? countArray(sessions.json.sessions ?? sessions.json) : 0;
const channelState = normalizeProbeStatus(channels);
const gatewayState = normalizeProbeStatus(health);
const state = gatewayState === "ready" && channelState === "ready" ? "pass" : "unknown";

const status = {
  schemaVersion: 1,
  instanceId,
  observedAt: new Date().toISOString(),
  state,
  version: String(health.json?.version ?? health.json?.openclawVersion ?? "unknown"),
  uptimeSeconds: Number(health.json?.uptimeSeconds ?? health.json?.uptime ?? 0) || 0,
  health: {
    gateway: gatewayState,
    channels: channelState,
    updates: "unknown",
    diagnostics: diagnostics > 0 ? "watch" : "clean"
  },
  metrics: {
    sessions: sessionCount,
    messages: 0,
    mediaMessages: 0,
    activeRuns: Number(health.json?.activeRuns ?? 0) || 0,
    memoryMb: Math.round(Number(health.json?.memory?.rssMb ?? health.json?.rssMb ?? 0) || 0),
    contextTokens: 0
  },
  checks: [
    { name: "gateway health probe", status: gatewayState === "ready" ? "pass" : "unknown" },
    { name: "channels status probe", status: channelState === "ready" ? "pass" : "unknown" },
    { name: "stability recorder", status: diagnostics > 0 ? "watch" : "pass" }
  ],
  artifacts: []
};

const outputPath = args.out ?? instance.statusPath;
if (args.print === "true") {
  console.log(JSON.stringify(status, null, 2));
} else {
  const outputUrl = new URL(outputPath, root);
  await fs.mkdir(path.dirname(outputUrl.pathname), { recursive: true });
  await fs.writeFile(outputUrl, `${JSON.stringify(status, null, 2)}\n`);
  console.log(`wrote ${outputPath}`);
}

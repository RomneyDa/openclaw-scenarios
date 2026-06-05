import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);

const forbiddenPatterns = [
  /\b\d{3}[- .]?\d{3}[- .]?\d{4}\b/u,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/u,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/u,
  /(?:token|secret|password|api[-_]?key)\s*[:=]\s*["']?[A-Za-z0-9._-]{8,}/iu
];

async function readJson(relativePath) {
  const file = new URL(relativePath, root);
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function assertSafeCommittedString(value, context) {
  if (typeof value !== "string") {
    return;
  }
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(value)) {
      fail(`privacy check failed for ${context}`);
    }
  }
}

function walkSafeCommittedStrings(value, context) {
  if (typeof value === "string") {
    assertSafeCommittedString(value, context);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkSafeCommittedStrings(entry, `${context}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      walkSafeCommittedStrings(entry, `${context}.${key}`);
    }
  }
}

const fleet = await readJson("data/fleet.json");
if (fleet.schemaVersion !== 1 || !Array.isArray(fleet.instances)) {
  fail("data/fleet.json must contain schemaVersion=1 and instances[]");
}

const ids = new Set();
for (const instance of fleet.instances) {
  if (!/^[a-z0-9-]+$/u.test(instance.id ?? "")) {
    fail(`invalid instance id: ${instance.id}`);
  }
  if (ids.has(instance.id)) {
    fail(`duplicate instance id: ${instance.id}`);
  }
  ids.add(instance.id);
  if (!["linux", "macos", "windows"].includes(instance.os?.family)) {
    fail(`invalid os.family for ${instance.id}`);
  }
  if (!Array.isArray(instance.channels) || instance.channels.length === 0) {
    fail(`missing channels for ${instance.id}`);
  }
  if (!instance.statusPath?.startsWith("data/status/")) {
    fail(`invalid statusPath for ${instance.id}`);
  }
  const status = await readJson(instance.statusPath);
  if (status.instanceId !== instance.id) {
    fail(`status instance mismatch for ${instance.id}`);
  }
  if (!["pass", "watch", "fail", "unknown"].includes(status.state)) {
    fail(`invalid state for ${instance.id}`);
  }
  if (instance.transcriptPath) {
    const transcript = await readJson(instance.transcriptPath);
    if (transcript.instanceId !== instance.id || transcript.redacted !== true) {
      fail(`transcript for ${instance.id} must be redacted and match instanceId`);
    }
  }
}

walkSafeCommittedStrings(fleet, "fleet");
walkSafeCommittedStrings(await readJson("data/incidents.json"), "incidents");

const statusDir = new URL("data/status", root);
for (const name of await fs.readdir(statusDir)) {
  if (!name.endsWith(".json")) {
    continue;
  }
  const status = await readJson(path.posix.join("data/status", name));
  walkSafeCommittedStrings(status, `status.${name}`);
}

const transcriptDir = new URL("data/transcripts", root);
for (const name of await fs.readdir(transcriptDir)) {
  if (!name.endsWith(".json")) {
    continue;
  }
  const transcript = await readJson(path.posix.join("data/transcripts", name));
  walkSafeCommittedStrings(transcript, `transcripts.${name}`);
}

console.log(`validated ${fleet.instances.length} scenario instances`);

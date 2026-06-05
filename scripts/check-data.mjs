import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);
const scenariosDir = new URL("scenarios/", root);

const forbiddenPatterns = [
  /\b\d{3}[- .]?\d{3}[- .]?\d{4}\b/u,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/u,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/u,
  /(?:token|secret|password|api[-_]?key)\s*[:=]\s*["']?[A-Za-z0-9._-]{8,}/iu
];

function fail(message) {
  throw new Error(message);
}

async function readJson(fileUrl) {
  return JSON.parse(await fs.readFile(fileUrl, "utf8"));
}

function assertSafeString(value, context) {
  if (typeof value !== "string") {
    return;
  }
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(value)) {
      fail(`possible private value in ${context}`);
    }
  }
}

function walkStrings(value, context) {
  if (typeof value === "string") {
    assertSafeString(value, context);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkStrings(entry, `${context}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      walkStrings(entry, `${context}.${key}`);
    }
  }
}

function assertEnvNames(names, context) {
  if (!Array.isArray(names)) {
    fail(`${context} must be an array`);
  }
  for (const name of names) {
    if (!/^[A-Z][A-Z0-9_]*$/u.test(name)) {
      fail(`${context} contains invalid env name: ${name}`);
    }
  }
}

function collectEnvPlaceholders(value, envNames = new Set()) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/gu)) {
      envNames.add(match[1]);
    }
    return envNames;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectEnvPlaceholders(entry, envNames));
    return envNames;
  }
  if (value && typeof value === "object") {
    if (value.source === "env" && typeof value.id === "string") {
      envNames.add(value.id);
    }
    for (const entry of Object.values(value)) {
      collectEnvPlaceholders(entry, envNames);
    }
  }
  return envNames;
}

function declaredEnv(config) {
  return new Set([
    ...(config.requiredEnv ?? []),
    ...config.channels.flatMap((channel) => channel.requiredEnv ?? []),
    ...(config.providers ?? []).flatMap((provider) => provider.requiredEnv ?? [])
  ]);
}

const scenarioNames = (await fs.readdir(scenariosDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (scenarioNames.length !== 8) {
  fail(`expected 8 character configs, found ${scenarioNames.length}`);
}

const ids = new Set();
for (const scenarioName of scenarioNames) {
  const configUrl = new URL(`${scenarioName}/config.json`, scenariosDir);
  const config = await readJson(configUrl);
  const context = path.posix.join("scenarios", scenarioName, "config.json");

  if (config.schemaVersion !== 1) {
    fail(`${context} must use schemaVersion=1`);
  }
  if (!/^[a-z0-9-]+$/u.test(config.id ?? "")) {
    fail(`${context} has invalid id`);
  }
  if (ids.has(config.id)) {
    fail(`duplicate character id: ${config.id}`);
  }
  ids.add(config.id);
  if (!config.name || !config.summary || !config.primaryJob) {
    fail(`${context} must include name, summary, and primaryJob`);
  }
  if (!Array.isArray(config.channels) || config.channels.length === 0) {
    fail(`${context} must include channels`);
  }
  if (!Array.isArray(config.flows) || config.flows.length === 0) {
    fail(`${context} must include flows`);
  }
  assertEnvNames(config.requiredEnv ?? [], `${context}.requiredEnv`);
  for (const channel of config.channels) {
    assertEnvNames(channel.requiredEnv ?? [], `${context}.channels.${channel.id}.requiredEnv`);
  }
  for (const provider of config.providers ?? []) {
    assertEnvNames(provider.requiredEnv ?? [], `${context}.providers.${provider.id}.requiredEnv`);
  }
  for (const flow of config.flows) {
    if (!flow.id || !flow.title || !Array.isArray(flow.steps) || !Array.isArray(flow.assertions)) {
      fail(`${context} has invalid flow: ${flow.id ?? "<missing>"}`);
    }
  }
  const missingDeclaredEnv = [...collectEnvPlaceholders(config.openclaw?.configPatch ?? {})].filter(
    (name) => !declaredEnv(config).has(name)
  );
  if (missingDeclaredEnv.length > 0) {
    fail(`${context} uses undeclared env placeholders: ${missingDeclaredEnv.sort().join(", ")}`);
  }
  walkStrings(config, context);
}

console.log(`validated ${scenarioNames.length} character configs`);

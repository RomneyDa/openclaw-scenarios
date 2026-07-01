import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);
const scenariosDir = new URL("scenarios/", root);
const envTemplateUrl = new URL(".env.example", root);

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
    for (const [key, entry] of Object.entries(value)) {
      collectEnvPlaceholders(key, envNames);
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

async function readEnvTemplateNames() {
  const text = await fs.readFile(envTemplateUrl, "utf8");
  const names = new Set();
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/u);
    if (match) {
      names.add(match[1]);
    }
  }
  return names;
}

const scenarioNames = (await fs.readdir(scenariosDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (scenarioNames.length !== 10) {
  fail(`expected 10 character configs, found ${scenarioNames.length}`);
}

const ids = new Set();
const allRequiredEnv = new Set();
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
  if (
    !config.taxonomy ||
    !Array.isArray(config.taxonomy.primary) ||
    config.taxonomy.primary.length === 0 ||
    !Array.isArray(config.taxonomy.secondary) ||
    typeof config.taxonomy.expectation !== "string" ||
    config.taxonomy.expectation.trim() === ""
  ) {
    fail(`${context} must include taxonomy.primary, taxonomy.secondary, and taxonomy.expectation`);
  }
  if (!Array.isArray(config.channels) || config.channels.length === 0) {
    fail(`${context} must include channels`);
  }
  if (!Array.isArray(config.flows) || config.flows.length === 0) {
    fail(`${context} must include flows`);
  }
  assertEnvNames(config.requiredEnv ?? [], `${context}.requiredEnv`);
  for (const name of config.requiredEnv ?? []) {
    allRequiredEnv.add(name);
  }
  for (const channel of config.channels) {
    assertEnvNames(channel.requiredEnv ?? [], `${context}.channels.${channel.id}.requiredEnv`);
    for (const name of channel.requiredEnv ?? []) {
      allRequiredEnv.add(name);
    }
  }
  for (const provider of config.providers ?? []) {
    assertEnvNames(provider.requiredEnv ?? [], `${context}.providers.${provider.id}.requiredEnv`);
    for (const name of provider.requiredEnv ?? []) {
      allRequiredEnv.add(name);
    }
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

const envTemplateNames = await readEnvTemplateNames();
const missingFromEnvTemplate = [...allRequiredEnv].filter((name) => !envTemplateNames.has(name));
if (missingFromEnvTemplate.length > 0) {
  fail(`.env.example is missing required env vars: ${missingFromEnvTemplate.sort().join(", ")}`);
}

console.log(`validated ${scenarioNames.length} character configs`);

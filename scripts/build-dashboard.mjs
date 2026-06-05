import fs from "node:fs/promises";

const root = new URL("..", import.meta.url);
const scenariosDir = new URL("scenarios/", root);
const dist = new URL("dist/", root);

async function readJson(fileUrl) {
  return JSON.parse(await fs.readFile(fileUrl, "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const scenarioNames = (await fs.readdir(scenariosDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const configs = await Promise.all(
  scenarioNames.map((name) => readJson(new URL(`${name}/config.json`, scenariosDir)))
);
configs.sort((a, b) => a.name.localeCompare(b.name));

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

const cards = configs
  .map((config) => {
    const channels = config.channels.map((channel) => channel.name ?? channel.id).join(", ");
    const flows = config.flows
      .map((flow) => `<li><strong>${escapeHtml(flow.title)}</strong><span>${escapeHtml(flow.assertions.join("; "))}</span></li>`)
      .join("");
    const env = [
      ...(config.requiredEnv ?? []),
      ...config.channels.flatMap((channel) => channel.requiredEnv ?? []),
      ...(config.providers ?? []).flatMap((provider) => provider.requiredEnv ?? []),
      ...collectEnvPlaceholders(config.openclaw?.configPatch ?? {})
    ];
    const uniqueEnv = [...new Set(env)].sort();
    return `<article class="card" id="${escapeHtml(config.id)}">
      <header>
        <p>${escapeHtml(config.id)}</p>
        <h2>${escapeHtml(config.name)}</h2>
      </header>
      <p class="summary">${escapeHtml(config.summary)}</p>
      <dl>
        <div><dt>Channels</dt><dd>${escapeHtml(channels)}</dd></div>
        <div><dt>Providers</dt><dd>${escapeHtml((config.providers ?? []).map((provider) => provider.name ?? provider.id).join(", "))}</dd></div>
        <div><dt>Plugins</dt><dd>${escapeHtml((config.plugins ?? []).join(", "))}</dd></div>
        <div><dt>Env</dt><dd>${uniqueEnv.length}</dd></div>
      </dl>
      <h3>Flows</h3>
      <ul>${flows}</ul>
    </article>`;
  })
  .join("");

const nav = configs
  .map((config) => `<a href="#${escapeHtml(config.id)}">${escapeHtml(config.name)}</a>`)
  .join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OpenClaw Scenario Characters</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f4ee;
        --panel: #fff;
        --ink: #20201d;
        --muted: #665f55;
        --line: #d8d2c4;
        --accent: #136f78;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--bg); color: var(--ink); }
      main { width: min(1160px, calc(100vw - 32px)); margin: 0 auto; padding: 32px 0 48px; }
      h1 { margin: 0 0 12px; font-size: clamp(2.3rem, 6vw, 4.8rem); line-height: 0.95; letter-spacing: 0; }
      h2, h3, p { margin-top: 0; }
      .intro { max-width: 760px; color: var(--muted); font-size: 1.08rem; line-height: 1.55; }
      nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 28px; }
      nav a { color: var(--accent); border: 1px solid var(--line); background: var(--panel); border-radius: 999px; padding: 7px 10px; text-decoration: none; font-size: 0.9rem; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px; }
      .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 18px; }
      .card header p { margin-bottom: 6px; color: var(--accent); font-size: 0.78rem; font-weight: 760; text-transform: uppercase; letter-spacing: 0; }
      .card h2 { margin-bottom: 8px; font-size: 1.35rem; }
      .summary { color: var(--muted); line-height: 1.5; }
      dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0 18px; }
      dt { color: var(--muted); font-size: 0.76rem; font-weight: 760; text-transform: uppercase; }
      dd { margin: 3px 0 0; font-size: 0.92rem; line-height: 1.35; }
      ul { margin: 0; padding-left: 18px; }
      li { margin-bottom: 9px; }
      li strong { display: block; }
      li span { color: var(--muted); font-size: 0.92rem; line-height: 1.35; }
    </style>
  </head>
  <body>
    <main>
      <h1>OpenClaw Scenario Characters</h1>
      <p class="intro">Local configs for long-running, realistic E2E user flows. Pull this repo onto the device that will run the scenario, provide the required environment variables, and keep the character state alive across runs.</p>
      <nav>${nav}</nav>
      <section class="grid">${cards}</section>
    </main>
  </body>
</html>`;

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await fs.writeFile(new URL("index.html", dist), html);
await fs.writeFile(new URL("characters.snapshot.json", dist), JSON.stringify(configs, null, 2));

console.log("built dist/index.html");

import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url);
const dist = new URL("dist/", root);

async function readJson(relativePath) {
  const file = new URL(relativePath, root);
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function stateRank(state) {
  return { fail: 0, watch: 1, unknown: 2, pass: 3 }[state] ?? 2;
}

function stateLabel(state) {
  return state === "pass" ? "Pass" : state === "watch" ? "Watch" : state === "fail" ? "Fail" : "Unknown";
}

function osLabel(os) {
  return os === "macos" ? "macOS" : os === "linux" ? "Linux" : os === "windows" ? "Windows" : os;
}

const fleet = await readJson("data/fleet.json");
const incidents = await readJson("data/incidents.json");
const instances = await Promise.all(
  fleet.instances.map(async (instance) => {
    const status = await readJson(instance.statusPath);
    const transcript = instance.transcriptPath ? await readJson(instance.transcriptPath) : undefined;
    return { ...instance, status, transcript };
  })
);

instances.sort((a, b) => stateRank(a.status.state) - stateRank(b.status.state) || a.id.localeCompare(b.id));

const totals = instances.reduce(
  (acc, instance) => {
    acc.messages += instance.status.metrics?.messages ?? 0;
    acc.media += instance.status.metrics?.mediaMessages ?? 0;
    acc.sessions += instance.status.metrics?.sessions ?? 0;
    acc[instance.status.state] += 1;
    return acc;
  },
  { pass: 0, watch: 0, fail: 0, unknown: 0, messages: 0, media: 0, sessions: 0 }
);

const osColumns = ["linux", "macos", "windows"]
  .map((os) => {
    const matching = instances.filter((instance) => instance.os.family === os);
    return `<section class="os-column">
      <h2>${escapeHtml(osLabel(os))}</h2>
      <div class="topology-nodes">
        ${matching
          .map(
            (instance) =>
              `<a class="topology-node ${escapeHtml(instance.status.state)}" href="#${escapeHtml(instance.id)}" title="${escapeHtml(instance.title)}">${escapeHtml(instance.host.label)}</a>`
          )
          .join("")}
      </div>
    </section>`;
  })
  .join("");

const instanceCards = instances
  .map((instance) => {
    const checks = (instance.status.checks ?? [])
      .map(
        (check) =>
          `<li><span class="check-dot ${escapeHtml(check.status)}"></span><span>${escapeHtml(check.name)}</span><strong>${escapeHtml(stateLabel(check.status))}</strong></li>`
      )
      .join("");
    const transcript = (instance.transcript?.excerpt ?? [])
      .map(
        (entry) =>
          `<p><strong>${escapeHtml(entry.role)}</strong><span>${escapeHtml(entry.text)}</span></p>`
      )
      .join("");
    return `<article class="instance" id="${escapeHtml(instance.id)}">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(instance.os.label)} / ${escapeHtml(instance.release.channel)}</p>
          <h2>${escapeHtml(instance.title)}</h2>
        </div>
        <span class="state ${escapeHtml(instance.status.state)}">${escapeHtml(stateLabel(instance.status.state))}</span>
      </header>
      <p class="goal">${escapeHtml(instance.goal)}</p>
      <div class="meta-grid">
        <span><b>Channels</b>${escapeHtml(instance.channels.join(", "))}</span>
        <span><b>Features</b>${escapeHtml(instance.features.join(", "))}</span>
        <span><b>Messages</b>${formatNumber(instance.status.metrics?.messages)}</span>
        <span><b>Media</b>${formatNumber(instance.status.metrics?.mediaMessages)}</span>
        <span><b>Memory</b>${formatNumber(instance.status.metrics?.memoryMb)} MB</span>
        <span><b>Context</b>${formatNumber(instance.status.metrics?.contextTokens)} tokens</span>
      </div>
      <div class="instance-body">
        <section>
          <h3>Checks</h3>
          <ul class="checks">${checks}</ul>
        </section>
        <section>
          <h3>Redacted Excerpt</h3>
          <div class="excerpt">${transcript || "<p><span>No excerpt recorded yet.</span></p>"}</div>
        </section>
      </div>
    </article>`;
  })
  .join("");

const incidentRows = (incidents.incidents ?? [])
  .map(
    (incident) =>
      `<tr><td>${escapeHtml(incident.startedAt)}</td><td>${escapeHtml(incident.instanceId)}</td><td>${escapeHtml(incident.severity)}</td><td>${escapeHtml(incident.status)}</td><td>${escapeHtml(incident.summary)}</td></tr>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OpenClaw Scenario Fleet</title>
    <link rel="stylesheet" href="assets/styles.css">
  </head>
  <body>
    <main>
      <section class="overview">
        <div>
          <p class="eyebrow">Longhaul scenario lab</p>
          <h1>OpenClaw Scenario Fleet</h1>
          <p class="summary">Persistent OpenClaw scenario characters with real user-shaped state across channels, operating systems, media histories, updates, and background workflows.</p>
        </div>
        <dl class="summary-grid">
          <div><dt>Instances</dt><dd>${instances.length}</dd></div>
          <div><dt>Pass</dt><dd>${totals.pass}</dd></div>
          <div><dt>Watch</dt><dd>${totals.watch}</dd></div>
          <div><dt>Messages</dt><dd>${formatNumber(totals.messages)}</dd></div>
          <div><dt>Media</dt><dd>${formatNumber(totals.media)}</dd></div>
          <div><dt>Sessions</dt><dd>${formatNumber(totals.sessions)}</dd></div>
        </dl>
      </section>

      <section class="topology" aria-label="Fleet topology">
        ${osColumns}
      </section>

      <section class="instances" aria-label="Scenario instances">
        ${instanceCards}
      </section>

      <section class="incidents">
        <header>
          <p class="eyebrow">Failure timeline</p>
          <h2>Incidents</h2>
        </header>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Started</th><th>Instance</th><th>Severity</th><th>Status</th><th>Summary</th></tr></thead>
            <tbody>${incidentRows}</tbody>
          </table>
        </div>
      </section>
    </main>
  </body>
</html>`;

const css = `:root {
  color-scheme: light;
  --bg: #f7f5ef;
  --panel: #ffffff;
  --ink: #20201d;
  --muted: #68645b;
  --line: #dad6ca;
  --green: #1f7a4d;
  --amber: #a76513;
  --red: #b33b36;
  --gray: #757575;
  --teal: #136f78;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
}

main {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 28px 0 48px;
}

.overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
  gap: 24px;
  align-items: stretch;
  min-height: 220px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--teal);
  font-size: 0.78rem;
  font-weight: 760;
  text-transform: uppercase;
  letter-spacing: 0;
}

h1, h2, h3, p { margin-top: 0; }
h1 {
  margin-bottom: 12px;
  font-size: clamp(2.2rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: 0;
}

h2 { font-size: 1.35rem; letter-spacing: 0; }
h3 { font-size: 0.92rem; letter-spacing: 0; }
.summary {
  max-width: 700px;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
}

.summary-grid div,
.instance,
.incidents,
.os-column {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.summary-grid div {
  padding: 14px;
  min-height: 88px;
}

dt {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

dd {
  margin: 6px 0 0;
  font-size: 1.8rem;
  font-weight: 780;
}

.topology {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 22px 0;
}

.os-column {
  padding: 14px;
}

.os-column h2 {
  margin-bottom: 12px;
}

.topology-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topology-node {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  height: 36px;
  border: 1px solid var(--line);
  border-left-width: 5px;
  border-radius: 8px;
  color: var(--ink);
  text-decoration: none;
  font-weight: 700;
  background: #fafafa;
}

.instances {
  display: grid;
  gap: 14px;
}

.instance {
  padding: 18px;
}

.instance > header,
.incidents > header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.state {
  display: inline-flex;
  align-items: center;
  min-width: 82px;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #fff;
}

.pass { background: var(--green); }
.watch { background: var(--amber); }
.fail { background: var(--red); }
.unknown { background: var(--gray); }

.topology-node.pass,
.topology-node.watch,
.topology-node.fail,
.topology-node.unknown {
  background: #fff;
  color: var(--ink);
}

.topology-node.pass { border-left-color: var(--green); }
.topology-node.watch { border-left-color: var(--amber); }
.topology-node.fail { border-left-color: var(--red); }
.topology-node.unknown { border-left-color: var(--gray); }

.goal {
  color: var(--muted);
  line-height: 1.5;
  max-width: 980px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 14px 0 18px;
}

.meta-grid span {
  min-height: 70px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--muted);
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.meta-grid b {
  display: block;
  color: var(--ink);
  margin-bottom: 5px;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.instance-body {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  gap: 16px;
}

.checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.checks li {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 8px;
  align-items: center;
  color: var(--muted);
}

.check-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gray);
}

.check-dot.pass { background: var(--green); }
.check-dot.watch { background: var(--amber); }
.check-dot.fail { background: var(--red); }
.check-dot.unknown { background: var(--gray); }

.excerpt {
  display: grid;
  gap: 8px;
}

.excerpt p {
  margin: 0;
  padding: 10px;
  border-left: 4px solid var(--teal);
  background: #f8fbfb;
  border-radius: 6px;
}

.excerpt strong {
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.excerpt span {
  color: var(--muted);
  line-height: 1.45;
}

.incidents {
  margin-top: 18px;
  padding: 18px;
}

.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th, td {
  text-align: left;
  padding: 10px;
  border-top: 1px solid var(--line);
  vertical-align: top;
}

th {
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}

@media (max-width: 920px) {
  .overview,
  .topology,
  .instance-body {
    grid-template-columns: 1fr;
  }
  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  main { width: min(100vw - 20px, 1180px); padding-top: 16px; }
  .summary-grid,
  .meta-grid {
    grid-template-columns: 1fr;
  }
  .instance > header,
  .incidents > header {
    display: block;
  }
  .state {
    margin-top: 8px;
  }
}
`;

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(new URL("assets/", dist), { recursive: true });
await fs.writeFile(new URL("index.html", dist), html);
await fs.writeFile(new URL("assets/styles.css", dist), css);
await fs.writeFile(new URL("fleet.snapshot.json", dist), JSON.stringify({ fleet, incidents, instances }, null, 2));

console.log(`built ${path.relative(process.cwd(), new URL("index.html", dist).pathname)}`);

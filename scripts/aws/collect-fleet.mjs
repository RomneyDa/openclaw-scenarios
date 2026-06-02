import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = new URL("../..", import.meta.url);

function run(bin, args, options = {}) {
  const result = spawnSync(bin, args, {
    encoding: "utf8",
    timeout: options.timeout ?? 120_000,
    maxBuffer: 8 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `${bin} ${args.join(" ")} failed`);
  }
  return result.stdout;
}

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

function commandForTarget(target) {
  if (target.os === "windows") {
    return {
      document: "AWS-RunPowerShellScript",
      commands: [
        "Set-Location C:\\openclaw-scenarios",
        "git pull --ff-only",
        `npm --silent run collect:local -- --instance ${target.id} --print`
      ]
    };
  }
  return {
    document: "AWS-RunShellScript",
    commands: [
      "cd /opt/openclaw-scenarios",
      "git pull --ff-only",
      `npm --silent run collect:local -- --instance ${target.id} --print`
    ]
  };
}

function extractLastJsonObject(output) {
  const start = output.lastIndexOf("\n{");
  const raw = start === -1 ? output.trim() : output.slice(start + 1).trim();
  return JSON.parse(raw);
}

async function readTargets(args) {
  if (args.targets) {
    return JSON.parse(await fs.readFile(args.targets, "utf8"));
  }
  const terraformBin = process.env.TERRAFORM_BIN || "terraform";
  return JSON.parse(run(terraformBin, ["-chdir=infra/aws", "output", "-json", "ssm_targets"]));
}

async function writeStatus(status) {
  const file = new URL(`data/status/${status.instanceId}.json`, root);
  await fs.mkdir(path.dirname(file.pathname), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(status, null, 2)}\n`);
}

const args = parseArgs(process.argv.slice(2));
const targets = await readTargets(args);
const only = new Set(String(args.instance ?? "").split(",").filter(Boolean));
const selected = targets.filter((target) => only.size === 0 || only.has(target.id));

for (const target of selected) {
  const { document, commands } = commandForTarget(target);
  const sendPayload = {
    commands,
    executionTimeout: ["600"]
  };
  const sent = JSON.parse(
    run("aws", [
      "ssm",
      "send-command",
      "--document-name",
      document,
      "--instance-ids",
      target.instance_id,
      "--parameters",
      JSON.stringify(sendPayload),
      "--output",
      "json"
    ])
  );
  const commandId = sent.Command.CommandId;
  let invocation;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const raw = run(
      "aws",
      [
        "ssm",
        "get-command-invocation",
        "--command-id",
        commandId,
        "--instance-id",
        target.instance_id,
        "--output",
        "json"
      ],
      { timeout: 30_000 }
    );
    invocation = JSON.parse(raw);
    if (["Success", "Cancelled", "TimedOut", "Failed"].includes(invocation.Status)) {
      break;
    }
  }
  if (!invocation || invocation.Status !== "Success") {
    throw new Error(`${target.id} collection failed: ${invocation?.Status ?? "unknown"}`);
  }
  const status = extractLastJsonObject(invocation.StandardOutputContent);
  await writeStatus(status);
  console.log(`collected ${target.id}`);
}

run("npm", ["run", "check"], { timeout: 60_000 });

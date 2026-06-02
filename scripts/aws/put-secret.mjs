import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

function run(args, options = {}) {
  const result = spawnSync("aws", args, { encoding: "utf8", stdio: options.stdio ?? "pipe" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `aws ${args.join(" ")} failed`);
  }
  return result.stdout;
}

const args = parseArgs(process.argv.slice(2));
if (!args.name || (!args.value && !args["value-file"])) {
  throw new Error("usage: npm run aws:put-secret -- --name /openclaw-scenarios/NAME (--value VALUE | --value-file FILE)");
}

const value = args["value-file"] ? readFileSync(args["value-file"], "utf8").trim() : args.value;
run([
  "ssm",
  "put-parameter",
  "--name",
  args.name,
  "--type",
  "SecureString",
  "--value",
  value,
  "--overwrite"
]);

console.log(`stored ${args.name}`);

import { spawnSync } from "node:child_process";

const terraformBin = process.env.TERRAFORM_BIN || "terraform";

const result = spawnSync(terraformBin, ["-chdir=infra/aws", "output", "-json", "ssm_targets"], {
  encoding: "utf8"
});

if (result.status !== 0) {
  throw new Error(result.stderr || `${terraformBin} output failed`);
}

const targets = JSON.parse(result.stdout);
console.log(JSON.stringify(targets, null, 2));

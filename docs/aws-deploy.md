# AWS Fleet Deploy

This repo can deploy and operate the first real OpenClaw scenario fleet from CLI.

AWS is the default platform because one account and one Terraform provider can cover:

- Linux EC2 hosts
- Windows EC2 hosts
- EC2 Mac hosts when explicitly enabled
- Systems Manager Run Command for remote bootstrap/collection without inbound SSH

## Manual Inputs

The goal is that the operator only authenticates and supplies secrets.

Required:

- AWS CLI authenticated to the target account.
- Terraform or OpenTofu installed.
- An OpenAI API key or provider auth equivalent stored in SSM.

Optional:

- Tailscale auth key stored in SSM.
- SSH public key for emergency access.
- macOS AMI id if enabling EC2 Mac.

## First Deploy

1. Authenticate AWS.

```bash
aws sts get-caller-identity
```

2. Store secrets in SSM SecureString.

```bash
mkdir -p private
printf '%s' "$OPENAI_API_KEY" > private/openai_api_key
npm run aws:put-secret -- --name /openclaw-scenarios/openai-api-key --value-file private/openai_api_key
```

Optional Tailscale:

```bash
printf '%s' "$TAILSCALE_AUTH_KEY" > private/tailscale_auth_key
npm run aws:put-secret -- --name /openclaw-scenarios/tailscale-auth-key --value-file private/tailscale_auth_key
```

3. Create Terraform vars.

```bash
cp infra/aws/terraform.tfvars.example infra/aws/terraform.tfvars
```

Set:

```hcl
openai_api_key_ssm_parameter = "/openclaw-scenarios/openai-api-key"
tailscale_auth_key_ssm_parameter = "/openclaw-scenarios/tailscale-auth-key"
```

Leave `enable_macos=false` until you intentionally accept EC2 Mac cost.

4. Apply.

```bash
npm run infra:init
npm run infra:apply
```

5. List managed targets.

```bash
npm run aws:targets
```

6. Collect status into this repo.

```bash
npm run aws:collect
```

7. Commit sanitized evidence when it is useful.

```bash
git status -sb
git add data/status
git commit -m "Refresh scenario fleet status"
git push
```

Run `npm run build` locally when you want to inspect the generated dashboard.

## macOS Hosts

EC2 Mac is intentionally off by default. To enable it:

1. Pick a supported AWS region and EC2 Mac instance family.
2. Resolve the macOS AMI id.
3. Set:

```hcl
enable_macos = true
mac_ami_id = "ami-..."
mac_instance_type = "mac2-m2.metal"
mac_host_instance_type = "mac2-m2.metal"
```

EC2 Mac hosts are Dedicated Hosts. Plan for a minimum 24-hour allocation and higher cost than Linux/Windows.

## Collection Model

`npm run aws:collect`:

- reads Terraform `ssm_targets`
- runs a read-only command through AWS SSM on each host
- invokes `npm --silent run collect:local -- --instance <id> --print`
- writes sanitized JSON to `data/status/<id>.json`
- runs `npm run check`

The collector does not fetch raw logs or full transcripts. A future host-side transcript sanitizer can write bounded excerpts to `data/transcripts/<id>.json`.

## What Still Needs Channel Auth

Infrastructure can boot hosts and install OpenClaw, but each real channel still needs credentials or pairing:

- Slack app/bot tokens
- Discord bot tokens and guild/channel ids
- Telegram bot tokens/group id
- WhatsApp linked sessions
- Matrix homeserver/user credentials
- iMessage host entitlement and local account state

Those should be stored as SSM SecureString parameters or provisioned by a later channel-specific bootstrap script. Do not commit them.

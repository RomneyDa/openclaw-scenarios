locals {
  common_tags = {
    Project = "openclaw-scenarios"
    Repo    = "RomneyDa/openclaw-scenarios"
  }

  linux_instances = {
    linux-main-webchat = {
      arch          = "x86_64"
      instance_type = var.linux_instance_type
    }
    linux-matrix-e2ee = {
      arch          = "x86_64"
      instance_type = var.linux_instance_type
    }
    linux-slack-workspace = {
      arch          = "x86_64"
      instance_type = var.linux_instance_type
    }
    linux-whatsapp-personal = {
      arch          = "arm64"
      instance_type = var.linux_arm_instance_type
    }
  }

  windows_instances = {
    windows-telegram-workflow = {}
    windows-coding-acp        = {}
  }

  mac_instances = {
    mac-imessage-desktop = {}
    mac-discord-voice    = {}
  }

  bootstrap_secret_arns = compact([
    var.tailscale_auth_key_ssm_parameter == "" ? "" : "arn:aws:ssm:${data.aws_region.current.name}:*:parameter${var.tailscale_auth_key_ssm_parameter}",
    var.openai_api_key_ssm_parameter == "" ? "" : "arn:aws:ssm:${data.aws_region.current.name}:*:parameter${var.openai_api_key_ssm_parameter}"
  ])
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_subnets" "mac" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = [data.aws_availability_zones.available.names[0]]
  }
}

data "aws_ssm_parameter" "al2023_x86" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

data "aws_ssm_parameter" "al2023_arm" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

data "aws_ssm_parameter" "windows_2022" {
  name = "/aws/service/ami-windows-latest/Windows_Server-2022-English-Full-Base"
}

resource "aws_key_pair" "emergency" {
  count      = var.instance_public_key == "" ? 0 : 1
  key_name   = "${var.name_prefix}-emergency"
  public_key = var.instance_public_key
  tags       = local.common_tags
}

resource "aws_iam_role" "instance" {
  name = "${var.name_prefix}-instance"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "read_bootstrap_secrets" {
  count = length(local.bootstrap_secret_arns) == 0 ? 0 : 1

  name = "${var.name_prefix}-read-bootstrap-secrets"
  role = aws_iam_role.instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = local.bootstrap_secret_arns
      }
    ]
  })
}

resource "aws_iam_instance_profile" "instance" {
  name = "${var.name_prefix}-instance"
  role = aws_iam_role.instance.name
  tags = local.common_tags
}

resource "aws_security_group" "fleet" {
  name        = "${var.name_prefix}-egress"
  description = "OpenClaw scenario fleet egress-only security group"
  vpc_id      = data.aws_vpc.default.id

  egress {
    description = "All outbound traffic for providers, channels, package bootstrap, SSM, and optional Tailscale"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

resource "aws_instance" "linux" {
  for_each = var.enable_linux ? local.linux_instances : {}

  ami                         = each.value.arch == "arm64" ? data.aws_ssm_parameter.al2023_arm.value : data.aws_ssm_parameter.al2023_x86.value
  instance_type               = each.value.instance_type
  subnet_id                   = data.aws_subnets.default.ids[index(keys(local.linux_instances), each.key) % length(data.aws_subnets.default.ids)]
  vpc_security_group_ids      = [aws_security_group.fleet.id]
  iam_instance_profile        = aws_iam_instance_profile.instance.name
  associate_public_ip_address = true
  key_name                    = var.instance_public_key == "" ? null : aws_key_pair.emergency[0].key_name
  user_data = templatefile("${path.module}/templates/linux-user-data.sh.tftpl", {
    instance_id                      = each.key
    repo_url                         = var.repo_url
    openclaw_package                 = var.openclaw_package
    tailscale_auth_key_ssm_parameter = var.tailscale_auth_key_ssm_parameter
    openai_api_key_ssm_parameter     = var.openai_api_key_ssm_parameter
    aws_region                       = var.aws_region
  })

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
  }

  tags = merge(local.common_tags, {
    Name                 = "${var.name_prefix}-${each.key}"
    OpenClawScenario     = each.key
    OpenClawScenarioOS   = "linux"
    OpenClawScenarioRole = "longhaul"
  })
}

resource "aws_instance" "windows" {
  for_each = var.enable_windows ? local.windows_instances : {}

  ami                         = data.aws_ssm_parameter.windows_2022.value
  instance_type               = var.windows_instance_type
  subnet_id                   = data.aws_subnets.default.ids[(index(keys(local.windows_instances), each.key) + 4) % length(data.aws_subnets.default.ids)]
  vpc_security_group_ids      = [aws_security_group.fleet.id]
  iam_instance_profile        = aws_iam_instance_profile.instance.name
  associate_public_ip_address = true
  key_name                    = var.instance_public_key == "" ? null : aws_key_pair.emergency[0].key_name
  user_data = templatefile("${path.module}/templates/windows-user-data.ps1.tftpl", {
    instance_id                      = each.key
    repo_url                         = var.repo_url
    openclaw_package                 = var.openclaw_package
    tailscale_auth_key_ssm_parameter = var.tailscale_auth_key_ssm_parameter
    openai_api_key_ssm_parameter     = var.openai_api_key_ssm_parameter
    aws_region                       = var.aws_region
  })

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
  }

  tags = merge(local.common_tags, {
    Name                 = "${var.name_prefix}-${each.key}"
    OpenClawScenario     = each.key
    OpenClawScenarioOS   = "windows"
    OpenClawScenarioRole = "longhaul"
  })
}

resource "aws_ec2_host" "mac" {
  for_each = var.enable_macos ? local.mac_instances : {}

  instance_type     = var.mac_host_instance_type
  availability_zone = data.aws_availability_zones.available.names[0]
  auto_placement    = "off"
  host_recovery     = "on"

  tags = merge(local.common_tags, {
    Name             = "${var.name_prefix}-${each.key}-host"
    OpenClawScenario = each.key
  })
}

resource "aws_instance" "mac" {
  for_each = var.enable_macos ? local.mac_instances : {}

  ami                         = var.mac_ami_id
  instance_type               = var.mac_instance_type
  host_id                     = aws_ec2_host.mac[each.key].id
  subnet_id                   = data.aws_subnets.mac.ids[0]
  vpc_security_group_ids      = [aws_security_group.fleet.id]
  iam_instance_profile        = aws_iam_instance_profile.instance.name
  associate_public_ip_address = true
  key_name                    = var.instance_public_key == "" ? null : aws_key_pair.emergency[0].key_name
  user_data = templatefile("${path.module}/templates/mac-user-data.sh.tftpl", {
    instance_id                      = each.key
    repo_url                         = var.repo_url
    openclaw_package                 = var.openclaw_package
    tailscale_auth_key_ssm_parameter = var.tailscale_auth_key_ssm_parameter
    openai_api_key_ssm_parameter     = var.openai_api_key_ssm_parameter
    aws_region                       = var.aws_region
  })

  root_block_device {
    volume_size = var.mac_root_volume_gb
    volume_type = "gp3"
  }

  tags = merge(local.common_tags, {
    Name                 = "${var.name_prefix}-${each.key}"
    OpenClawScenario     = each.key
    OpenClawScenarioOS   = "macos"
    OpenClawScenarioRole = "longhaul"
  })

  lifecycle {
    precondition {
      condition     = var.mac_ami_id != ""
      error_message = "mac_ami_id is required when enable_macos=true."
    }
  }
}

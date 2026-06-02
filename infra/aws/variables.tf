variable "aws_region" {
  description = "AWS region for the scenario fleet."
  type        = string
  default     = "us-east-2"
}

variable "name_prefix" {
  description = "Prefix for AWS resource names."
  type        = string
  default     = "openclaw-scenarios"
}

variable "repo_url" {
  description = "Git URL for this scenario repo."
  type        = string
  default     = "https://github.com/RomneyDa/openclaw-scenarios.git"
}

variable "openclaw_package" {
  description = "npm package spec installed on scenario hosts."
  type        = string
  default     = "openclaw@beta"
}

variable "instance_public_key" {
  description = "Optional SSH public key for emergency access. Leave blank for SSM-only."
  type        = string
  default     = ""
}

variable "enable_linux" {
  description = "Provision Linux scenario hosts."
  type        = bool
  default     = true
}

variable "enable_windows" {
  description = "Provision Windows scenario hosts."
  type        = bool
  default     = true
}

variable "enable_macos" {
  description = "Provision EC2 Mac Dedicated Hosts and instances. This is expensive and has a 24-hour minimum host allocation."
  type        = bool
  default     = false
}

variable "linux_instance_type" {
  description = "Linux EC2 instance type."
  type        = string
  default     = "t3.large"
}

variable "linux_arm_instance_type" {
  description = "Linux ARM EC2 instance type."
  type        = string
  default     = "t4g.large"
}

variable "windows_instance_type" {
  description = "Windows EC2 instance type."
  type        = string
  default     = "t3.large"
}

variable "mac_instance_type" {
  description = "EC2 Mac instance type. Must match the selected Dedicated Host type."
  type        = string
  default     = "mac2-m2.metal"
}

variable "mac_host_instance_type" {
  description = "EC2 Mac Dedicated Host instance type."
  type        = string
  default     = "mac2-m2.metal"
}

variable "mac_ami_id" {
  description = "macOS AMI id. Required when enable_macos=true; resolve with AWS EC2 macOS AMI docs or scripts/aws/resolve-amis.mjs."
  type        = string
  default     = ""
}

variable "root_volume_gb" {
  description = "Root EBS volume size for Linux/Windows hosts."
  type        = number
  default     = 120
}

variable "mac_root_volume_gb" {
  description = "Root EBS volume size for macOS hosts."
  type        = number
  default     = 200
}

variable "tailscale_auth_key_ssm_parameter" {
  description = "Optional SSM SecureString parameter name containing a Tailscale auth key."
  type        = string
  default     = ""
}

variable "openai_api_key_ssm_parameter" {
  description = "Optional SSM SecureString parameter name containing OPENAI_API_KEY."
  type        = string
  default     = ""
}

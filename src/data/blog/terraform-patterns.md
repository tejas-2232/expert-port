---
title: "Terraform patterns I use in production"
description: "Intro to Terraform, essential commands, and copy-paste examples for AWS and multi-cloud IaC—modules, state, and tagging."
pubDate: 2024-11-01
---

## What is Terraform?

**Terraform** is an open-source Infrastructure as Code (IaC) tool by HashiCorp. You describe infrastructure in **HCL (HashiCorp Configuration Language)**: providers (AWS, GCP, Azure, etc.), resources (VPCs, instances, databases), variables, and outputs. Terraform keeps **state** (a snapshot of what it created) and uses it to plan changes: `terraform plan` shows a diff, `terraform apply` creates or updates resources. That makes infrastructure repeatable, reviewable in Git, and safe to change with plan-before-apply workflows.

## Essential Terraform commands

```bash
# Initialize: download providers and set up backend
terraform init

# Format and validate code
terraform fmt
terraform validate

# Plan (dry run) and apply
terraform plan
terraform apply
terraform apply -auto-approve   # skip confirmation prompt

# Destroy resources
terraform destroy

# Workspaces (optional, for multiple envs in one config)
terraform workspace list
terraform workspace select prod
terraform plan
```

## Code examples you can copy

### Minimal AWS example (provider + one resource)

```hcl
# versions.tf or main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "app" {
  bucket = "${var.project_name}-${var.environment}-app"

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}
```

### Variables and outputs

```hcl
# variables.tf
variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

# outputs.tf
output "bucket_name" {
  value       = aws_s3_bucket.app.id
  description = "Name of the S3 bucket"
}

output "bucket_arn" {
  value = aws_s3_bucket.app.arn
}
```

### Remote state (S3 + DynamoDB lock)

```hcl
# backend.tf – use with terraform init -backend-config=backend.hcl
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Shared tags in locals

```hcl
# locals.tf
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = merge(local.common_tags, {
    Name = "web-${var.environment}"
  })
}
```

### Simple data source (latest Ubuntu AMI)

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}
```

## Patterns that actually save you

**One module per “thing”** (VPC, EKS, RDS) keeps PRs readable and modules reusable across staging and prod. Giant “kitchen sink” roots make every change risky and every plan slow.

**Remote state with a lock** (S3 + DynamoDB) isn’t optional once two people (or CI and a human) run Terraform. Without locking, you get state corruption and half-applied changes. One backend config per env, same code.

**Tags from a single `locals` block** mean cost dashboards, security scanners, and “who owns this?” all work. Ad-hoc tags turn into a mess the moment a second person touches the repo. `ManagedBy = "Terraform"` also makes it obvious which resources are safe to delete from the console (none of them).

Start with small modules and shared tagging. Add Terragrunt or more structure only when the repo gets noisy—not before.

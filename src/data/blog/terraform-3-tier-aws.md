---
title: "Deploy a 3-tier web app on AWS with Terraform"
description: "Step-by-step guide to deploy presentation, application, and data tiers on AWS using Terraform—VPC, ALB, EC2, and RDS with copy-paste examples."
pubDate: 2024-09-20
---

A **3-tier architecture** separates your app into: **presentation** (web/load balancer), **application** (app servers), and **data** (database). On AWS you can build this with a VPC, an Application Load Balancer (ALB), EC2 (or ECS) for the app tier, and RDS for the database. Terraform keeps the whole stack in code so you can recreate or change it safely.

## Architecture overview

- **Presentation tier** – ALB in public subnets. Handles HTTPS, routes traffic to the app tier.
- **Application tier** – EC2 instances (or an ECS service) in private subnets behind the ALB. No direct internet; they talk to the ALB and to RDS.
- **Data tier** – RDS (e.g. PostgreSQL or MySQL) in private subnets. Only the app tier can reach it.

All of this lives in one VPC with public subnets for the ALB and private subnets for app and DB. NAT Gateway (or NAT instances) in the public subnet lets private instances pull updates or call external APIs.

## Project layout

```
.
├── main.tf          # provider, ALB, target group
├── vpc.tf           # VPC, subnets, internet gateway, NAT
├── ec2.tf           # launch template, ASG, app tier
├── rds.tf           # DB subnet group, RDS instance
├── variables.tf
├── outputs.tf
└── terraform.tfvars
```

## 1. VPC and networking

```hcl
# vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# Public subnets (for ALB, NAT)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project_name}-public-${count.index + 1}" }
}

# Private subnets (for EC2, RDS)
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags              = { Name = "${var.project_name}-private-${count.index + 1}" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-nat-eip" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = { Name = "${var.project_name}-nat" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  tags = { Name = "${var.project_name}-private-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

data "aws_availability_zones" "available" {
  state = "available"
}
```

## 2. Application Load Balancer (presentation tier)

```hcl
# main.tf (excerpt)
resource "aws_lb" "app" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  tags               = { Name = "${var.project_name}-alb" }
}

resource "aws_lb_target_group" "app" {
  name     = "${var.project_name}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
```

## 3. Security groups

```hcl
# security_groups.tf
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Allow HTTP/HTTPS to ALB"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_name}-alb-sg" }
}

resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Allow traffic from ALB only"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_name}-app-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow MySQL/Postgres from app tier only"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_name}-rds-sg" }
}
```

## 4. Application tier (EC2 in an ASG)

```hcl
# ec2.tf
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-app-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.app_instance_type
  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.app.id]
  }
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum install -y nginx
    systemctl enable nginx && systemctl start nginx
  EOF
  )
  tag_specifications {
    resource_type = "instance"
    tags          = { Name = "${var.project_name}-app" }
  }
}

resource "aws_autoscaling_group" "app" {
  name                = "${var.project_name}-asg"
  min_size            = 1
  max_size            = 4
  desired_capacity    = 2
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
  tag {
    key                 = "Name"
    value               = "${var.project_name}-app"
    propagate_at_launch  = true
  }
}
```

## 5. Data tier (RDS)

```hcl
# rds.tf
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-db-subnet" }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.db_instance_class
  allocated_storage = 20
  storage_type     = "gp3"
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot   = true
  tags = { Name = "${var.project_name}-db" }
}
```

## 6. Variables and outputs

```hcl
# variables.tf (add to existing)
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
variable "project_name" {
  type = string
}
variable "app_instance_type" {
  type    = string
  default = "t3.micro"
}
variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}
variable "db_name" {
  type = string
}
variable "db_username" {
  type = string
}
variable "db_password" {
  type      = string
  sensitive = true
}

# outputs.tf
output "alb_dns_name" {
  value       = aws_lb.app.dns_name
  description = "ALB DNS name — use this to hit your app (e.g. http://<this>/)"
}
output "rds_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "RDS endpoint for app config (host:port)"
  sensitive   = true
}
```

## Deploy steps

1. Create `terraform.tfvars` with `project_name`, `db_name`, `db_username`, `db_password`.
2. Run:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
3. After apply, open `http://<alb_dns_name>` in a browser. You should see the default nginx page from the app tier. Your app would connect to the RDS endpoint from the EC2 user data or your deployment pipeline.

## Summary

You get a 3-tier setup: ALB (presentation) in public subnets, EC2 in an ASG (application) and RDS (data) in private subnets, with security groups so only the ALB talks to app and only app talks to RDS. Swap the EC2 user data for your real app (or use ECS/Fargate and point the target group at the ECS service), and point your app config at the RDS output. Use remote state (S3 + DynamoDB) and separate workspaces or roots for staging vs prod.

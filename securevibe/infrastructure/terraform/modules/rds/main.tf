# =============================================================================
# RDS Module - SecureVibe Infrastructure
# Creates managed PostgreSQL with encryption
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
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

# -----------------------------------------------------------------------------
# KMS Key for RDS Encryption
# -----------------------------------------------------------------------------
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = var.kms_deletion_window
  enable_key_rotation     = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-rds-kms"
    }
  )
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# -----------------------------------------------------------------------------
# RDS Subnet Group
# -----------------------------------------------------------------------------
resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-subnet-group"
    }
  )
}

# -----------------------------------------------------------------------------
# RDS Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${var.name}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-rds-sg"
    }
  )
}

resource "aws_security_group_rule" "ingress" {
  count = length(var.allowed_security_group_ids)

  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
}

# -----------------------------------------------------------------------------
# RDS Parameter Group
# -----------------------------------------------------------------------------
resource "aws_db_parameter_group" "this" {
  name   = "${var.name}-parameter-group"
  family = var.parameter_group_family

  parameters {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameters {
    name  = "log_statement"
    value = "none"
  }

  parameters {
    name  = "log_connections"
    value = "1"
  }

  parameters {
    name  = "log_disconnections"
    value = "1"
  }

  parameters {
    name  = "log_duration"
    value = "0"
  }

  parameters {
    name  = "max_connections"
    value = var.max_connections
  }

  parameters {
    name  = "shared_buffers"
    value = var.shared_buffers
  }

  parameters {
    name  = "effective_cache_size"
    value = var.effective_cache_size
  }

  parameters {
    name  = "maintenance_work_mem"
    value = var.maintenance_work_mem
  }

  parameters {
    name  = "checkpoint_completion_target"
    value = "0.9"
  }

  parameters {
    name  = "wal_buffers"
    value = "16MB"
  }

  parameters {
    name  = "default_statistics_target"
    value = "100"
  }

  parameters {
    name  = "random_page_cost"
    value = "1.1"
  }

  parameters {
    name  = "effective_io_concurrency"
    value = "200"
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# RDS Option Group
# -----------------------------------------------------------------------------
resource "aws_db_option_group" "this" {
  name                 = "${var.name}-option-group"
  engine_name          = var.engine
  major_engine_version = var.engine_version

  tags = var.tags
}

# -----------------------------------------------------------------------------
# RDS Instance
# -----------------------------------------------------------------------------
resource "aws_db_instance" "this" {
  identifier = "${var.name}-db"

  engine               = var.engine
  engine_version       = var.engine_version
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  storage_type         = var.storage_type
  storage_encrypted    = true
  kms_key_id          = aws_kms_key.rds.arn
  iops                = var.iops

  db_name  = var.db_name
  username = var.username
  password = var.password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.this.name
  option_group_name      = aws_db_option_group.this.name

  multi_az               = var.multi_az
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  performance_insights_enabled = var.performance_insights_enabled
  monitoring_interval        = var.monitoring_interval
  monitoring_role_arn       = var.monitoring_role_arn

  deletion_protection = var.deletion_protection
  skip_final_snapshot = var.skip_final_snapshot
    final_snapshot_identifier = "${var.name}-final-snapshot-${timestamp()}"
    apply_immediately = true
  }

  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports

  max_allocated_storage = var.max_allocated_storage
  storage_autoscaling   = var.storage_autoscaling

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-db"
    }
  )

  lifecycle {
    ignore_changes = [password]
  }
}

# -----------------------------------------------------------------------------
# CloudWatch Log Group for RDS
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "rds" {
  count = length(var.enabled_cloudwatch_logs_exports) > 0 ? 1 : 0

  name              = "/aws/rds/instance/${var.name}-db"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.this.id
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.this.arn
}

output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.this.endpoint
}

output "db_port" {
  description = "RDS instance port"
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.this.db_name
}

output "db_username" {
  description = "Database username"
  value       = aws_db_instance.this.username
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.rds.id
}

output "kms_key_id" {
  description = "KMS key ID for encryption"
  value       = aws_kms_key.rds.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for encryption"
  value       = aws_kms_key.rds.arn
}
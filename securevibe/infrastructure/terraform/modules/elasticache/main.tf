# =============================================================================
# ElastiCache Module - SecureVibe Infrastructure
# Creates Redis cluster
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
# KMS Key for ElastiCache Encryption
# -----------------------------------------------------------------------------
resource "aws_kms_key" "elasticache" {
  description             = "KMS key for ElastiCache encryption"
  deletion_window_in_days = var.kms_deletion_window
  enable_key_rotation     = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-elasticache-kms"
    }
  )
}

resource "aws_kms_alias" "elasticache" {
  name          = "alias/${var.name}-elasticache"
  target_key_id = aws_kms_key.elasticache.key_id
}

# -----------------------------------------------------------------------------
# ElastiCache Subnet Group
# -----------------------------------------------------------------------------
resource "aws_elasticache_subnet_group" "this" {
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
# ElastiCache Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "elasticache" {
  name        = "${var.name}-elasticache-sg"
  description = "Security group for ElastiCache"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-elasticache-sg"
    }
  )
}

resource "aws_security_group_rule" "ingress" {
  count = length(var.allowed_security_group_ids)

  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.elasticache.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
}

# -----------------------------------------------------------------------------
# ElastiCache Parameter Group
# -----------------------------------------------------------------------------
resource "aws_elasticache_parameter_group" "this" {
  name   = "${var.name}-parameter-group"
  family = var.parameter_group_family

  parameter {
    name  = "maxmemory-policy"
    value = var.maxmemory_policy
  }

  parameter {
    name  = "timeout"
    value = var.timeout
  }

  parameter {
    name  = "tcp-keepalive"
    value = var.tcp_keepalive
  }

  parameter {
    name  = "notify-keyspace-events"
    value = var.notify_keyspace_events
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# ElastiCache Replication Group (Redis Cluster)
# -----------------------------------------------------------------------------
resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "${var.name}-redis"
  replication_group_description = "SecureVibe Redis cluster"
  node_type                   = var.node_type
  number_cache_clusters        = var.number_cache_clusters
  port                        = var.port
  engine                      = var.engine
  engine_version              = var.engine_version
  parameter_group_name        = aws_elasticache_parameter_group.this.name
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.elasticache.id]

  # Encryption
  at_rest_encryption_enabled     = true
  transit_encryption_enabled     = true
  auth_token                   = var.auth_token
  kms_key_id                  = aws_kms_key.elasticache.arn

  # Automatic failover
  automatic_failover_enabled = var.automatic_failover_enabled
  multi_az_enabled          = var.multi_az_enabled

  # Backup
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window        = var.snapshot_window
  maintenance_window     = var.maintenance_window

  # Performance
  cluster_mode_enabled = var.cluster_mode_enabled

  # Tags
  tags = merge(
    var.tags,
    {
      Name = "${var.name}-redis"
    }
  )

  lifecycle {
    ignore_changes = [auth_token]
  }
}

# -----------------------------------------------------------------------------
# CloudWatch Log Group for ElastiCache
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "elasticache" {
  count = var.enable_cloudwatch_logs ? 1 : 0

  name              = "/aws/elasticache/${var.name}-redis"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "replication_group_id" {
  description = "ElastiCache replication group ID"
  value       = aws_elasticache_replication_group.this.id
}

output "primary_endpoint_address" {
  description = "Primary endpoint address"
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "primary_endpoint_port" {
  description = "Primary endpoint port"
  value       = aws_elasticache_replication_group.this.primary_endpoint_port
}

output "reader_endpoint_address" {
  description = "Reader endpoint address"
  value       = aws_elasticache_replication_group.this.reader_endpoint_address
}

output "reader_endpoint_port" {
  description = "Reader endpoint port"
  value       = aws_elasticache_replication_group.this.reader_endpoint_port
}

output "configuration_endpoint_address" {
  description = "Configuration endpoint address (for cluster mode)"
  value       = aws_elasticache_replication_group.this.configuration_endpoint_address
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.elasticache.id
}

output "kms_key_id" {
  description = "KMS key ID for encryption"
  value       = aws_kms_key.elasticache.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for encryption"
  value       = aws_kms_key.elasticache.arn
}
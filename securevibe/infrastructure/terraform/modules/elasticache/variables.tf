# =============================================================================
# ElastiCache Module Variables
# =============================================================================

variable "name" {
  description = "Name of ElastiCache cluster and resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for ElastiCache"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to access ElastiCache"
  type        = list(string)
  default     = []
}

# Redis Configuration
variable "engine" {
  description = "Cache engine"
  type        = string
  default     = "redis"
}

variable "engine_version" {
  description = "Cache engine version"
  type        = string
  default     = "7.0"
}

variable "node_type" {
  description = "Cache node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "number_cache_clusters" {
  description = "Number of cache clusters"
  type        = number
  default     = 2
}

variable "port" {
  description = "Cache port"
  type        = number
  default     = 6379
}

variable "parameter_group_family" {
  description = "Parameter group family"
  type        = string
  default     = "redis7"
}

# Redis Parameters
variable "maxmemory_policy" {
  description = "Max memory policy"
  type        = string
  default     = "allkeys-lru"
}

variable "timeout" {
  description = "Client timeout in seconds"
  type        = string
  default     = "300"
}

variable "tcp_keepalive" {
  description = "TCP keepalive in seconds"
  type        = string
  default     = "300"
}

variable "notify_keyspace_events" {
  description = "Keyspace notifications"
  type        = string
  default     = ""
}

# Security
variable "auth_token" {
  description = "Auth token for Redis"
  type        = string
  sensitive   = true
}

variable "automatic_failover_enabled" {
  description = "Enable automatic failover"
  type        = bool
  default     = true
}

variable "multi_az_enabled" {
  description = "Enable Multi-AZ"
  type        = bool
  default     = true
}

# Backup
variable "snapshot_retention_limit" {
  description = "Snapshot retention limit in days"
  type        = number
  default     = 5
}

variable "snapshot_window" {
  description = "Snapshot window"
  type        = string
  default     = "05:00-06:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:06:00-sun:07:00"
}

# Performance
variable "cluster_mode_enabled" {
  description = "Enable cluster mode"
  type        = bool
  default     = false
}

# Monitoring
variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch logs"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# KMS
variable "kms_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {
    Environment = "production"
    Project     = "securevibe"
    ManagedBy   = "terraform"
  }
}
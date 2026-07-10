# =============================================================================
# RDS Module Variables
# =============================================================================

variable "name" {
  description = "Name of RDS instance and resources"
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
  description = "List of subnet IDs for RDS"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to access RDS"
  type        = list(string)
  default     = []
}

# Database Configuration
variable "engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "storage_type" {
  description = "Storage type"
  type        = string
  default     = "gp3"
}

variable "iops" {
  description = "IOPS for storage"
  type        = number
  default     = 3000
}

variable "max_allocated_storage" {
  description = "Maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "storage_autoscaling" {
  description = "Enable storage autoscaling"
  type        = bool
  default     = true
}

# Database Credentials
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "securevibe"
}

variable "username" {
  description = "Database username"
  type        = string
  default     = "securevibe_admin"
}

variable "password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Database Parameters
variable "parameter_group_family" {
  description = "Parameter group family"
  type        = string
  default     = "postgres15"
}

variable "max_connections" {
  description = "Maximum connections"
  type        = string
  default     = "200"
}

variable "shared_buffers" {
  description = "Shared buffers"
  type        = string
  default     = "{DBInstanceClassMemory/32}"
}

variable "effective_cache_size" {
  description = "Effective cache size"
  type        = string
  default     = "{DBInstanceClassMemory/4}"
}

variable "maintenance_work_mem" {
  description = "Maintenance work memory"
  type        = string
  default     = "{DBInstanceClassMemory/16}"
}

# High Availability
variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

# Backup
variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "Mon:04:00-Mon:05:00"
}

# Monitoring
variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "monitoring_interval" {
  description = "Monitoring interval in seconds"
  type        = number
  default     = 60
}

variable "monitoring_role_arn" {
  description = "Monitoring role ARN"
  type        = string
  default     = ""
}

variable "enabled_cloudwatch_logs_exports" {
  description = "List of log types to export to CloudWatch"
  type        = list(string)
  default     = ["postgresql", "upgrade"]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# Security
variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = false
}

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
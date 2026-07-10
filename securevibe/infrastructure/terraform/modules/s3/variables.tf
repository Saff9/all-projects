# =============================================================================
# S3 Module Variables
# =============================================================================

variable "name" {
  description = "Name prefix for S3 buckets"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "create_static_bucket" {
  description = "Create public static assets bucket"
  type        = bool
  default     = true
}

# Lifecycle Configuration
variable "noncurrent_version_expiration_days" {
  description = "Days to retain non-current versions"
  type        = number
  default     = 30
}

variable "abort_incomplete_multipart_upload_days" {
  description = "Days to abort incomplete multipart uploads"
  type        = number
  default     = 7
}

variable "log_expiration_days" {
  description = "Days to retain logs"
  type        = number
  default     = 90
}

variable "transition_to_ia_days" {
  description = "Days to transition to Standard-IA"
  type        = number
  default     = 30
}

variable "transition_to_glacier_days" {
  description = "Days to transition to Glacier"
  type        = number
  default     = 90
}

variable "backup_expiration_days" {
  description = "Days to retain backups"
  type        = number
  default     = 365
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
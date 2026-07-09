# =============================================================================
# CloudFront Module Variables
# =============================================================================

variable "name" {
  description = "Name of CloudFront distribution"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "create_distribution" {
  description = "Create CloudFront distribution"
  type        = bool
  default     = true
}

variable "static_bucket_id" {
  description = "S3 bucket ID for static assets"
  type        = string
}

variable "static_bucket_arn" {
  description = "S3 bucket ARN for static assets"
  type        = string
}

variable "static_bucket_domain_name" {
  description = "S3 bucket domain name for static assets"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

# Cache Configuration
variable "min_ttl" {
  description = "Minimum TTL in seconds"
  type        = number
  default     = 0
}

variable "default_ttl" {
  description = "Default TTL in seconds"
  type        = number
  default     = 86400
}

variable "max_ttl" {
  description = "Maximum TTL in seconds"
  type        = number
  default     = 31536000
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

# WAF
variable "enable_waf" {
  description = "Enable WAF for CloudFront"
  type        = bool
  default     = false
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
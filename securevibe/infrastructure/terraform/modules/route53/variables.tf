# =============================================================================
# Route53 Module Variables
# =============================================================================

variable "name" {
  description = "Name of Route53 resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "hosted_zone_id" {
  description = "Existing hosted zone ID (if not creating new one)"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Create new hosted zone"
  type        = bool
  default     = false
}

variable "create_records" {
  description = "Create DNS records"
  type        = bool
  default     = true
}

variable "create_cdn_records" {
  description = "Create CDN DNS records"
  type        = bool
  default     = true
}

variable "create_verification_records" {
  description = "Create verification records"
  type        = bool
  default     = false
}

variable "create_health_check" {
  description = "Create health check"
  type        = bool
  default     = true
}

variable "enable_dnssec" {
  description = "Enable DNSSEC"
  type        = bool
  default     = false
}

# Load Balancer
variable "load_balancer_dns_name" {
  description = "Load balancer DNS name"
  type        = string
  default     = ""
}

variable "load_balancer_zone_id" {
  description = "Load balancer zone ID"
  type        = string
  default     = ""
}

# CloudFront
variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
  default     = ""
}

# Verification Records
variable "verification_record_name" {
  description = "Verification record name"
  type        = string
  default     = "_amazonses"
}

variable "verification_record_value" {
  description = "Verification record value"
  type        = string
  default     = ""
}

# Health Check
variable "health_check_fqdn" {
  description = "Health check FQDN"
  type        = string
  default     = "api.securevibe.io"
}

variable "health_check_port" {
  description = "Health check port"
  type        = number
  default     = 443
}

variable "health_check_type" {
  description = "Health check type"
  type        = string
  default     = "HTTPS"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_failure_threshold" {
  description = "Health check failure threshold"
  type        = number
  default     = 3
}

# DNSSEC
variable "dnssec_key_size" {
  description = "DNSSEC key size"
  type        = number
  default     = 2048
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
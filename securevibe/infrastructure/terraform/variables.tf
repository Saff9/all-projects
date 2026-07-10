# =============================================================================
# Terraform Variables
# =============================================================================

variable "name" {
  description = "Project name"
  type        = string
  default     = "securevibe"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "database_subnet_cidrs" {
  description = "Database subnet CIDRs"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "single_nat_gateway" {
  description = "Use single NAT gateway"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = true
}

variable "flow_log_destination_arn" {
  description = "CloudWatch Logs ARN for flow logs"
  type        = string
  default     = ""
}

variable "enable_s3_endpoint" {
  description = "Enable S3 VPC endpoint"
  type        = bool
  default     = true
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "eks_endpoint_public_access" {
  description = "Enable EKS public endpoint"
  type        = bool
  default     = false
}

variable "eks_public_access_cidrs" {
  description = "CIDRs allowed to access EKS public endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "main_node_group_desired_size" {
  description = "Main node group desired size"
  type        = number
  default     = 3
}

variable "main_node_group_max_size" {
  description = "Main node group max size"
  type        = number
  default     = 10
}

variable "main_node_group_min_size" {
  description = "Main node group min size"
  type        = number
  default     = 3
}

variable "main_node_group_instance_types" {
  description = "Main node group instance types"
  type        = list(string)
  default     = ["t3.medium", "t3a.medium"]
}

variable "system_node_group_desired_size" {
  description = "System node group desired size"
  type        = number
  default     = 2
}

variable "system_node_group_max_size" {
  description = "System node group max size"
  type        = number
  default     = 5
}

variable "system_node_group_min_size" {
  description = "System node group min size"
  type        = number
  default     = 2
}

variable "system_node_group_instance_types" {
  description = "System node group instance types"
  type        = list(string)
  default     = ["t3.small", "t3a.small"]
}

variable "ssh_key_name" {
  description = "SSH key name for EC2 instances"
  type        = string
  default     = ""
}

# RDS Configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "securevibe"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "securevibe_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_storage_type" {
  description = "Database storage type"
  type        = string
  default     = "gp3"
}

variable "db_iops" {
  description = "Database IOPS"
  type        = number
  default     = 3000
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = true
}

variable "db_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "Database backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Database maintenance window"
  type        = string
  default     = "Mon:04:00-Mon:05:00"
}

variable "db_performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "db_monitoring_interval" {
  description = "Database monitoring interval in seconds"
  type        = number
  default     = 60
}

# ElastiCache Configuration
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_number_cache_clusters" {
  description = "Number of Redis cache clusters"
  type        = number
  default     = 2
}

variable "redis_auth_token" {
  description = "Redis auth token"
  type        = string
  sensitive   = true
}

variable "redis_automatic_failover_enabled" {
  description = "Enable Redis automatic failover"
  type        = bool
  default     = true
}

variable "redis_multi_az_enabled" {
  description = "Enable Redis Multi-AZ"
  type        = bool
  default     = true
}

variable "redis_snapshot_retention_limit" {
  description = "Redis snapshot retention limit in days"
  type        = number
  default     = 5
}

variable "redis_snapshot_window" {
  description = "Redis snapshot window"
  type        = string
  default     = "05:00-06:00"
}

variable "redis_maintenance_window" {
  description = "Redis maintenance window"
  type        = string
  default     = "sun:06:00-sun:07:00"
}

# S3 Configuration
variable "create_static_bucket" {
  description = "Create static assets bucket"
  type        = bool
  default     = true
}

# CloudFront Configuration
variable "create_cloudfront_distribution" {
  description = "Create CloudFront distribution"
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "enable_cloudfront_waf" {
  description = "Enable WAF for CloudFront"
  type        = bool
  default     = false
}

# Route53 Configuration
variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "securevibe.io"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Create new hosted zone"
  type        = bool
  default     = false
}

variable "create_dns_records" {
  description = "Create DNS records"
  type        = bool
  default     = true
}

variable "create_cdn_records" {
  description = "Create CDN DNS records"
  type        = bool
  default     = true
}

variable "create_health_check" {
  description = "Create health check"
  type        = bool
  default     = true
}

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

variable "health_check_fqdn" {
  description = "Health check FQDN"
  type        = string
  default     = "api.securevibe.io"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {
    Project   = "securevibe"
    ManagedBy = "terraform"
  }
}
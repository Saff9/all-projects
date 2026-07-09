# =============================================================================
# SecureVibe Infrastructure - Main Terraform Configuration
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "securevibe-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "securevibe-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "securevibe"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

# -----------------------------------------------------------------------------
# Data Sources
# -----------------------------------------------------------------------------
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# -----------------------------------------------------------------------------
# VPC Module
# -----------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  vpc_cidr               = var.vpc_cidr
  public_subnet_cidrs     = var.public_subnet_cidrs
  private_subnet_cidrs    = var.private_subnet_cidrs
  database_subnet_cidrs   = var.database_subnet_cidrs
  availability_zones      = var.availability_zones

  single_nat_gateway    = var.single_nat_gateway
  enable_flow_logs     = var.enable_flow_logs
  flow_log_destination_arn = var.flow_log_destination_arn
  enable_s3_endpoint  = var.enable_s3_endpoint

  tags = var.tags
}

# -----------------------------------------------------------------------------
# EKS Module
# -----------------------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  subnet_ids         = module.vpc.private_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  kubernetes_version = var.kubernetes_version
  endpoint_public_access = var.eks_endpoint_public_access
  public_access_cidrs    = var.eks_public_access_cidrs
  kms_key_arn          = module.vpc.kms_key_arn

  main_node_group_desired_size = var.main_node_group_desired_size
  main_node_group_max_size     = var.main_node_group_max_size
  main_node_group_min_size     = var.main_node_group_min_size
  main_node_group_instance_types = var.main_node_group_instance_types

  system_node_group_desired_size = var.system_node_group_desired_size
  system_node_group_max_size     = var.system_node_group_max_size
  system_node_group_min_size     = var.system_node_group_min_size
  system_node_group_instance_types = var.system_node_group_instance_types

  ssh_key_name = var.ssh_key_name
  node_security_group_ids = [module.vpc.security_group_id]

  tags = var.tags
}

# -----------------------------------------------------------------------------
# RDS Module
# -----------------------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  vpc_id      = module.vpc.vpc_id
  subnet_ids   = module.vpc.database_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]

  db_name   = var.db_name
  username  = var.db_username
  password  = var.db_password

  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = var.db_storage_type
  iops             = var.db_iops

  multi_az               = var.db_multi_az
  backup_retention_period = var.db_backup_retention_period
  backup_window          = var.db_backup_window
  maintenance_window     = var.db_maintenance_window

  performance_insights_enabled = var.db_performance_insights_enabled
  monitoring_interval        = var.db_monitoring_interval

  tags = var.tags
}

# -----------------------------------------------------------------------------
# ElastiCache Module
# -----------------------------------------------------------------------------
module "elasticache" {
  source = "./modules/elasticache"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  vpc_id      = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.cluster_security_group_id]

  node_type            = var.redis_node_type
  number_cache_clusters = var.redis_number_cache_clusters
  auth_token           = var.redis_auth_token

  automatic_failover_enabled = var.redis_automatic_failover_enabled
  multi_az_enabled          = var.redis_multi_az_enabled

  snapshot_retention_limit = var.redis_snapshot_retention_limit
  snapshot_window        = var.redis_snapshot_window
  maintenance_window     = var.redis_maintenance_window

  tags = var.tags
}

# -----------------------------------------------------------------------------
# S3 Module
# -----------------------------------------------------------------------------
module "s3" {
  source = "./modules/s3"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  create_static_bucket = var.create_static_bucket

  tags = var.tags
}

# -----------------------------------------------------------------------------
# CloudFront Module
# -----------------------------------------------------------------------------
module "cloudfront" {
  source = "./modules/cloudfront"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  create_distribution = var.create_cloudfront_distribution

  static_bucket_id         = module.s3.static_bucket_id
  static_bucket_arn        = module.s3.static_bucket_arn
  static_bucket_domain_name = module.s3.static_bucket_domain_name

  acm_certificate_arn = var.acm_certificate_arn

  enable_waf = var.enable_cloudfront_waf

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Route53 Module
# -----------------------------------------------------------------------------
module "route53" {
  source = "./modules/route53"

  name        = "${var.name}-${var.environment}"
  aws_region  = var.aws_region

  domain_name     = var.domain_name
  hosted_zone_id  = var.hosted_zone_id
  create_hosted_zone = var.create_hosted_zone

  create_records       = var.create_dns_records
  create_cdn_records   = var.create_cdn_records
  create_health_check   = var.create_health_check

  load_balancer_dns_name = var.load_balancer_dns_name
  load_balancer_zone_id  = var.load_balancer_zone_id

  cloudfront_domain_name = module.cloudfront.distribution_domain_name

  health_check_fqdn = var.health_check_fqdn

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = module.eks.cluster_oidc_issuer_url
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
}

output "redis_primary_endpoint" {
  description = "Redis primary endpoint"
  value       = module.elasticache.primary_endpoint_address
}

output "s3_assets_bucket" {
  description = "S3 assets bucket"
  value       = module.s3.assets_bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "api_dns_name" {
  description = "API DNS name"
  value       = module.route53.api_record_fqdn
}
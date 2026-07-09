# =============================================================================
# Production Environment Configuration
# =============================================================================

environment = "prod"
aws_region = "us-east-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
database_subnet_cidrs = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

single_nat_gateway = false
enable_flow_logs = true
enable_s3_endpoint = true

# EKS Configuration
kubernetes_version = "1.28"
eks_endpoint_public_access = false
eks_public_access_cidrs = []

main_node_group_desired_size = 3
main_node_group_max_size = 20
main_node_group_min_size = 3
main_node_group_instance_types = ["t3.medium", "t3a.medium"]

system_node_group_desired_size = 2
system_node_group_max_size = 5
system_node_group_min_size = 2
system_node_group_instance_types = ["t3.small", "t3a.small"]

# RDS Configuration
db_instance_class = "db.t3.medium"
db_allocated_storage = 100
db_storage_type = "gp3"
db_iops = 12000
db_multi_az = true
db_backup_retention_period = 30
db_performance_insights_enabled = true
db_monitoring_interval = 60

# ElastiCache Configuration
redis_node_type = "cache.t3.medium"
redis_number_cache_clusters = 3
redis_automatic_failover_enabled = true
redis_multi_az_enabled = true
redis_snapshot_retention_limit = 7

# CloudFront Configuration
create_cloudfront_distribution = true
enable_cloudfront_waf = true

# Route53 Configuration
domain_name = "securevibe.io"
create_hosted_zone = false
create_dns_records = true
create_cdn_records = true
create_health_check = true

# Tags
tags = {
  Environment = "production"
  CostCenter  = "engineering"
}
# =============================================================================
# Staging Environment Configuration
# =============================================================================

environment = "staging"
aws_region = "us-east-1"

# VPC Configuration
vpc_cidr = "10.20.0.0/16"
public_subnet_cidrs = ["10.20.1.0/24", "10.20.2.0/24", "10.20.3.0/24"]
private_subnet_cidrs = ["10.20.10.0/24", "10.20.11.0/24", "10.20.12.0/24"]
database_subnet_cidrs = ["10.20.20.0/24", "10.20.21.0/24", "10.20.22.0/24"]
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

single_nat_gateway = true
enable_flow_logs = true
enable_s3_endpoint = true

# EKS Configuration
kubernetes_version = "1.28"
eks_endpoint_public_access = true
eks_public_access_cidrs = ["0.0.0.0/0"]

main_node_group_desired_size = 3
main_node_group_max_size = 8
main_node_group_min_size = 3
main_node_group_instance_types = ["t3.medium"]

system_node_group_desired_size = 2
system_node_group_max_size = 4
system_node_group_min_size = 2
system_node_group_instance_types = ["t3.small"]

# RDS Configuration
db_instance_class = "db.t3.small"
db_allocated_storage = 20
db_storage_type = "gp3"
db_iops = 3000
db_multi_az = true
db_backup_retention_period = 7
db_performance_insights_enabled = true
db_monitoring_interval = 60

# ElastiCache Configuration
redis_node_type = "cache.t3.small"
redis_number_cache_clusters = 2
redis_automatic_failover_enabled = true
redis_multi_az_enabled = true
redis_snapshot_retention_limit = 5

# CloudFront Configuration
create_cloudfront_distribution = true
enable_cloudfront_waf = false

# Route53 Configuration
domain_name = "staging.securevibe.io"
create_hosted_zone = false
create_dns_records = true
create_cdn_records = true
create_health_check = true

# Tags
tags = {
  Environment = "staging"
  CostCenter  = "engineering"
}
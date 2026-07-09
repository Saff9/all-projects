# =============================================================================
# Development Environment Configuration
# =============================================================================

environment = "dev"
aws_region = "us-east-1"

# VPC Configuration
vpc_cidr = "10.10.0.0/16"
public_subnet_cidrs = ["10.10.1.0/24", "10.10.2.0/24"]
private_subnet_cidrs = ["10.10.10.0/24", "10.10.11.0/24"]
database_subnet_cidrs = ["10.10.20.0/24", "10.10.21.0/24"]
availability_zones = ["us-east-1a", "us-east-1b"]

single_nat_gateway = true
enable_flow_logs = false
enable_s3_endpoint = true

# EKS Configuration
kubernetes_version = "1.28"
eks_endpoint_public_access = true
eks_public_access_cidrs = ["0.0.0.0/0"]

main_node_group_desired_size = 2
main_node_group_max_size = 5
main_node_group_min_size = 2
main_node_group_instance_types = ["t3.small"]

system_node_group_desired_size = 1
system_node_group_max_size = 3
system_node_group_min_size = 1
system_node_group_instance_types = ["t3.small"]

# RDS Configuration
db_instance_class = "db.t3.micro"
db_allocated_storage = 20
db_storage_type = "gp2"
db_iops = 0
db_multi_az = false
db_backup_retention_period = 1
db_performance_insights_enabled = false
db_monitoring_interval = 0

# ElastiCache Configuration
redis_node_type = "cache.t3.micro"
redis_number_cache_clusters = 1
redis_automatic_failover_enabled = false
redis_multi_az_enabled = false
redis_snapshot_retention_limit = 1

# CloudFront Configuration
create_cloudfront_distribution = false
enable_cloudfront_waf = false

# Route53 Configuration
domain_name = "dev.securevibe.io"
create_hosted_zone = false
create_dns_records = false
create_cdn_records = false
create_health_check = false

# Tags
tags = {
  Environment = "dev"
  CostCenter  = "engineering"
}
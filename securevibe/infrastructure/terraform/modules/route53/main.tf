# =============================================================================
# Route53 Module - SecureVibe Infrastructure
# Creates DNS management
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# -----------------------------------------------------------------------------
# Route53 Hosted Zone
# -----------------------------------------------------------------------------
resource "aws_route53_zone" "this" {
  count = var.create_hosted_zone ? 1 : 0

  name = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-hosted-zone"
    }
  )
}

# -----------------------------------------------------------------------------
# Route53 Records for Application
# -----------------------------------------------------------------------------
resource "aws_route53_record" "api" {
  count = var.create_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = "api"
  type    = "A"

  alias {
    name                   = var.load_balancer_dns_name
    zone_id                = var.load_balancer_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  count = var.create_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = "www"
  type    = "A"

  alias {
    name                   = var.load_balancer_dns_name
    zone_id                = var.load_balancer_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "root" {
  count = var.create_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = ""
  type    = "A"

  alias {
    name                   = var.load_balancer_dns_name
    zone_id                = var.load_balancer_zone_id
    evaluate_target_health = true
  }
}

# -----------------------------------------------------------------------------
# Route53 Records for CloudFront
# -----------------------------------------------------------------------------
resource "aws_route53_record" "cdn" {
  count = var.create_cdn_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = "cdn"
  type    = "CNAME"
  ttl     = 300
  records = [var.cloudfront_domain_name]
}

resource "aws_route53_record" "static" {
  count = var.create_cdn_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = "static"
  type    = "CNAME"
  ttl     = 300
  records = [var.cloudfront_domain_name]
}

# -----------------------------------------------------------------------------
# Route53 Records for Verification
# -----------------------------------------------------------------------------
resource "aws_route53_record" "verification" {
  count = var.create_verification_records ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.verification_record_name
  type    = "TXT"
  ttl     = 300
  records = [var.verification_record_value]
}

# -----------------------------------------------------------------------------
# Route53 Health Checks
# -----------------------------------------------------------------------------
resource "aws_route53_health_check" "this" {
  count = var.create_health_check ? 1 : 0

  fqdn              = var.health_check_fqdn
  port              = var.health_check_port
  type              = var.health_check_type
  request_interval   = var.health_check_interval
  failure_threshold = var.health_check_failure_threshold

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-health-check"
    }
  )
}

# -----------------------------------------------------------------------------
# Route53 DNSSEC (Optional)
# -----------------------------------------------------------------------------
resource "aws_route53_key_signing_key" "this" {
  count = var.enable_dnssec ? 1 : 0

  hosted_zone_id = var.hosted_zone_id
  key_size       = var.dnssec_key_size

  status = "ACTIVE"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-dnssec-key"
    }
  )
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].id : var.hosted_zone_id
}

output "hosted_zone_name" {
  description = "Route53 hosted zone name"
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].name : var.domain_name
}

output "hosted_zone_name_servers" {
  description = "Route53 hosted zone name servers"
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].name_servers : []
}

output "api_record_fqdn" {
  description = "API record FQDN"
  value       = var.create_records ? aws_route53_record.api[0].fqdn : null
}

output "www_record_fqdn" {
  description = "WWW record FQDN"
  value       = var.create_records ? aws_route53_record.www[0].fqdn : null
}

output "root_record_fqdn" {
  description = "Root record FQDN"
  value       = var.create_records ? aws_route53_record.root[0].fqdn : null
}

output "cdn_record_fqdn" {
  description = "CDN record FQDN"
  value       = var.create_cdn_records ? aws_route53_record.cdn[0].fqdn : null
}

output "static_record_fqdn" {
  description = "Static record FQDN"
  value       = var.create_cdn_records ? aws_route53_record.static[0].fqdn : null
}

output "health_check_id" {
  description = "Route53 health check ID"
  value       = var.create_health_check ? aws_route53_health_check.this[0].id : null
}

output "dnssec_key_signing_key_id" {
  description = "DNSSEC key signing key ID"
  value       = var.enable_dnssec ? aws_route53_key_signing_key.this[0].id : null
}
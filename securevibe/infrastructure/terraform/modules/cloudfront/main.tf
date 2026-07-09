# =============================================================================
# CloudFront Module - SecureVibe Infrastructure
# Creates CDN for static assets
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
# CloudFront Distribution for Static Assets
# -----------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "static" {
  count = var.create_distribution ? 1 : 0

  enabled             = true
  is_ipv6_enabled    = true
  comment             = "${var.name} static assets CDN"
  default_root_object = "index.html"
  price_class         = var.price_class

  origin {
    domain_name = var.static_bucket_domain_name
    origin_id   = "S3-${var.name}-static"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.static[0].cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.name}-static"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.min_ttl
    default_ttl            = var.default_ttl
    max_ttl                = var.max_ttl
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.name}-static"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.min_ttl
    default_ttl            = var.default_ttl
    max_ttl                = var.max_ttl
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-static-cdn"
    }
  )
}

# -----------------------------------------------------------------------------
# CloudFront Origin Access Identity
# -----------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_identity" "static" {
  count = var.create_distribution ? 1 : 0

  comment = "${var.name} static assets OAI"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-static-oai"
    }
  )
}

# -----------------------------------------------------------------------------
# S3 Bucket Policy for CloudFront
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "static_cloudfront" {
  count = var.create_distribution ? 1 : 0

  bucket = var.static_bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.static[0].iam_arn
        }
        Action    = "s3:GetObject"
        Resource = "${var.static_bucket_arn}/*"
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# CloudFront WAF (Optional)
# -----------------------------------------------------------------------------
resource "aws_wafv2_web_acl" "cloudfront" {
  count = var.enable_waf ? 1 : 0

  name        = "${var.name}-cloudfront-waf"
  description = "WAF for CloudFront distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name             = "${var.name}-cloudfront-waf"
    sampled_requests_enabled  = true
  }

  tags = var.tags
}

resource "aws_wafv2_web_acl_association" "cloudfront" {
  count = var.enable_waf && var.create_distribution ? 1 : 0

  resource_arn = aws_cloudfront_distribution.static[0].arn
  web_acl_arn  = aws_wafv2_web_acl.cloudfront[0].arn
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.create_distribution ? aws_cloudfront_distribution.static[0].id : null
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = var.create_distribution ? aws_cloudfront_distribution.static[0].arn : null
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.create_distribution ? aws_cloudfront_distribution.static[0].domain_name : null
}

output "origin_access_identity_id" {
  description = "CloudFront origin access identity ID"
  value       = var.create_distribution ? aws_cloudfront_origin_access_identity.static[0].id : null
}

output "origin_access_identity_iam_arn" {
  description = "CloudFront origin access identity IAM ARN"
  value       = var.create_distribution ? aws_cloudfront_origin_access_identity.static[0].iam_arn : null
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = var.enable_waf ? aws_wafv2_web_acl.cloudfront[0].id : null
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable_waf ? aws_wafv2_web_acl.cloudfront[0].arn : null
}
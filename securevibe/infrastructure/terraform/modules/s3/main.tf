# =============================================================================
# S3 Module - SecureVibe Infrastructure
# Creates S3 buckets with encryption and lifecycle
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
# KMS Key for S3 Encryption
# -----------------------------------------------------------------------------
resource "aws_kms_key" "s3" {
  description             = "KMS key for S3 encryption"
  deletion_window_in_days = var.kms_deletion_window
  enable_key_rotation     = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-s3-kms"
    }
  )
}

resource "aws_kms_alias" "s3" {
  name          = "alias/${var.name}-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# -----------------------------------------------------------------------------
# S3 Bucket for Application Assets
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket = "${var.name}-assets"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-assets"
    }
  )
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "lifecycle-rule"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = var.abort_incomplete_multipart_upload_days
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnforceTLS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# S3 Bucket for Logs
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "logs" {
  bucket = "${var.name}-logs"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-logs"
    }
  )
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "log-expiration"
    status = "Enabled"

    expiration {
      days = var.log_expiration_days
    }

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket for Backups
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "backups" {
  bucket = "${var.name}-backups"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-backups"
    }
  )
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backup-lifecycle"
    status = "Enabled"

    transition {
      days          = var.transition_to_ia_days
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = var.transition_to_glacier_days
      storage_class = "GLACIER"
    }

    expiration {
      days = var.backup_expiration_days
    }

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket for Static Assets (Public)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "static" {
  count = var.create_static_bucket ? 1 : 0

  bucket = "${var.name}-static"

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-static"
    }
  )
}

resource "aws_s3_bucket_versioning" "static" {
  count  = var.create_static_bucket ? 1 : 0
  bucket = aws_s3_bucket.static[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "static" {
  count  = var.create_static_bucket ? 1 : 0
  bucket = aws_s3_bucket.static[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_website_configuration" "static" {
  count  = var.create_static_bucket ? 1 : 0
  bucket = aws_s3_bucket.static[0].id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  count  = var.create_static_bucket ? 1 : 0
  bucket = aws_s3_bucket.static[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static" {
  count  = var.create_static_bucket ? 1 : 0
  bucket = aws_s3_bucket.static[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = "${aws_s3_bucket.static[0].arn}/*"
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# CloudFront Origin Access Control
# -----------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "static" {
  count = var.create_static_bucket ? 1 : 0

  name                              = "${var.name}-static-oac"
  description                       = "OAC for static assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "assets_bucket_id" {
  description = "Assets bucket ID"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_arn" {
  description = "Assets bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "assets_bucket_domain_name" {
  description = "Assets bucket domain name"
  value       = aws_s3_bucket.assets.bucket_domain_name
}

output "logs_bucket_id" {
  description = "Logs bucket ID"
  value       = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  description = "Logs bucket ARN"
  value       = aws_s3_bucket.logs.arn
}

output "backups_bucket_id" {
  description = "Backups bucket ID"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "Backups bucket ARN"
  value       = aws_s3_bucket.backups.arn
}

output "static_bucket_id" {
  description = "Static bucket ID"
  value       = var.create_static_bucket ? aws_s3_bucket.static[0].id : null
}

output "static_bucket_arn" {
  description = "Static bucket ARN"
  value       = var.create_static_bucket ? aws_s3_bucket.static[0].arn : null
}

output "static_bucket_website_endpoint" {
  description = "Static bucket website endpoint"
  value       = var.create_static_bucket ? aws_s3_bucket_website_configuration.static[0].website_endpoint : null
}

output "kms_key_id" {
  description = "KMS key ID for encryption"
  value       = aws_kms_key.s3.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for encryption"
  value       = aws_kms_key.s3.arn
}
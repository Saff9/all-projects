# =============================================================================
# EKS Module Variables
# =============================================================================

variable "name" {
  description = "Name of EKS cluster and resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "subnet_ids" {
  description = "List of subnet IDs for EKS cluster"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for node groups"
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Enable public API server endpoint"
  type        = bool
  default     = false
}

variable "public_access_cidrs" {
  description = "CIDR blocks allowed to access public endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "kms_key_arn" {
  description = "KMS key ARN for EKS encryption"
  type        = string
  default     = ""
}

variable "enabled_cluster_log_types" {
  description = "List of enabled cluster log types"
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# Main Node Group
variable "main_node_group_desired_size" {
  description = "Desired size of main node group"
  type        = number
  default     = 3
}

variable "main_node_group_max_size" {
  description = "Maximum size of main node group"
  type        = number
  default     = 10
}

variable "main_node_group_min_size" {
  description = "Minimum size of main node group"
  type        = number
  default     = 3
}

variable "main_node_group_instance_types" {
  description = "Instance types for main node group"
  type        = list(string)
  default     = ["t3.medium", "t3a.medium"]
}

# System Node Group
variable "system_node_group_desired_size" {
  description = "Desired size of system node group"
  type        = number
  default     = 2
}

variable "system_node_group_max_size" {
  description = "Maximum size of system node group"
  type        = number
  default     = 5
}

variable "system_node_group_min_size" {
  description = "Minimum size of system node group"
  type        = number
  default     = 2
}

variable "system_node_group_instance_types" {
  description = "Instance types for system node group"
  type        = list(string)
  default     = ["t3.small", "t3a.small"]
}

variable "max_unavailable_percentage" {
  description = "Maximum unavailable percentage during node group update"
  type        = number
  default     = 33
}

variable "ssh_key_name" {
  description = "SSH key name for EC2 instances"
  type        = string
  default     = ""
}

variable "node_security_group_ids" {
  description = "Security group IDs for node access"
  type        = list(string)
  default     = []
}

# Add-on Versions
variable "vpc_cni_version" {
  description = "VPC CNI add-on version"
  type        = string
  default     = "v1.15.1-eksbuild.1"
}

variable "coredns_version" {
  description = "CoreDNS add-on version"
  type        = string
  default     = "v1.10.1-eksbuild.6"
}

variable "kube_proxy_version" {
  description = "Kube-proxy add-on version"
  type        = string
  default     = "v1.28.1-eksbuild.1"
}

variable "ebs_csi_driver_version" {
  description = "EBS CSI driver add-on version"
  type        = string
  default     = "v1.26.0-eksbuild.1"
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
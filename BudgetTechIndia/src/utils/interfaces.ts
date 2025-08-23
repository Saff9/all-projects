/**
 * TypeScript Interfaces for BudgetTechIndia
 * =========================================
 * This file contains all TypeScript interfaces used throughout the application.
 */

/* ========================================
   Product Related Interfaces
   ======================================== */

/**
 * Product interface for product data from JSON
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  /** Product display name */
  name: string;
  /** URL-friendly identifier */
  slug: string;
  /** Category ID reference */
  category: string;
  /** Brand name */
  brand: string;
  /** Current selling price in INR */
  price: number;
  /** Original MRP in INR */
  mrp: number;
  /** Currency code (always INR) */
  currency: 'INR';
  /** Product image URL */
  imageUrl: string;
  /** Amazon affiliate URL */
  affiliateUrl: string;
  /** Amazon Standard Identification Number */
  asin: string;
  /** Product rating (0-5) */
  rating: number;
  /** Total number of reviews */
  reviewCount: number;
  /** Key product features */
  features: Record<string, string>;
  /** Product advantages */
  pros: string[];
  /** Product disadvantages */
  cons: string[];
  /** Last update date (ISO string) */
  lastUpdated?: string;
  /** Optional description */
  description?: string;
  /** In stock flag */
  inStock?: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Expiration timestamp */
  expiresAt?: string;
  /** Whether product is currently available */
  isActive: boolean;
}

/**
 * Product card props for display components
 */
export interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  showPrice?: boolean;
  layout?: 'grid' | 'list';
}

/**
 * Comparison table props for React component
 */
export interface ComparisonTableProps {
  products: Product[];
  features: string[];
  highlightBest?: boolean;
}

/* ========================================
   Category Related Interfaces
   ======================================== */

/**
 * Category interface for category data
 */
export interface Category {
  /** Unique category identifier */
  id: string;
  /** Category display name */
  name: string;
  /** URL-friendly identifier */
  slug: string;
  /** Category description */
  description: string;
  /** Category thumbnail image URL */
  imageUrl: string;
  /** Icon identifier */
  icon: string;
  /** Price range for products in this category */
  priceRange: {
    min: number;
    max: number;
  };
  /** Number of products in category */
  productCount: number;
  /** Whether category is featured on homepage */
  featured: boolean;
}

/* ========================================
   Article/Content Related Interfaces
   ======================================== */

/**
 * Article type enumeration
 */
export type ArticleType = 'review' | 'top5' | 'blog';

/**
 * Base article interface
 */
export interface ArticleBase {
  /** URL-friendly identifier */
  slug: string;
  /** Article title */
  title: string;
  /** Meta description */
  description: string;
  /** Publication date */
  pubDate: Date;
  /** Last updated date */
  updatedDate?: Date;
  /** Author name */
  author: string;
  /** Category ID reference */
  category?: string;
  /** Article tags */
  tags: string[];
  /** Featured image URL */
  image: string;
  /** Article type */
  type: ArticleType;
}

/**
 * Review article interface
 */
export interface ReviewArticle extends ArticleBase {
  type: 'review';
  /** Single product being reviewed */
  productId: string;
  /** Enable schema markup */
  schema?: boolean;
  /** Show affiliate disclosure */
  affiliateDisclosure?: boolean;
}

/**
 * Top 5 list article interface
 */
export interface Top5Article extends ArticleBase {
  type: 'top5';
  /** Multiple products in the list */
  productIds: string[];
}

/**
 * Blog article interface
 */
export interface BlogArticle extends ArticleBase {
  type: 'blog';
}

/**
 * Union type for all article types
 */
export type Article = ReviewArticle | Top5Article | BlogArticle;

/* ========================================
   Author Related Interfaces
   ======================================== */

/**
 * Author interface for content authors
 */
export interface Author {
  /** Unique author identifier */
  id: string;
  /** Author name */
  name: string;
  /** Author bio */
  bio: string;
  /** Author avatar URL */
  avatar: string;
  /** Author role/title */
  role: string;
  /** Social media links */
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

/* ========================================
   SEO Related Interfaces
   ======================================== */

/**
 * SEO metadata interface
 */
export interface SEOMeta {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** Canonical URL */
  canonical?: string;
  /** Open Graph image URL */
  image?: string;
  /** Content type */
  type?: 'website' | 'article' | 'product';
  /** Noindex directive */
  noindex?: boolean;
  /** Nofollow directive */
  nofollow?: boolean;
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image';
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Display label */
  name: string;
  /** URL path */
  url?: string;
}

/* ========================================
   Site Configuration Interface
   ======================================== */

/**
 * Site-wide configuration interface
 */
export interface SiteConfig {
  /** Site name */
  name: string;
  /** Site description */
  description: string;
  /** Production URL */
  url: string;
  /** Locale setting */
  locale: 'en_IN';
  /** Currency code */
  currency: 'INR';
  /** Amazon affiliate tag */
  affiliateTag: string;
  /** Social media links */
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

/* ========================================
   Navigation Related Interfaces
   ======================================== */

/**
 * Navigation item interface
 */
export interface NavItem {
  /** Display label */
  label: string;
  /** URL path */
  href: string;
  /** Whether link opens in new tab */
  external?: boolean;
  /** Child navigation items */
  children?: NavItem[];
}

/**
 * Navigation configuration interface
 */
export interface NavigationConfig {
  /** Main navigation items */
  main: NavItem[];
  /** Footer navigation items */
  footer: NavItem[];
  /** Social media links */
  social: {
    platform: string;
    url: string;
    icon: string;
  }[];
}

/* ========================================
   JSON-LD Schema Interfaces
   ======================================== */

/**
 * JSON-LD Schema type enumeration
 */
export type SchemaType = 'organization' | 'website' | 'product' | 'article' | 'breadcrumb' | 'faq';

/**
 * JSON-LD Schema base interface
 */
export interface JsonLDProps {
  /** Schema type */
  type: SchemaType;
  /** Schema data */
  data: Record<string, unknown>;
}

/* ========================================
   Utility Types
   ======================================== */

/**
 * Price information interface
 */
export interface PriceInfo {
  /** Current price */
  price: number;
  /** Original MRP */
  mrp: number;
  /** Currency code */
  currency: string;
  /** Discount percentage */
  discount: number;
  /** Formatted price string */
  formatted: string;
  /** Formatted MRP string */
  formattedMrp: string;
}

/**
 * Pagination interface
 */
export interface Pagination {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items per page */
  perPage: number;
  /** Total item count */
  totalItems: number;
  /** Has previous page */
  hasPrev: boolean;
  /** Has next page */
  hasNext: boolean;
  /** Previous page URL */
  prevUrl?: string;
  /** Next page URL */
  nextUrl?: string;
}

/**
 * API response interface
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message if any */
  error?: string;
}

/**
 * Sort option interface
 */
export interface SortOption {
  /** Sort value */
  value: string;
  /** Display label */
  label: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Filter option interface
 */
export interface FilterOption {
  /** Filter value */
  value: string;
  /** Display label */
  label: string;
  /** Item count */
  count?: number;
}
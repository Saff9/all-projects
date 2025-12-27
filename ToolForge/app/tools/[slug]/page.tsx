import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TOOLS, getToolBySlug } from '@/lib/tools-data';
import {
  generateToolMetadata,
  generateWebApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo-utils';

import ToolHeader from '@/components/ToolHeader';
import ToolContentSection from '@/components/ToolContentSection';
import RelatedTools from '@/components/RelatedTools';

// Tool Components
import WebsiteSeoAuditChecker from '@/components/tools/WebsiteSeoAuditChecker';
import AstroSeoGenerator from '@/components/tools/AstroSeoGenerator';
import MetaTagGenerator from '@/components/tools/MetaTagGenerator';
import SchemaGenerator from '@/components/tools/SchemaGenerator';
import RobotsTxtGenerator from '@/components/tools/RobotsTxtGenerator';
import SerpSimulator from '@/components/tools/SerpSimulator';
import KeywordDensityAnalyzer from '@/components/tools/KeywordDensityAnalyzer';
import JsonValidatorFormatter from '@/components/tools/JsonValidatorFormatter';
import Base64EncoderDecoder from '@/components/tools/Base64EncoderDecoder';
import UrlEncoderDecoder from '@/components/tools/UrlEncoderDecoder';
import RegexTester from '@/components/tools/RegexTester';
import CronExpressionDescriptor from '@/components/tools/CronExpressionDescriptor';
import UuidHashGenerator from '@/components/tools/UuidHashGenerator';
import MarkdownToHtml from '@/components/tools/MarkdownToHtml';
import WcagContrastChecker from '@/components/tools/WcagContrastChecker';
import CssBoxShadowGenerator from '@/components/tools/CssBoxShadowGenerator';
import GlassmorphismGenerator from '@/components/tools/GlassmorphismGenerator';
import FlexboxGridBuilder from '@/components/tools/FlexboxGridBuilder';
import WordReadabilityCounter from '@/components/tools/WordReadabilityCounter';
import UrlSlugGenerator from '@/components/tools/UrlSlugGenerator';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import LoremIpsumGenerator from '@/components/tools/LoremIpsumGenerator';

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return generateToolMetadata(tool);
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  // Generate Schemas
  const webAppSchema = generateWebApplicationSchema(tool);
  const faqSchema = generateFAQSchema(tool.faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: tool.categoryName, url: `/categories/${tool.category}` },
    { name: tool.name, url: `/tools/${tool.slug}` },
  ]);

  const renderToolComponent = () => {
    switch (tool.slug) {
      case 'website-seo-audit-checker':
        return <WebsiteSeoAuditChecker />;
      case 'astro-seo-generator':
        return <AstroSeoGenerator />;
      case 'meta-tag-generator':
        return <MetaTagGenerator />;
      case 'schema-generator':
        return <SchemaGenerator />;
      case 'robots-txt-generator':
        return <RobotsTxtGenerator />;
      case 'serp-simulator':
        return <SerpSimulator />;
      case 'keyword-density-analyzer':
        return <KeywordDensityAnalyzer />;
      case 'json-validator-formatter':
        return <JsonValidatorFormatter />;
      case 'base64-encoder-decoder':
        return <Base64EncoderDecoder />;
      case 'url-encoder-decoder':
        return <UrlEncoderDecoder />;
      case 'regex-tester':
        return <RegexTester />;
      case 'cron-expression-descriptor':
        return <CronExpressionDescriptor />;
      case 'uuid-hash-generator':
        return <UuidHashGenerator />;
      case 'markdown-to-html':
        return <MarkdownToHtml />;
      case 'wcag-contrast-checker':
        return <WcagContrastChecker />;
      case 'css-box-shadow-generator':
        return <CssBoxShadowGenerator />;
      case 'glassmorphism-generator':
        return <GlassmorphismGenerator />;
      case 'flexbox-grid-builder':
        return <FlexboxGridBuilder />;
      case 'word-readability-counter':
        return <WordReadabilityCounter />;
      case 'url-slug-generator':
        return <UrlSlugGenerator />;
      case 'text-case-converter':
        return <TextCaseConverter />;
      case 'lorem-ipsum-generator':
        return <LoremIpsumGenerator />;
      default:
        return <div>Tool coming soon</div>;
    }
  };

  return (
    <>
      {/* Schema.org Microdata Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Page Header */}
      <ToolHeader tool={tool} />

      {/* Interactive Tool Sandbox */}
      <section aria-label="Interactive Tool Workspace" className="mb-12">
        {renderToolComponent()}
      </section>

      {/* Deep Educational SEO Content & FAQs */}
      <ToolContentSection tool={tool} />

      {/* Related Tools Internal Silo */}
      <RelatedTools currentToolSlug={tool.slug} />
    </>
  );
}

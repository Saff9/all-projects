import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  Sparkles,
  ArrowRight,
  Search,
  Code2,
  Palette,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '@/lib/tools-data';
import {
  generateCanonicalUrl,
  generateBreadcrumbSchema,
  SITE_NAME,
} from '@/lib/seo-utils';

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = CATEGORIES[params.slug];
  if (!category) return {};

  const title = `${category.title} | ${SITE_NAME}`;
  const description = category.description;
  const canonical = generateCanonicalUrl(`/categories/${category.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORIES[params.slug];
  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(params.slug);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: category.name, url: `/categories/${category.slug}` },
  ]);

  const otherCategories = Object.values(CATEGORIES).filter((c) => c.slug !== category.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header & Breadcrumbs */}
      <div className="mb-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">{category.name}</span>
        </nav>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
            <Sparkles className="w-3.5 h-3.5" /> {tools.length} Free Utilities Available
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {category.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-xl transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 transition-colors">
                    100% Free
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-white transition-all shadow-xs">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {tool.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {tool.shortDescription}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {tool.features.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Launch Tool</span>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore Other Categories */}
      <section className="pt-12 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Explore Other Tool Suites
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors mb-1">
                {cat.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

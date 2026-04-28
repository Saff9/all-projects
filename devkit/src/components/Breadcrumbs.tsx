'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { tools, categories, Tool } from '@/utils/tools';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage
  if (pathname === '/') {
    return null;
  }

  // Find current tool
  const currentTool = tools.find((tool) => tool.path === pathname);
  const currentCategory = currentTool
    ? categories.find((cat) => cat.id === currentTool.category)
    : null;

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: Home },
    ...(currentCategory
      ? [
          {
            label: currentCategory.name,
            href: `/?category=${currentCategory.id}`,
          },
        ]
      : []),
    ...(currentTool
      ? [
          {
            label: currentTool.name,
            active: true,
          },
        ]
      : []),
  ];

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <li key={item.label} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-zinc-600 mx-1" aria-hidden="true" />
            )}
            {item.active || !item.href ? (
              <span
                className={`px-2 py-1 rounded-md ${
                  item.active
                    ? 'bg-blue-500/20 text-blue-400 font-medium'
                    : 'text-zinc-400'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper function to get breadcrumbs for any path
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  const currentTool = tools.find((tool) => tool.path === pathname);
  const currentCategory = currentTool
    ? categories.find((cat) => cat.id === currentTool.category)
    : null;

  if (currentCategory) {
    items.push({
      label: currentCategory.name,
      href: `/?category=${currentCategory.id}`,
    });
  }

  if (currentTool) {
    items.push({
      label: currentTool.name,
      active: true,
    });
  }

  return items;
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogPost } from '@/lib/blog';
import BlogListing from '@/components/blog/BlogListing';

export default function BlogPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [category, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const limit = 9;
      const offset = (page - 1) * limit;
      const categoryParam = category && category !== 'All' ? `&category=${encodeURIComponent(category)}` : '';

      const response = await fetch(`/api/blog?limit=${limit}&offset=${offset}${categoryParam}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);

        // Get all categories
        const categoriesResponse = await fetch('/api/blog?limit=1000');
        if (categoriesResponse.ok) {
          const allData = await categoriesResponse.json() as { posts: BlogPost[] };
          const uniqueCategories = [...new Set(allData.posts.map((p) => p.category))];
          setCategories(['All', ...uniqueCategories.filter(cat => cat !== 'All').sort()]);
        }
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <BlogListing
      posts={posts}
      categories={categories}
      currentCategory={category}
      currentPage={page}
    />
  );
}

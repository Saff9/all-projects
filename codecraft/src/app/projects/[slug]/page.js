// src/app/projects/[slug]/page.js
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import ArticleLayout from '@/components/ArticleLayout';
import Playground from '@/components/Playground';
import GitHubStats from '@/components/GitHubStats';
import { Suspense } from 'react';

const components = {
  Playground,
};

export async function generateStaticParams() {
  return getAllPosts('projects').map(post => ({ slug: post.slug }));
}

export default async function ProjectPostPage({ params }) {
  const post = getPostBySlug('projects', params.slug);

  if (!post) notFound();

  return (
    <ArticleLayout post={post}>
      <MDXRemote source={post.content} components={components} />
      {post.frontmatter.githubRepo && (
        <Suspense fallback={<p className="text-craft-muted mt-8">Loading GitHub stats…</p>}>
          <GitHubStats repo={post.frontmatter.githubRepo} />
        </Suspense>
      )}
    </ArticleLayout>
  );
}

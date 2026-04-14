// src/app/blog/[slug]/page.js
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import ArticleLayout from '@/components/ArticleLayout';
import Playground from '@/components/Playground';

// Components available inside MDX
const components = {
  Playground,
};

export async function generateStaticParams() {
  return getAllPosts('blog').map(post => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }) {
  const post = getPostBySlug('blog', params.slug);

  if (!post) notFound();

  return (
    <ArticleLayout post={post}>
      <MDXRemote source={post.content} components={components} />
    </ArticleLayout>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { blogPosts, BlogPost } from '@/lib/blog';

// In production, this would be a database
let posts: BlogPost[] = [...blogPosts];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = posts.find(p => p.slug === slug && p.status === 'published');

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Get related posts
  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.status === 'published')
    .filter(p =>
      p.tags.some(tag => post.tags.includes(tag)) ||
      p.category === post.category
    )
    .slice(0, 3);

  return NextResponse.json({
    post,
    relatedPosts
  });
}

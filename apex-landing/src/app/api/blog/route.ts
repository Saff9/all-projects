import { NextRequest, NextResponse } from 'next/server';
import { blogPosts, BlogPost } from '@/lib/blog';

// In production, this would be a database
let posts: BlogPost[] = [...blogPosts];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '9');
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category');

  let filteredPosts = posts.filter(post => post.status === 'published');

  if (category && category !== 'All') {
    filteredPosts = filteredPosts.filter(post =>
      post.category.toLowerCase() === category.toLowerCase()
    );
  }

  filteredPosts = filteredPosts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const paginatedPosts = filteredPosts.slice(offset, offset + limit);

  return NextResponse.json({
    posts: paginatedPosts,
    total: filteredPosts.length,
    hasMore: offset + limit < filteredPosts.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      author: {
        name: body.authorName,
        role: body.authorRole
      },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      publishedAt: new Date().toISOString(),
      readTime: `${Math.ceil(body.content.split(' ').length / 200)} min read`,
      category: body.category,
      tags: body.tags.split(',').map((tag: string) => tag.trim()),
      featured: body.featured || false,
      slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      seo: {
        title: body.title,
        description: body.excerpt,
        keywords: body.tags.split(',').map((tag: string) => tag.trim()),
        ogImage: undefined
      },
      status: 'published'
    };

    posts.unshift(newPost);

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const postId = body.id;

    const updatedPost: BlogPost = {
      id: postId,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      author: {
        name: body.authorName,
        role: body.authorRole
      },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      publishedAt: body.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTime: `${Math.ceil(body.content.split(' ').length / 200)} min read`,
      category: body.category,
      tags: body.tags.split(',').map((tag: string) => tag.trim()),
      featured: body.featured || false,
      slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      seo: {
        title: body.title,
        description: body.excerpt,
        keywords: body.tags.split(',').map((tag: string) => tag.trim()),
        ogImage: undefined
      },
      status: 'published'
    };

    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = updatedPost;
      return NextResponse.json({ success: true, post: updatedPost });
    } else {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts.splice(index, 1);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

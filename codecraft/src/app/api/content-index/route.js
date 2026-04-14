// src/app/api/content-index/route.js
import { getAllPosts } from '@/lib/posts';

export const runtime = 'nodejs'; // not required, but fine

export async function GET() {
  const blog = getAllPosts('blog');
  const projects = getAllPosts('projects');
  return Response.json([...blog, ...projects]);
}

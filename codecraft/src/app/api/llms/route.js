// src/app/api/llms/route.js
import { getAllPosts } from '@/lib/posts';

export const runtime = 'nodejs';

export async function GET() {
  const blog = getAllPosts('blog');
  const projects = getAllPosts('projects');

  const lines = ['# Code Craft'];

  if (blog.length > 0) {
    lines.push('\n## Blog');
    blog.forEach(p => lines.push(`- [${p.frontmatter.title}](https://codecraft.vercel.app/blog/${p.slug})`));
  }

  if (projects.length > 0) {
    lines.push('\n## Projects');
    projects.forEach(p => lines.push(`- [${p.frontmatter.title}](https://codecraft.vercel.app/projects/${p.slug})`));
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

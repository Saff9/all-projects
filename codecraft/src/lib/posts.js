// src/lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

/**
 * Get all posts of a given type (blog or projects)
 * @param {string} type - 'blog' or 'projects'
 * @returns {Array<{slug: string, type: string, frontmatter: object, content: string}>}
 */
export function getAllPosts(type) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.mdx?$/, ''),
      type,
      frontmatter: data,
      content,
    };
  });

  // sort by date descending
  return posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
}

/**
 * Get a single post by slug and type
 * @param {string} type - 'blog' or 'projects'
 * @param {string} slug
 * @returns {object|null}
 */
export function getPostBySlug(type, slug) {
  const posts = getAllPosts(type);
  return posts.find(p => p.slug === slug) || null;
}

/**
 * Get all unique tags from both blog and project posts
 * @returns {string[]}
 */
export function getAllTags() {
  const posts = [...getAllPosts('blog'), ...getAllPosts('projects')];
  const tags = new Set();
  posts.forEach(p => (p.frontmatter.tags || []).forEach(tag => tags.add(tag)));
  return Array.from(tags);
}

/**
 * Get all posts (blog + projects) that contain a specific tag
 * @param {string} tag
 * @returns {Array}
 */
export function getPostsByTag(tag) {
  const posts = [...getAllPosts('blog'), ...getAllPosts('projects')];
  return posts.filter(p => (p.frontmatter.tags || []).includes(tag));
}

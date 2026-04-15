// src/app/tags/[tag]/page.js
import { getPostsByTag, getAllTags } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';

export async function generateStaticParams() {
  return getAllTags().map(tag => ({ tag }));
}

export default function TagPage({ params }) {
  const posts = getPostsByTag(params.tag);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-craft-mint mb-8">
        Posts tagged <span className="text-craft-primary">#{params.tag}</span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-craft-muted">No posts found with this tag.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

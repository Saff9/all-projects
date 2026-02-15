"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { BlogPost as BlogPostType } from '@/lib/blog';

interface BlogProps {
  posts: BlogPostType[];
  categories: string[];
}

const categoryIcons = {
  Research: TrendingUp,
  Engineering: Users,
  Product: BookOpen,
  Security: TrendingUp,
  All: BookOpen,
};

const Blog = ({ posts, categories }: BlogProps) => {
  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);
  const allCategories = ['All', ...categories];

  return (
    <section className="py-24 relative bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
            <BookOpen className="w-3 h-3" />
            <span>Latest Insights</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Thoughts on AI & Technology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into cutting-edge AI research, engineering breakthroughs, and the future of intelligent systems.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {allCategories.map((category, index) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
            return (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {category}
              </motion.button>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 group relative"
              style={{ perspective: '1200px' }}
            >
              {/* Premium 3D Featured Card */}
              <motion.div
                className="relative overflow-hidden rounded-3xl bg-card border border-border/50"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
                whileHover={{
                  rotateY: -2,
                  rotateX: 2,
                  scale: 1.02,
                  boxShadow: '0 35px 70px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                {/* Gradient Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Inner Shadow */}
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />

                <div className="relative p-12 z-10">
                  <motion.div
                    className="flex items-center gap-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.span
                      className="px-4 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-full text-sm font-bold text-primary uppercase tracking-wider shadow-lg"
                      whileHover={{ scale: 1.05 }}
                    >
                      ✨ Featured
                    </motion.span>
                    <span className="px-3 py-1 bg-muted/80 rounded-full text-xs font-medium text-muted-foreground border border-border/50">
                      {featuredPost.category}
                    </span>
                  </motion.div>

                  <motion.h3
                    className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {featuredPost.title}
                  </motion.h3>

                  <motion.p
                    className="text-muted-foreground text-lg mb-8 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {featuredPost.excerpt}
                  </motion.p>

                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                    <motion.div
                      className="flex items-center gap-3 text-primary font-medium bg-primary/5 px-4 py-2 rounded-full border border-primary/20"
                      whileHover={{ x: 5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Bottom gradient accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </motion.div>
          )}

          {/* Regular Posts */}
          <div className="space-y-8">
            {regularPosts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group relative"
                style={{ perspective: '1000px' }}
              >
                {/* Premium 3D Regular Post Card */}
                <motion.div
                  className="relative bg-card border border-border/50 rounded-2xl overflow-hidden"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                  }}
                  whileHover={{
                    rotateY: index % 2 === 0 ? 2 : -2,
                    rotateX: 1,
                    scale: 1.02,
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Inner Shadow */}
                  <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />

                  <Link href={`/blog/${post.slug}`} className="block relative z-10 p-6">
                    <motion.div
                      className="flex items-center gap-2 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full text-xs font-medium text-primary shadow-sm">
                        {post.category}
                      </span>
                    </motion.div>

                    <motion.h4
                      className="text-xl font-bold text-foreground mb-3 leading-tight"
                      whileHover={{ x: 2, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {post.title}
                    </motion.h4>

                    <motion.p
                      className="text-muted-foreground text-sm mb-4 leading-relaxed"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {post.excerpt}
                    </motion.p>

                    <motion.div
                      className="flex items-center justify-between text-xs text-muted-foreground"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{post.date}</span>
                        <span className="text-primary/50">•</span>
                        <span className="font-medium">{post.readTime}</span>
                      </div>
                      <motion.div
                        className="p-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                        whileHover={{ x: 3, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </motion.div>
                    </motion.div>
                  </Link>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/blog" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all group">
            <span>View All Articles</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;

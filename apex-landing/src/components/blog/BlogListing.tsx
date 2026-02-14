'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Users, Filter, Search } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

interface BlogListingProps {
  posts: BlogPost[];
  categories: string[];
  currentCategory?: string;
  currentPage: number;
}

const categoryIcons = {
  Research: TrendingUp,
  Engineering: Users,
  Product: BookOpen,
  Security: TrendingUp,
  All: BookOpen,
};

export default function BlogListing({
  posts,
  categories,
  currentCategory,
  currentPage
}: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'All');

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const allCategories = categories;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden bg-background">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
              <BookOpen className="w-3 h-3" />
              <span>Knowledge Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Latest Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep dives into AI research, engineering breakthroughs, and the future of intelligent systems.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  {allCategories.map(category => (
                    <option key={`select-${category}`} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {allCategories.map((category, index) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
                const isActive = selectedCategory === category;

                return (
                  <motion.button
                    key={`pill-${category}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-card border border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-24">
        <div className="container px-4 mx-auto">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <motion.div
                      className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
                      style={{
                        perspective: '1000px',
                      }}
                      whileHover={{
                        rotateY: 5,
                        rotateX: 5,
                        scale: 1.05,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      {/* Premium 3D gradient border effect */}
                      <div className="relative p-[1px] bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl">
                        <div className="bg-card rounded-2xl overflow-hidden">

                          {/* Featured Badge with 3D effect */}
                          {post.featured && (
                            <motion.div
                              className="px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-xs font-bold text-center shadow-lg"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              ✨ Featured Article
                            </motion.div>
                          )}

                          {/* Content with premium styling */}
                          <div className="p-6 relative">
                            {/* 3D floating elements */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-xl"></div>
                            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/5 to-primary/5 rounded-full blur-lg"></div>

                            <div className="relative z-10">
                              <motion.div
                                className="flex items-center gap-2 mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full text-xs font-medium text-primary shadow-sm">
                                  {post.category}
                                </span>
                                {post.featured && (
                                  <motion.span
                                    className="px-3 py-1 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-full text-xs font-medium text-primary shadow-sm"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                  >
                                    ⭐ Premium
                                  </motion.span>
                                )}
                              </motion.div>

                              <motion.h2
                                className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-all duration-300 leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                {post.title}
                              </motion.h2>

                              <motion.p
                                className="text-muted-foreground text-sm mb-4 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                {post.excerpt}
                              </motion.p>

                              <motion.div
                                className="flex items-center justify-between text-xs text-muted-foreground mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{post.date}</span>
                                  <span className="text-primary/50">•</span>
                                  <span className="font-medium">{post.readTime}</span>
                                </div>
                              </motion.div>

                              <motion.div
                                className="flex items-center justify-between"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 rounded-full flex items-center justify-center shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <span className="text-primary font-bold text-sm">
                                      {post.author.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </motion.div>
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{post.author.name}</div>
                                    <div className="text-xs text-muted-foreground font-medium">{post.author.role}</div>
                                  </div>
                                </div>

                                <motion.div
                                  className="p-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full border border-primary/20"
                                  whileHover={{ x: 5 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <ArrowRight className="w-5 h-5 text-primary" />
                                </motion.div>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Load More / Pagination could be added here */}
        </div>
      </section>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief AI Officer & Co-Founder",
      bio: "Former Google DeepMind researcher with 15+ years in machine learning. PhD in Computer Science from MIT.",
      avatar: "SC",
      expertise: ["Machine Learning", "Neural Networks", "AI Ethics"]
    },
    {
      name: "Marcus Rodriguez",
      role: "Chief Technology Officer & Co-Founder",
      bio: "Ex-Meta engineering lead. Built large-scale AI systems serving millions of users daily.",
      avatar: "MR",
      expertise: ["System Architecture", "Distributed Computing", "Performance Optimization"]
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Research",
      bio: "Leading researcher in multimodal AI. Published 50+ papers in top-tier AI conferences.",
      avatar: "EW",
      expertise: ["Multimodal AI", "Computer Vision", "Research"]
    },
    {
      name: "Alex Kumar",
      role: "VP of Engineering",
      bio: "Former Uber engineering director. Expert in building scalable, reliable AI infrastructure.",
      avatar: "AK",
      expertise: ["Software Engineering", "DevOps", "Scalability"]
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're building AI that genuinely helps humanity solve real problems."
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We push the boundaries of what's possible with cutting-edge research."
    },
    {
      icon: Heart,
      title: "Human-Centric",
      description: "Our AI systems are designed with human values and ethics at their core."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "We aim to make advanced AI accessible to everyone, everywhere."
    }
  ];

  const milestones = [
    { year: "2020", title: "Founded Apex AI", description: "Started with a vision to democratize AI" },
    { year: "2021", title: "First Product Launch", description: "Released our initial AI reasoning engine" },
    { year: "2022", title: "Series A Funding", description: "Raised $15M to accelerate development" },
    { year: "2023", title: "1M+ Users", description: "Crossed the million user milestone" },
    { year: "2024", title: "Enterprise Expansion", description: "Launched enterprise-grade solutions" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
              <Users className="w-3 h-3" />
              <span>Our Story</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Building the Future of
              <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Intelligent Systems
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're a team of AI researchers, engineers, and visionaries working to create artificial intelligence
              that understands, learns, and evolves alongside humanity. Our mission is to make advanced AI
              accessible, ethical, and beneficial for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                To accelerate human scientific discovery and technological progress by building AI systems
                that can reason, learn, and collaborate with humans at unprecedented levels. We believe
                that AI should augment human capabilities, not replace them.
              </p>

              <div className="space-y-4">
                {[
                  "Democratize access to advanced AI",
                  "Maintain ethical AI development",
                  "Foster human-AI collaboration",
                  "Drive scientific breakthroughs"
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where AI seamlessly integrates with human creativity and problem-solving,
                    where artificial intelligence serves as a trusted partner in advancing human knowledge
                    and solving the world's most pressing challenges.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape how we build AI for the future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <motion.div
                  className="p-8 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-card/30">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              World-class researchers, engineers, and AI experts working together to build the future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <motion.div
                  className="p-8 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-6">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {member.avatar}
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-4">{member.role}</p>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>

                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill, skillIndex) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From a small research team to a global AI platform serving millions.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="flex items-center gap-8 mb-12"
              >
                <div className="flex-1 text-right">
                  <div className="inline-flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                    <div className="w-4 h-4 bg-primary rounded-full shadow-lg"></div>
                  </div>
                </div>
                <div className="w-px h-16 bg-border"></div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Join Our Mission
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We're always looking for talented individuals who share our passion for building
              ethical, innovative AI systems that benefit humanity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                Get in Touch
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-accent transition-all duration-300 hover:scale-105"
              >
                Read Our Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

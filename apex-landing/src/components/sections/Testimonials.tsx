"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "AI Research Lead",
    company: "TechFlow Labs",
    content: "Apex AI's reasoning capabilities have revolutionized our approach to complex problem-solving. The logic engine is unparalleled.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    company: "InnovateAI",
    content: "The multi-model ecosystem is exactly what we needed. Seamless switching between reasoning and creative tasks.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Dr. Emily Watson",
    role: "Professor",
    company: "Stanford AI",
    content: "Impressive 2M token context window. Finally, an AI that can analyze entire codebases without losing context.",
    rating: 5,
    avatar: "EW"
  },
  {
    name: "Alex Kumar",
    role: "Senior Developer",
    company: "CodeCraft",
    content: "The API is developer-first. Low latency, high throughput. Perfect for production environments.",
    rating: 5,
    avatar: "AK"
  },
  {
    name: "Lisa Zhang",
    role: "Product Manager",
    company: "FutureTech",
    content: "Security and compliance built-in. SOC2 compliance gives us peace of mind for enterprise deployments.",
    rating: 5,
    avatar: "LZ"
  },
  {
    name: "David Park",
    role: "Founder",
    company: "StartupXYZ",
    content: "From hobby project to scaling to millions of requests. Apex AI grew with us.",
    rating: 5,
    avatar: "DP"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 relative bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4"
          >
            <Star className="w-3 h-3 text-primary" />
            <span>User Stories</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Trusted by Innovators
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of developers, researchers, and companies building the future with Apex AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              style={{ perspective: '1000px' }}
            >
              {/* Premium 3D Card Container */}
              <motion.div
                className="relative p-8 rounded-2xl bg-card/50 border border-border/50 overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
                whileHover={{
                  rotateY: index % 2 === 0 ? 3 : -3,
                  rotateX: 2,
                  scale: 1.02,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 25
                }}
              >
                {/* Gradient Background Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Inner Shadow */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

                {/* Content Container */}
                <div className="relative z-10">
                  {/* Quote Icon with Animation */}
                  <motion.div
                    className="mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Quote className="w-8 h-8 text-primary/30" />
                  </motion.div>

                  {/* Stars with Stagger Animation */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-primary text-primary" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <motion.p
                    className="text-muted-foreground leading-relaxed mb-6 text-sm italic"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    "{testimonial.content}"
                  </motion.p>

                  {/* Author Section */}
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <motion.div
                        className="font-bold text-foreground text-sm"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {testimonial.name}
                      </motion.div>
                      <div className="text-xs text-muted-foreground font-medium">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </motion.div>
                </div>

                {/* Subtle bottom accent */}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

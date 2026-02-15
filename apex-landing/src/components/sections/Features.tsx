"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Globe, Rocket, Terminal, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

const features = [
  {
    title: "Logic Engine V3",
    description: "Deep reasoning capabilities that solve complex mathematical and logical problems with over 99.8% accuracy.",
    icon: Brain
  },
  {
    title: "Global Low Latency",
    description: "Distributed infrastructure ensuring sub-millisecond response times for edge computing applications.",
    icon: Zap
  },
  {
    title: "Multi-Model Ecosystem",
    description: "Seamlessly switch between Apex-Logic, Apex-Creative, and Apex-Vision depending on your specific task requirements.",
    icon: Cpu
  },
  {
    title: "Developer First",
    description: "A streaming API designed for high-throughput, mission-critical production environments.",
    icon: Terminal
  },
  {
    title: "Extended Context",
    description: "Industry-leading 2M token context window for analyzing massive datasets and complex codebases.",
    icon: Globe
  },
  {
    title: "Enterprise Security",
    description: "Private VPC deployment options and SOC2 Type II compliance for high-security intelligence needs.",
    icon: Rocket
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4"
          >
            Engineering Excellence
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Engineered for High-Stakes Logic
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Apex AI is built from the ground up for performance, precision, and the next generation of autonomous intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-10 rounded-3xl bg-card/50 border border-border hover:border-primary/20 hover:bg-card/70 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-bold mb-4 text-foreground group-hover:translate-x-1 transition-transform">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/70 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

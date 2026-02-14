"use client";

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Users, Globe, Award, TrendingUp, Shield } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Active Developers",
    description: "Building with Apex AI"
  },
  {
    icon: Zap,
    value: 2,
    suffix: "ms",
    label: "Average Latency",
    description: "Sub-millisecond responses"
  },
  {
    icon: Globe,
    value: 99.9,
    suffix: "%",
    label: "Uptime SLA",
    description: "Enterprise reliability"
  },
  {
    icon: TrendingUp,
    value: 1000000,
    suffix: "+",
    label: "Daily Requests",
    description: "Processed seamlessly"
  },
  {
    icon: Award,
    value: 50,
    suffix: "+",
    label: "Enterprise Clients",
    description: "Fortune 500 companies"
  },
  {
    icon: Shield,
    value: 100,
    suffix: "%",
    label: "SOC2 Compliant",
    description: "Security certified"
  }
];

const AnimatedCounter = ({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="text-3xl md:text-5xl font-bold text-foreground">
      {typeof value === 'number' && value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="py-24 relative bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_25%,rgba(59,130,246,0.1)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.1)_75%)] bg-[length:20px_20px]" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
            <TrendingUp className="w-3 h-3" />
            <span>Platform Metrics</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real numbers from real users. Apex AI delivers on its promises with unmatched performance and reliability.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all group-hover:scale-105">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">
            Trusted by industry leaders and backed by enterprise-grade infrastructure
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">SOC2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Global Infrastructure</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;

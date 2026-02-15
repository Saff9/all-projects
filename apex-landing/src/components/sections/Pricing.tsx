"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: "Hobby",
    price: "Free",
    description: "Perfect for students and early explorers.",
    features: [
      "Apex-Logic-V3 Mini access",
      "1,000 requests / day",
      "Standard latency",
      "Community support"
    ],
    buttonText: "Start Free",
    highlight: false
  },
  {
    name: "Pro",
    price: "$20",
    period: "/mo",
    description: "For power users and solo developers.",
    features: [
      "Full Apex-Logic-V3.2 access",
      "Unlimited requests",
      "Priority inference speed",
      "Advanced Reasoning mode",
      "Early beta features"
    ],
    buttonText: "Upgrade to Pro",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scale your business with dedicated compute.",
    features: [
      "Dedicated model instance",
      "Custom fine-tuning",
      "SLA-backed uptime",
      "Dedicated account manager",
      "On-prem deployment options"
    ],
    buttonText: "Contact Sales",
    highlight: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Transparent Scalability
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Choose the plan that fits your ambition. No hidden fees, just raw intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              style={{ perspective: '1200px' }}
            >
              {/* Premium 3D Card Container */}
              <motion.div
                className={cn(
                  "relative p-10 rounded-[2.5rem] flex flex-col border overflow-hidden",
                  plan.highlight
                    ? "bg-gradient-to-br from-card/40 to-card/20 border-primary/40"
                    : "bg-card/10 border-border/60"
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
                whileHover={{
                  rotateY: plan.highlight ? -2 : 2,
                  rotateX: 2,
                  scale: 1.03,
                  z: 50,
                  boxShadow: plan.highlight
                    ? '0 35px 70px -12px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 25
                }}
              >
                {/* Gradient Overlay */}
                <div className={cn(
                  "absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  plan.highlight
                    ? "bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5"
                    : "bg-gradient-to-br from-primary/3 via-transparent to-purple-500/3"
                )} />

                {/* Inner Shadow for Depth */}
                <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full">

                  {plan.highlight && (
                    <motion.div
                      className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-black rounded-full flex items-center gap-2 tracking-wider uppercase shadow-xl"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </motion.div>
                  )}

                  <div className="mb-8">
                    <motion.h3
                      className="text-xl font-bold mb-4 text-muted-foreground"
                      whileHover={{ scale: 1.02 }}
                    >
                      {plan.name}
                    </motion.h3>
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        className="text-6xl font-bold text-foreground tracking-tighter"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {plan.price}
                      </motion.span>
                      {plan.period && (
                        <span className="text-muted-foreground font-medium text-lg">{plan.period}</span>
                      )}
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground leading-relaxed h-12">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <motion.div
                        key={fIndex}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: fIndex * 0.1 }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-primary/30"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </motion.div>
                        <span className="text-foreground/80 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-lg",
                      plan.highlight
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90"
                        : "bg-gradient-to-br from-muted to-muted/80 border border-border/50 text-foreground hover:from-accent hover:to-accent/80"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>

                {/* Bottom accent gradient */}
                <div className={cn(
                  "absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  plan.highlight
                    ? "bg-gradient-to-r from-primary via-purple-500 to-primary"
                    : "bg-gradient-to-r from-primary/50 via-transparent to-primary/50"
                )} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

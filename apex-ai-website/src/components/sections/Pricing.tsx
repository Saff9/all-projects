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
    <section id="pricing" className="py-24 relative bg-black overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl md:text-5xl font-bold tracking-tight text-white"
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
              className={cn(
                "relative p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 border group",
                plan.highlight 
                  ? "bg-white/[0.03] border-white/20 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]" 
                  : "bg-white/[0.01] border-white/5 hover:border-white/10"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[10px] font-black rounded-full flex items-center gap-1.5 tracking-wider uppercase">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-white/60">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                </div>
                <p className="mt-6 text-sm text-muted-foreground leading-relaxed h-12">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/70 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

                <button 
                  type="button"
                  className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn",
                plan.highlight 
                  ? "bg-white text-black hover:bg-white/90" 
                  : "bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08]"
              )}>
                {plan.buttonText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

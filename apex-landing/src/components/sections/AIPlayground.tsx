"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Bot, User, Code, Sparkles, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const messages = [
  { 
    role: 'user', 
    content: 'Can you analyze the efficiency of a recursive Fibonacci function versus an iterative one?' 
  },
  { 
    role: 'bot', 
    thought: 'The user is asking for a comparison between recursive and iterative Fibonacci implementations. I should focus on time and space complexity, specifically O(2^n) for naive recursion vs O(n) for iteration.',
    content: 'Recursive Fibonacci has a time complexity of **O(2ⁿ)**. In contrast, an iterative approach runs in **O(n)** time and **O(1)** space.\n\n```python\ndef fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n```' 
  },
  { 
    role: 'user', 
    content: 'How does Apex AI handle long-context reasoning?' 
  },
  { 
    role: 'bot', 
    thought: 'Explain Dynamic Context Compression and Verification Gates across 1M+ token windows.',
    content: 'Apex AI utilizes **Dynamic Context Compression**. We verify logical state at every 10k token interval, ensuring that reasoning remains consistent even across 1M+ token windows.' 
  }
];

const models = [
  { id: 'logic', name: 'Apex-Logic-V3', color: 'text-blue-500', desc: 'Reasoning' },
  { id: 'creative', name: 'Apex-Creative-Pro', color: 'text-purple-500', desc: 'Generation' },
  { id: 'vision', name: 'Apex-Vision-HD', color: 'text-emerald-500', desc: 'Multimodal' }
];

const AIPlayground = () => {
  const [activeMessage, setActiveMessage] = useState(0);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isTyping, setIsTyping] = useState(false);

  const nextMessage = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      setActiveMessage((prev) => (prev + 1) % messages.length);
      setIsTyping(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextMessage, 8000);
    return () => clearInterval(timer);
  }, [nextMessage]);

  return (
    <section id="playground" className="py-24 relative overflow-hidden bg-background">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-foreground/60 mb-6">
              <Terminal className="w-3 h-3 text-foreground" />
              <span>Multi-Model Intelligence</span>
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              The ecosystem for specialized AI
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Switch between specialized models for reasoning, creative writing, or high-fidelity vision tasks. Apex AI provides the right tool for every challenge.
            </p>
            
            <div className="grid grid-cols-1 gap-4 mb-8" role="tablist" aria-label="AI Models">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  role="tab"
                  aria-selected={selectedModel.id === model.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                    selectedModel.id === model.id 
                      ? "bg-foreground/[0.05] border-foreground/10 ring-1 ring-foreground/5 shadow-lg" 
                      : "bg-foreground/[0.02] border-foreground/5 hover:border-foreground/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full", model.color.replace('text-', 'bg-'))} />
                    <div>
                      <div className="text-sm font-bold text-foreground">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.desc}</div>
                    </div>
                  </div>
                  {selectedModel.id === model.id && (
                    <motion.div layoutId="active-model" className="text-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Sparkles, title: "Self-Correction" },
                { icon: Code, title: "Polyglot Coding" },
                { icon: Search, title: "Deep Research" },
                { icon: ChevronRight, title: "Fast Inference" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass">
                  <item.icon className="w-4 h-4 text-foreground/40" />
                  <span className="text-xs font-medium text-foreground/60">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-foreground/5 bg-card dark:bg-[#080808]">
              <div className="flex flex-col h-[600px]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-foreground/5 flex items-center justify-between bg-foreground/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                      <Bot className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{selectedModel.name}</div>
                      <div className="text-[10px] text-green-600 dark:text-green-500 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        System Online
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-4"
                      >
                        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-foreground/80" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-foreground/40 mb-1">{selectedModel.name}</div>
                          <div className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl rounded-tl-none p-4">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-1">
                                <motion.div
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="w-2 h-2 bg-primary rounded-full"
                                />
                                <motion.div
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                  className="w-2 h-2 bg-primary rounded-full"
                                />
                                <motion.div
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                  className="w-2 h-2 bg-primary rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedModel.id}-${activeMessage}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      {messages[activeMessage].role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="bg-foreground/[0.08] dark:bg-foreground/[0.1] border border-foreground/10 rounded-2xl rounded-tr-none p-4 max-w-[85%]">
                            <div className="text-xs font-medium text-foreground/40 mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" /> You
                            </div>
                            <div className="text-sm text-foreground/90">
                              {messages[activeMessage].content}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="bg-foreground/[0.03] border-l-2 border-primary/40 ml-4 p-4 rounded-r-xl">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-foreground/40 mb-2 flex items-center gap-2">
                              <Terminal className="w-3 h-3 text-primary" /> Chain of Thought
                            </div>
                            <div className="text-xs text-foreground/60 italic leading-relaxed">
                              {messages[activeMessage].thought}
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4 text-foreground/80" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-foreground/40 mb-1">{selectedModel.name}</div>
                              <div className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl rounded-tl-none p-4 text-sm text-foreground/90 leading-relaxed font-mono whitespace-pre-wrap">
                                {messages[activeMessage].content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="p-4 bg-foreground/[0.01] border-t border-foreground/5">
                  <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-foreground/10 group focus-within:border-primary/50 transition-all shadow-sm">
                    <input 
                      type="text"
                      placeholder={`Ask ${selectedModel.name} anything...`}
                      className="bg-transparent border-none outline-none text-sm text-foreground flex-1 placeholder:text-foreground/30"
                      aria-label={`Chat with ${selectedModel.name}`}
                    />
                    <button type="button" aria-label="Send Message" className="hover:scale-110 transition-transform">
                      <Send className="w-4 h-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIPlayground;

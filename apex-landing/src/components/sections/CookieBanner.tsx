"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("genzai-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type: string) => {
    localStorage.setItem("genzai-cookie-consent", type);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[200]"
        >
          <div className="p-6 rounded-[2rem] shadow-2xl border border-border bg-background/80 backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-foreground font-bold text-sm">Privacy & Logic</h4>
                  <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Apex AI uses cookies to optimize your reasoning experience. By continuing, you agree to our processing of data for performance and security.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleConsent('all')}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => handleConsent('necessary')}
                    className="flex-1 py-2.5 bg-muted border border-border text-foreground rounded-xl text-xs font-bold hover:bg-accent transition-all"
                  >
                    Necessary Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

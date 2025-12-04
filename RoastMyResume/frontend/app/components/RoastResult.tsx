"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Share2, Lock, Sparkles, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SocialShareModal } from "./SocialShareModal";

interface RoastResultProps {
  roast: string;
  glow_up: string;
  ats_rewrite?: string;
  intensity: "mild" | "spicy";
  isPro: boolean;
  resumeText: string;
}

export function RoastResult({
  roast,
  glow_up,
  ats_rewrite,
  intensity,
  isPro,
  resumeText,
}: RoastResultProps) {
  const [activeTab, setActiveTab] = useState("roast");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkedTips, setCheckedTips] = useState<Record<number, boolean>>({});

  const handleCopy = async () => {
    let textToCopy = `🔥 RoastMyResume - ${intensity === "spicy" ? "Spicy" : "Mild"} Roast\n\n`;
    
    if (activeTab === "roast") {
      textToCopy += roast;
    } else if (activeTab === "glow-up") {
      textToCopy += glow_up;
    } else {
      textToCopy += ats_rewrite || "";
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Card className="grill-mark-border border-white/10 overflow-hidden rounded-2xl relative shadow-2xl bg-black/60">
        <CardHeader className="border-b border-white/5 py-5 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="font-display text-2xl md:text-3xl flex items-center gap-2 text-white">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              Your Custom Resume Roast
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-4 rounded-lg border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white">
                {copied ? (
                  <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-400" /> Copied!</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="h-4 w-4" /> Copy Text</span>
                )}
              </Button>
              <Button size="sm" onClick={() => setShareModalOpen(true)} className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/10">
                <Share2 className="h-4 w-4 mr-2" />
                Share Card
              </Button>
              <SocialShareModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                roast={roast}
                glowUp={glow_up}
                intensity={intensity}
                isPro={isPro}
                resumeText={resumeText}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="roast" className="rounded-lg py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                🔥 The Roast
              </TabsTrigger>
              <TabsTrigger value="glow-up" className="rounded-lg py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                ✨ Glow-Up Tips
              </TabsTrigger>
              <TabsTrigger value="ats" className="rounded-lg py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                📄 ATS Rewrite
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="roast" key="roast" className="mt-0 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 text-left font-serif text-lg leading-relaxed text-white/90 whitespace-pre-wrap pl-1 border-l-2 border-primary/20 md:pl-4"
                >
                  {roast.split("\n\n").map((para, idx) => (
                    <p key={idx} className="mb-4">{para}</p>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="glow-up" key="glow-up" className="mt-0 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Progress Bar Header */}
                  {(() => {
                    const tipsList = glow_up.split("\n").filter(line => line.trim());
                    const parsedTips = tipsList.map(t => t.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim());
                    const checkedCount = Object.values(checkedTips).filter(Boolean).length;
                    const totalTips = parsedTips.length || 5;
                    const progressPercent = Math.round((checkedCount / totalTips) * 100);
                    
                    const progressDescription = progressPercent === 100 
                      ? "🛡️ BULLETPROOF RESUME - 100% SAVED!" 
                      : progressPercent >= 60 
                        ? "✨ LOOKING SHARP - Optimized" 
                        : progressPercent >= 20 
                          ? "📈 SURVIVING - Optimizing..." 
                          : "🔥 EGO DESTROYED - 0% Optimized";

                    return (
                      <div className="space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted-foreground uppercase">Optimization Completeness</span>
                          <span className="text-primary font-bold">{progressDescription}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 text-primary text-sm font-mono uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 animate-spin-slow" /> Click items to mark as updated in your resume
                  </div>
                  <div className="grid gap-4 md:grid-cols-1">
                    {glow_up.split("\n").filter(line => line.trim()).map((tip, idx) => {
                      const cleanTip = tip.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim();
                      const isChecked = !!checkedTips[idx];
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setCheckedTips(prev => ({
                              ...prev,
                              [idx]: !prev[idx]
                            }));
                          }}
                          className={`glass-card rounded-xl p-4 flex gap-4 items-start border cursor-pointer select-none transition-all ${
                            isChecked 
                              ? "border-emerald-500/20 bg-emerald-500/[0.02] opacity-75" 
                              : "border-white/5 hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isChecked 
                              ? "bg-emerald-500 border-emerald-500 text-black" 
                              : "border-white/20"
                          }`}>
                            {isChecked && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-sm md:text-base leading-relaxed transition-all ${
                            isChecked 
                              ? "line-through text-muted-foreground/60" 
                              : "text-white/90"
                          }`}>
                            {cleanTip}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="ats" key="ats" className="mt-0 outline-none">
                {!isPro ? (
                  <div className="glass-card border border-dashed border-white/10 rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto space-y-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-pulse">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Unlock ATS Optimization</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                        Upgrade to RoastMyResume Pro to access custom, high-impact bullet points rewritten 
                        by AI to fly past automated resume parsers.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button onClick={() => {
                        // Click the header upgrade button or scroll up
                        const btn = document.querySelector("header button");
                        if (btn) (btn as HTMLButtonElement).click();
                      }} className="px-6 h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl">
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-primary text-sm font-mono uppercase tracking-wider">
                      <FileText className="h-4 w-4" /> Optimized Bullet Points
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 md:p-6 text-left">
                      <p className="font-mono text-sm text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
                        {ats_rewrite}
                      </p>
                    </div>
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const handleGetStarted = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Grids and Spots */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none z-0" />
      <div className="glow-spot-orange top-[-100px] left-[5%] animate-soft-pulse" />
      <div className="glow-spot-red top-[300px] right-[10%] opacity-80" />
      <div className="glow-spot-orange bottom-[-100px] left-[30%] opacity-50" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce">🔥</span>
            <span className="text-xl font-bold font-display tracking-tight text-white">
              RoastMy<span className="text-primary">Resume</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#shame" className="hover:text-foreground transition-colors">Hall of Shame</a>
          </nav>
          <div>
            <Button onClick={handleGetStarted} variant="outline" className="border-primary/30 hover:border-primary/80 text-sm">
              Launch App <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium">
            <Flame className="h-3 w-3" /> Get Roasted. Get Hired.
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black font-display tracking-tight leading-tight">
            Destroy Your Resume.<br />
            <span className="text-fire-gradient">Save Your Career.</span>
          </h1>

          <div className="h-20 max-w-2xl mx-auto">
            <TypingAnimation />
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-sans font-light leading-relaxed">
            Upload your resume and get brutally funny, ego-bruising roasts from our AI stand-up comedian 
            that secretly bundle **real, raw career and ATS optimizations** to double your callbacks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button onClick={handleGetStarted} size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/25 rounded-full w-full sm:w-auto">
              Get Roasted Now (Free)
            </Button>
            <a href="#pricing" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full border border-white/5 hover:bg-white/5 w-full">
                View Pro Perks
              </Button>
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-8 text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Over <strong>5,000+</strong> egos crushed & glowed up</span>
          </div>
        </motion.div>
      </section>

      {/* Interactive Mock Roast Card Section */}
      <section className="relative z-10 container mx-auto px-6 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grill-mark-border rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-primary font-mono">ROAST_SYSTEM_v1.0.5</span>
          </div>

          <div className="space-y-4 text-left font-mono text-sm leading-relaxed">
            <p className="text-muted-foreground">// INPUT: Software Engineer Resume</p>
            <p className="text-white">
              <span className="text-primary font-bold">AI_ROAST:</span> "Your experience reads like a tragic diary of someone who copy-pasted StackOverflow answers until the compiler gave up. You put 'Self-starter' but your longest tenure is 4 months. The only thing you started was recruitment cycles."
            </p>
            <p className="text-primary">// GLOW_UP_ADVICE:</p>
            <ul className="list-disc list-inside text-emerald-400 pl-2 space-y-1">
              <li>Quantify impact: Replace 'Worked on React' with 'Improved render speeds by 40%'.</li>
              <li>Remove generic buzzwords ('team player', 'hard worker').</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24 border-t border-white/5 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight">Features That Hurt (Good)</h2>
          <p className="text-muted-foreground">Comedic gold on the surface, gold-standard career acceleration underneath.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="🎭"
            title="Brutal Comedy Roast"
            description="Get roasted by a stand-up comedian bot. We tear down your formatting, buzzwords, and exaggerated accomplishments."
          />
          <FeatureCard
            icon="✨"
            title="Actionable Glow-Up Tips"
            description="Behind the laugh is actual, high-quality feedback to restructure your resume for maximum impact."
          />
          <FeatureCard
            icon="📊"
            title="ATS Optimization"
            description="Pro users get instant alternative bullet points tailored to bypass automated Applicant Tracking Systems."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 container mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight">Flexible Plans</h2>
          <p className="text-muted-foreground">Upgrade whenever you want to unlock unlimited power.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Free Tier"
            price="$0"
            period=""
            features={[
              "1 Roast per day",
              "Gently Roasted (Mild intensity)",
              "Savage Comedic Feedback",
              "Basic Glow-Up Advice",
              "Watermarked shareable cards",
            ]}
            cta="Get Started Free"
            popular={false}
          />
          <PricingCard
            title="Pro Tier"
            price="$9.99"
            period="/mo"
            features={[
              "Unlimited daily roasts",
              "Unlock Spicy (Destroy Me) intensity",
              "Full ATS Rewrite optimizations",
              "Watermark-free high-res social cards",
              "Priority support & early beta access",
            ]}
            cta="Unlock Pro Power"
            popular={true}
          />
        </div>
      </section>

      {/* Hall of Shame */}
      <section id="shame" className="relative z-10 container mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight">🏆 Hall of Shame</h2>
          <p className="text-muted-foreground">Real roasts served to real brave souls.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <HallOfShameCard
            quote="You listed 'Microsoft Office' as a core technical skill in 2026? Do you also want us to congratulate you on your ability to breathe oxygen?"
            intensity="Mild 🌶️"
          />
          <HallOfShameCard
            quote="Your 'leadership skills' section says 'I led a team of 4 once and they didn't mutiny.' That is the bare minimum, Karen. That's not leadership, that's basic human hostage negation."
            intensity="Spicy 🔥"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-20 bg-black/40">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground space-y-4">
          <div className="flex items-center justify-center gap-2 text-white font-bold font-display">
            <span>🔥 RoastMyResume</span>
          </div>
          <p>© 2026 RoastMyResume. Built for world-class builders.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TypingAnimation() {
  const texts = [
    "Your resume is about to get destroyed (lovingly).",
    "Prepare for emotional damage (that gets you interviews).",
    "Where overinflated egos come to die, and careers thrive.",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useState(() => {
    const currentText = texts[currentIndex];
    
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 40 : 80
    );

    return () => clearTimeout(timeout);
  });

  return (
    <p className="text-2xl md:text-3xl font-medium tracking-tight h-16 flex items-center justify-center text-primary/95">
      {displayedText}
      <span className="animate-ping ml-1 text-primary">|</span>
    </p>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="glass-card rounded-2xl p-8 text-left space-y-4 hover:bg-white/[0.04]"
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  popular,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl p-8 text-left relative flex flex-col justify-between h-full ${
        popular
          ? "grill-mark-border"
          : "glass-card"
      }`}
    >
      <div>
        {popular && (
          <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 tracking-wide shadow-md shadow-primary/20 animate-pulse">
            MOST POPULAR
          </div>
        )}
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-5xl font-black text-white">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        <ul className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/dashboard" className="w-full">
        <Button className="w-full h-12 rounded-xl text-base font-medium transition-all" variant={popular ? "default" : "outline"}>
          {cta}
        </Button>
      </Link>
    </motion.div>
  );
}

function HallOfShameCard({ quote, intensity }: { quote: string; intensity: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 text-left border border-white/5 flex flex-col justify-between hover:bg-white/[0.04]">
      <p className="font-serif text-lg italic text-white/90 mb-4">"{quote}"</p>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
          {intensity}
        </span>
      </div>
    </div>
  );
}

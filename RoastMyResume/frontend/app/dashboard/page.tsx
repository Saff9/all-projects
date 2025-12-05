"use client";

import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { fetchUserTier } from "../actions/user";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { RoastResult } from "@/components/RoastResult";
import { Flame, LogOut, ShieldAlert, Sparkles, User, Zap, Cpu } from "lucide-react";
import Link from "next/link";
import { sfx } from "../lib/sound";

export default function Dashboard() {
  const { data: sessionData, isPending } = authClient.useSession();
  const session = sessionData;
  
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [intensity, setIntensity] = useState<"mild" | "spicy">("mild");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    glow_up: string;
    ats_rewrite?: string;
    intensity: "mild" | "spicy";
  } | null>(null);

  // Dynamically load user's subscription tier from Neon DB when session is ready
  useEffect(() => {
    if (session?.user) {
      fetchUserTier(session.user.id, session.user.email, session.user.name).then((tier) => {
        setUserTier(tier as "free" | "pro");
      });
    }
  }, [session]);

  const handleFileLoaded = (text: string, name: string) => {
    setResumeText(text);
    setFileName(name);
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/dashboard",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google.");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!resumeText) return;
    if (!session) {
      await handleSignIn();
      return;
    }

    sfx.playWhoosh();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          intensity,
          user_id: session.user.id,
          tier: userTier,
        }),
      });

      if (response.status === 429) {
        setError("🚫 Daily limit reached! Free users are limited to 1 roast/day. Upgrade to Pro for unlimited roasts.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate roast");
      }

      const data = await response.json();
      setRoastResult({
        ...data,
        intensity // save actual used intensity
      });
      sfx.playSizzle();
    } catch (err) {
      console.error("Roast error:", err);
      setError("Failed to connect to the roaster API. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!session) {
      await handleSignIn();
      return;
    }

    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay payment gateway. Please check your internet connection.");
        return;
      }

      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RoastMyResume Pro",
        description: "Unlimited roasts, Glow-Up reports, and watermark-free images",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: session.user.id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment successful! Your account has been upgraded to Pro! 🔥");
              // Re-fetch user tier from DB
              const updatedTier = await fetchUserTier(session.user.id);
              setUserTier(updatedTier as "free" | "pro");
            } else {
              alert("Payment verification failed: " + verifyData.error);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment");
          }
        },
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
        },
        theme: {
          color: "#f97316",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Failed to initiate upgrade payment");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
          <p className="text-sm font-mono text-primary/80 animate-pulse">BOOTING_ROASTER_SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col justify-between">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none z-0" />
      <div className="glow-spot-orange top-[-150px] right-[5%] opacity-40 animate-soft-pulse" />
      <div className="glow-spot-red bottom-[-150px] left-[5%] opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-background/40 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="text-2xl">🔥</span>
            <span className="font-bold font-display text-lg tracking-tight text-white">
              RoastMy<span className="text-primary">Resume</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-white/95 font-medium">{session.user?.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center justify-end gap-1">
                    {userTier === "pro" ? (
                      <span className="text-primary font-bold">⭐ PRO PLAN</span>
                    ) : (
                      <span>FREE PLAN</span>
                    )}
                  </span>
                </div>

                {userTier === "free" && (
                  <Button onClick={handleUpgrade} size="sm" className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-medium text-xs rounded-lg shadow-md shadow-primary/10 transition-all">
                    Upgrade to Pro
                  </Button>
                )}

                <Button onClick={handleSignOut} variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white" title="Sign Out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} size="sm" className="h-9 px-4 text-xs font-semibold rounded-lg">
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!roastResult ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-xs text-muted-foreground font-mono">
                  <Cpu className="h-3.5 w-3.5 text-primary" /> SYSTEM_ONLINE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-white">Upload Your Resume</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  We parse PDF & DOCX client-side. Your resume data is never saved on our servers.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <FileUploader onFileLoaded={handleFileLoaded} onError={handleError} />

                {/* Intensity Selector */}
                {resumeText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-6 pt-6 border-t border-white/5 mt-6"
                  >
                    <div className="text-center space-y-3">
                      <p className="text-sm font-medium text-white/90">Select Roast Intensity Level:</p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant={intensity === "mild" ? "default" : "outline"}
                          onClick={() => setIntensity("mild")}
                          className={`h-11 px-6 rounded-xl flex items-center gap-2 border transition-all ${
                            intensity === "mild" 
                              ? "bg-orange-600 hover:bg-orange-600/90 text-white border-orange-500 shadow-md shadow-orange-500/20" 
                              : "border-white/5 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          🌶️ Mild Roast
                        </Button>
                        <Button
                          variant={intensity === "spicy" ? "default" : "outline"}
                          onClick={() => {
                            if (userTier !== "pro") {
                              alert("🔒 Spicy mode is locked for Free users! Please upgrade to Pro to unlock Spicy mode.");
                              return;
                            }
                            setIntensity("spicy");
                          }}
                          className={`h-11 px-6 rounded-xl flex items-center gap-2 border transition-all ${
                            intensity === "spicy" 
                              ? "bg-red-600 hover:bg-red-600/90 text-white border-red-500 shadow-md shadow-red-500/20" 
                              : "border-white/5 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          🔥 Spicy (Destroy Me) {userTier !== "pro" && "🔒"}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-13 text-base font-medium rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/10 flex items-center justify-center"
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>AI IS DESTROYING YOUR EGO...</span>
                        </span>
                      ) : !session ? (
                        "Sign in with Google to Roast"
                      ) : (
                        <span className="flex items-center gap-2">
                          <Flame className="h-5 w-5 animate-pulse" /> Roast My Resume!
                        </span>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 font-mono max-w-xl mx-auto"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="max-w-4xl mx-auto mb-6 flex justify-start">
                <Button onClick={() => setRoastResult(null)} variant="ghost" size="sm" className="hover:bg-white/5 text-muted-foreground hover:text-white">
                  ← Roast Another Resume
                </Button>
              </div>
              <RoastResult
                roast={roastResult.roast}
                glow_up={roastResult.glow_up}
                ats_rewrite={roastResult.ats_rewrite}
                intensity={roastResult.intensity}
                isPro={userTier === "pro"}
                resumeText={resumeText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 bg-black/20">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground">
          <p>© 2026 RoastMyResume. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import { jwtVerify } from "jose";
import { notFound } from "next/navigation";

interface SharePayload {
  roast: string;
  glow_up: string;
  ats_rewrite?: string;
  intensity: string;
  created_at: number;
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const secret = new TextEncoder().encode(process.env.SHARE_JWT_SECRET || "fallback-secret-min-32-chars!");
  
  let payload: SharePayload | null = null;
  
  try {
    const { payload: verifiedPayload } = await jwtVerify(params.token, secret);
    payload = verifiedPayload as unknown as SharePayload;
  } catch (error) {
    // If verification fails, try basic decode for display purposes
    try {
      const base64Url = params.token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      payload = JSON.parse(jsonPayload);
    } catch {
      notFound();
    }
  }
  
  if (!payload) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-muted py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl font-bold">RoastMyResume</h1>
          </div>
          <a href="/">
            <span className="text-sm text-primary hover:underline">Roast Your Own</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Intensity Badge */}
          <div className="text-center">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              payload.intensity === "spicy" 
                ? "bg-red-500/20 text-red-400" 
                : "bg-orange-500/20 text-orange-400"
            }`}>
              {payload.intensity === "spicy" ? "🔥 Spicy Roast" : "🌶️ Mild Roast"}
            </span>
          </div>

          {/* The Roast */}
          <div className="grill-mark-border glass-card rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🔥</span> The Roast
            </h2>
            <div className="font-serif text-lg leading-relaxed space-y-4">
              {payload.roast.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Glow-Up Tips */}
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>✨</span> Glow-Up Tips
            </h2>
            <div className="font-sans text-base leading-relaxed space-y-3">
              {payload.glow_up.split("\n").map((tip, i) => (
                <p key={i}>{tip}</p>
              ))}
            </div>
          </div>

          {/* ATS Rewrite (if available) */}
          {payload.ats_rewrite && (
            <div className="glass-card rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>📊</span> ATS Rewrite
              </h2>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {payload.ats_rewrite}
                </pre>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Roasted?</h3>
            <p className="text-muted-foreground mb-6">
              Upload your resume and get hilarious, actionable feedback
            </p>
            <a href="/">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Roast My Resume
              </button>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 RoastMyResume. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

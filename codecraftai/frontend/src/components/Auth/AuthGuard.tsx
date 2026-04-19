import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Lock, ShieldAlert, Terminal, CheckCircle2, LogIn } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore();
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setError(null);

    // Simulate OAuth verification delay
    await new Promise((r) => setTimeout(r, 1200));

    const success = login(emailInput);
    if (!success) {
      setError(`Access Denied: Unauthorized Email (${emailInput}). This enterprise workspace is strictly restricted to saffanakbar942@gmail.com.`);
      setLoading(false);
    }
  };

  const handleOAuthSimulate = async () => {
    setEmailInput("saffanakbar942@gmail.com");
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1000));
    login("saffanakbar942@gmail.com");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 text-white relative overflow-hidden">
      {/* Premium Radial Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-glass border border-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-scale-up z-10">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30 mb-6 animate-pulse">
          <Terminal size={32} />
        </div>

        <h2 className="text-2xl font-bold font-mono tracking-tight mb-2">Code Craft Enterprise</h2>
        <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed font-sans">
          Secure Agentic AI Workspace. Please verify your enterprise email identity to access the multi-provider platform.
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-200 text-xs flex items-start gap-3 animate-fade-in shadow-inner">
            <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed font-mono break-words">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 font-mono">ENTERPRISE EMAIL</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-600 font-mono shadow-inner transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Identity...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Verify Email</span>
              </>
            )}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-[10px] font-bold text-gray-500 font-mono uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Simulating Instant Google OAuth Sign In */}
        <button
          type="button"
          onClick={handleOAuthSimulate}
          disabled={loading}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2.5 mt-4 border border-gray-700 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.3 1 3.4 3.7 1.6 7.6l3.7 2.9C6.2 7.2 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3L1.6 7.3C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.2-6.7-5.5L1.6 15.7C3.4 19.6 7.3 22 12 23z"/>
          </svg>
          <span className="font-mono">Sign in with Google (saffanakbar942@gmail.com)</span>
        </button>

        <div className="mt-8 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <Lock size={12} className="text-green-500" />
          <span>Secured with OAuth 2.0 & AES-GCM Encryption</span>
        </div>
      </div>
    </div>
  );
}

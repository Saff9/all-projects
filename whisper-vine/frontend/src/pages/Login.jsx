import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back to the vine.");
            nav("/dashboard");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Login failed");
        } finally { setLoading(false); }
    };

    return (
        <div data-testid="login-page" className="max-w-md mx-auto px-6 py-20">
            <h1 className="font-display text-5xl uppercase">Step <span className="neon-text">into</span> the dark.</h1>
            <p className="mt-3 text-[#A99BB8]">Owners only. Confessing is anonymous and needs no account.</p>
            <form onSubmit={submit} className="mt-10 space-y-5 noir-panel p-8">
                <div>
                    <label className="label-noir block mb-2">Email</label>
                    <input data-testid="login-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="input-noir" placeholder="you@vine.dark" />
                </div>
                <div>
                    <label className="label-noir block mb-2">Password</label>
                    <input data-testid="login-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="input-noir" placeholder="••••••••" />
                </div>
                <button data-testid="login-submit" disabled={loading} className="btn-neon w-full">{loading ? "Listening..." : "Enter"}</button>
                <p className="text-sm text-[#A99BB8] text-center">No account? <Link to="/signup" className="neon-text underline">Plant a vine →</Link></p>
            </form>
        </div>
    );
}

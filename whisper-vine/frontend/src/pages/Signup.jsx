import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(email, nickname, password);
            toast.success("Vine seed planted.");
            nav("/vines/new");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Sign up failed");
        } finally { setLoading(false); }
    };

    return (
        <div data-testid="signup-page" className="max-w-md mx-auto px-6 py-20">
            <h1 className="font-display text-5xl uppercase">Plant a <span className="neon-text">vine</span>.</h1>
            <p className="mt-3 text-[#A99BB8]">Free forever. Become the curator of a secret garden.</p>
            <form onSubmit={submit} className="mt-10 space-y-5 noir-panel p-8">
                <div>
                    <label className="label-noir block mb-2">Email</label>
                    <input data-testid="signup-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="input-noir" placeholder="you@vine.dark" />
                </div>
                <div>
                    <label className="label-noir block mb-2">Nickname</label>
                    <input data-testid="signup-nickname" value={nickname} onChange={(e)=>setNickname(e.target.value)} required className="input-noir" placeholder="The Curator" />
                </div>
                <div>
                    <label className="label-noir block mb-2">Password</label>
                    <input data-testid="signup-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} className="input-noir" placeholder="min 6 chars" />
                </div>
                <button data-testid="signup-submit" disabled={loading} className="btn-neon w-full">{loading ? "Sprouting..." : "Plant my vine"}</button>
                <p className="text-sm text-[#A99BB8] text-center">Already a curator? <Link to="/login" className="neon-text underline">Login →</Link></p>
            </form>
        </div>
    );
}

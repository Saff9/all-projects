import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    return (
        <nav data-testid="main-navbar" className="sticky top-0 z-50 border-b-2 border-[#2E1645] bg-[#09030E]/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" data-testid="brand-link" className="flex items-center gap-3">
                    <span className="inline-block w-3 h-3 bg-neon shadow-[0_0_12px_#39FF14]" />
                    <span className="font-display text-2xl tracking-tight uppercase">Whisper<span className="neon-text">Vine</span></span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link to="/discover" data-testid="nav-discover" className="hidden sm:inline label-noir hover:text-neon">Discover</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" data-testid="nav-dashboard" className="label-noir hover:text-neon">Dashboard</Link>
                            <Link to="/vines/new" data-testid="nav-create-vine" className="btn-neon !py-2 !px-4 text-sm">+ New Vine</Link>
                            <button data-testid="nav-logout" onClick={() => { logout(); nav("/"); }} className="label-noir hover:text-magenta">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" data-testid="nav-login" className="label-noir hover:text-neon">Login</Link>
                            <Link to="/signup" data-testid="nav-signup" className="btn-neon !py-2 !px-4 text-sm">Join</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

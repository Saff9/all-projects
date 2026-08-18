import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import CreateVine from "@/pages/CreateVine";
import VineFeed from "@/pages/VineFeed";
import Dashboard from "@/pages/Dashboard";
import VineCards from "@/pages/VineCards";
import Discover from "@/pages/Discover";

function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="max-w-7xl mx-auto px-6 py-16 label-noir">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function Footer() {
    return (
        <footer className="border-t-2 border-[#2E1645] mt-16">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <span className="font-display text-2xl uppercase">Whisper<span className="neon-text">Vine</span></span>
                    <p className="text-xs text-[#6C597E] mt-2">Anonymous. Anti-fragile. Graphic-novella-coded.</p>
                </div>
                <p className="text-xs text-[#6C597E]">© 2026 — built in the dark.</p>
            </div>
        </footer>
    );
}

export default function App() {
    return (
        <div className="App min-h-screen">
            <AuthProvider>
                <BrowserRouter>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/v/:slug" element={<VineFeed />} />
                        <Route path="/v/:slug/cards" element={<VineCards />} />
                        <Route path="/vines/new" element={<Protected><CreateVine /></Protected>} />
                        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                    </Routes>
                    <Footer />
                    <Toaster richColors position="top-right" theme="dark" />
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

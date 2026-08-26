import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("wv_token");
        if (!token) { setLoading(false); return; }
        api.get("/auth/me")
            .then((r) => setUser(r.data))
            .catch(() => localStorage.removeItem("wv_token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("wv_token", data.access_token);
        setUser(data.user);
        return data.user;
    };
    const signup = async (email, nickname, password) => {
        const { data } = await api.post("/auth/signup", { email, nickname, password });
        localStorage.setItem("wv_token", data.access_token);
        setUser(data.user);
        return data.user;
    };
    const logout = () => { localStorage.removeItem("wv_token"); setUser(null); };

    return (
        <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() { return useContext(AuthCtx); }

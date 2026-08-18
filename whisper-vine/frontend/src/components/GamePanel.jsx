import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function GamePanel({ slug }) {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get(`/games/${slug}/active`);
            setGame(data);
        } catch (e) { setGame(null); }
        finally { setLoading(false); }
    }, [slug]);

    useEffect(() => {
        load();
        const t = setInterval(load, 12000);
        return () => clearInterval(t);
    }, [load]);

    const vote = async (option) => {
        if (!game?.game?.id || game.has_voted) return;
        setVoting(true);
        try {
            const { data } = await api.post(`/games/${game.game.id}/vote`, { option });
            setGame(data);
            toast.success("Vote cast.");
        } catch (err) {
            const detail = err?.response?.data?.detail;
            toast.error(detail || "Vote failed");
            if (err?.response?.status === 409) load();
        } finally { setVoting(false); }
    };

    if (loading) return null;
    if (!game) {
        return (
            <div data-testid="game-panel-empty" className="noir-panel p-6">
                <span className="label-noir text-magenta">Game · idle</span>
                <p className="font-display text-xl uppercase mt-2">No active round.</p>
                <p className="text-xs text-[#A99BB8] mt-1">Owners can spin one up from the dashboard.</p>
            </div>
        );
    }

    const { game: gs, votes_a, votes_b, pct_a, pct_b, has_voted } = game;
    return (
        <div data-testid="game-panel" className="noir-panel p-6">
            <div className="flex items-center justify-between mb-3">
                <span className="label-noir text-neon">{gs.game_type === "would_you_rather" ? "Would you rather" : "Unpopular opinion"}</span>
                <span className="text-xs text-[#6C597E]">live</span>
            </div>
            <p className="font-display text-2xl uppercase leading-tight">{gs.question}</p>
            <div className="mt-5 space-y-3">
                <button
                    data-testid="vote-a"
                    disabled={has_voted || voting}
                    onClick={() => vote("a")}
                    className={`w-full text-left relative overflow-hidden border-2 ${has_voted ? "border-neon" : "border-[#2E1645] hover:border-neon"} bg-[#0d0517] p-4 group disabled:opacity-90 disabled:cursor-default`}>
                    {has_voted && (
                        <div className="absolute inset-y-0 left-0 bg-neon/20 animate-bargrow" style={{ "--target-width": `${pct_a}%` }} />
                    )}
                    <div className="relative flex items-center justify-between">
                        <span className="font-mono-vine">{gs.option_a}</span>
                        {has_voted && <span className="font-display text-2xl neon-text">{pct_a}%</span>}
                    </div>
                </button>
                <button
                    data-testid="vote-b"
                    disabled={has_voted || voting}
                    onClick={() => vote("b")}
                    className={`w-full text-left relative overflow-hidden border-2 ${has_voted ? "border-magenta" : "border-[#2E1645] hover:border-magenta"} bg-[#0d0517] p-4 group disabled:opacity-90 disabled:cursor-default`}>
                    {has_voted && (
                        <div className="absolute inset-y-0 left-0 bg-magenta/20 animate-bargrow" style={{ "--target-width": `${pct_b}%` }} />
                    )}
                    <div className="relative flex items-center justify-between">
                        <span className="font-mono-vine">{gs.option_b}</span>
                        {has_voted && <span className="font-display text-2xl magenta-text">{pct_b}%</span>}
                    </div>
                </button>
            </div>
            {has_voted && (
                <div className="mt-3 flex justify-between text-xs label-noir">
                    <span>{votes_a + votes_b} total votes</span>
                    <span className="text-[#6C597E]">ends {new Date(gs.end_time).toLocaleString()}</span>
                </div>
            )}
        </div>
    );
}

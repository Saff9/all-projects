import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Dashboard() {
    const { user } = useAuth();
    const [vines, setVines] = useState([]);
    const [selected, setSelected] = useState(null);
    const [stats, setStats] = useState(null);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/vines").then(r => {
            setVines(r.data);
            if (r.data.length > 0) setSelected(r.data[0]);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selected) return;
        Promise.all([
            api.get(`/dashboard/${selected.id}`).then(r => setStats(r.data)),
            api.get(`/confessions/admin/${selected.id}/queue`).then(r => setQueue(r.data)).catch(() => setQueue([])),
        ]);
    }, [selected]);

    const startGame = async (gameType) => {
        try {
            await api.post(`/games/${selected.id}/start?game_type=${gameType}`);
            toast.success("Game started.");
        } catch (e) { toast.error(e?.response?.data?.detail || "Could not start game"); }
    };

    const moderate = async (id, action) => {
        try {
            await api.post(`/confessions/admin/${id}/${action}`);
            setQueue(queue.filter(c => c.id !== id));
            toast.success(`${action === "approve" ? "Approved" : "Rejected"}.`);
        } catch (e) { toast.error("Failed"); }
    };

    const generateCard = async (confessionId) => {
        toast.info("Conjuring card…");
        try {
            const { data } = await api.post(`/cards/generate`, { confession_id: confessionId });
            toast.success("Vine card ready in gallery.");
        } catch (e) { toast.error(e?.response?.data?.detail || "Generation failed"); }
    };

    if (loading) return <div className="max-w-7xl mx-auto px-6 py-16 label-noir">Loading the dark room…</div>;

    if (vines.length === 0) {
        return (
            <div data-testid="dashboard-empty" className="max-w-2xl mx-auto px-6 py-20 text-center">
                <h1 className="font-display text-5xl uppercase">No vines yet.</h1>
                <p className="mt-4 text-[#A99BB8]">Plant your first one — it takes 30 seconds.</p>
                <Link to="/vines/new" className="btn-neon mt-8 inline-block">Create vine</Link>
            </div>
        );
    }

    return (
        <div data-testid="dashboard-page" className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                    <span className="label-noir text-neon">Curator · {user?.nickname}</span>
                    <h1 className="font-display text-4xl sm:text-5xl uppercase">Dashboard</h1>
                </div>
                <Link to="/vines/new" data-testid="dashboard-new-vine" className="btn-ghost-neon">+ New vine</Link>
            </div>

            <div className="mt-8 grid lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-3 noir-panel p-4">
                    <span className="label-noir text-neon">Your vines</span>
                    <ul className="mt-3 space-y-2">
                        {vines.map(v => (
                            <li key={v.id}>
                                <button data-testid={`select-vine-${v.id}`}
                                    onClick={() => setSelected(v)}
                                    className={`w-full text-left p-3 border-2 ${selected?.id===v.id ? "border-neon bg-neon/5" : "border-[#2E1645] hover:border-neon"}`}>
                                    <p className="font-display text-lg uppercase truncate">{v.name}</p>
                                    <p className="text-[10px] text-[#6C597E] uppercase tracking-widest">{v.slug}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="lg:col-span-9 space-y-6">
                    {selected && (
                        <>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h2 className="font-display text-3xl uppercase">{selected.name}</h2>
                                    <p className="text-xs text-[#6C597E]">/v/{selected.slug}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/v/${selected.slug}`} className="btn-ghost-neon !py-2 !px-4 text-sm">View feed</Link>
                                    <Link to={`/v/${selected.slug}/cards`} className="btn-ghost-neon !py-2 !px-4 text-sm">Cards</Link>
                                </div>
                            </div>

                            {stats && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="dashboard-stats">
                                    {[
                                        ["whispers", stats.total_confessions],
                                        ["today", stats.confessions_today],
                                        ["pending", stats.pending_count],
                                        ["games", stats.total_games],
                                    ].map(([label, val]) => (
                                        <div key={label} className="noir-panel p-4">
                                            <p className="label-noir">{label}</p>
                                            <p className="font-display text-4xl neon-text mt-1">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <button data-testid="start-wyr"
                                    onClick={() => startGame("would_you_rather")}
                                    className="noir-panel p-6 text-left noir-panel-hover">
                                    <span className="label-noir text-neon">Trigger now</span>
                                    <p className="font-display text-2xl uppercase mt-1">Would you rather →</p>
                                </button>
                                <button data-testid="start-uo"
                                    onClick={() => startGame("unpopular_opinion")}
                                    className="noir-panel p-6 text-left noir-panel-hover">
                                    <span className="label-noir text-magenta">Trigger now</span>
                                    <p className="font-display text-2xl uppercase mt-1">Unpopular opinion →</p>
                                </button>
                            </div>

                            {queue.length > 0 && (
                                <div className="noir-panel p-6">
                                    <h3 className="font-display text-2xl uppercase">Approval queue ({queue.length})</h3>
                                    <ul className="mt-4 space-y-3">
                                        {queue.map(c => (
                                            <li key={c.id} data-testid={`queue-${c.id}`} className="border-2 border-[#2E1645] p-4 flex flex-col sm:flex-row gap-4 justify-between">
                                                <p className="font-mono-vine flex-1">{c.emoji} {c.content}</p>
                                                <div className="flex gap-2 shrink-0">
                                                    <button data-testid={`approve-${c.id}`} onClick={() => moderate(c.id, "approve")} className="btn-neon !py-2 !px-3 text-xs">Approve</button>
                                                    <button data-testid={`reject-${c.id}`} onClick={() => moderate(c.id, "reject")} className="btn-magenta !py-2 !px-3 text-xs">Reject</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <ApprovedList vineSlug={selected.slug} onMakeCard={generateCard} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function ApprovedList({ vineSlug, onMakeCard }) {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get(`/confessions/${vineSlug}`).then(r => setItems(r.data.slice(0, 12))); }, [vineSlug]);
    if (items.length === 0) return null;
    return (
        <div className="noir-panel p-6">
            <h3 className="font-display text-2xl uppercase">Recent whispers</h3>
            <p className="text-xs text-[#6C597E]">Click "Make card" to turn one into a graphic novella panel.</p>
            <ul className="mt-4 space-y-3">
                {items.map(c => (
                    <li key={c.id} className="border-2 border-[#2E1645] p-4 flex flex-col sm:flex-row gap-4 justify-between">
                        <p className="font-mono-vine flex-1">{c.emoji} {c.content}</p>
                        <button data-testid={`make-card-${c.id}`} onClick={() => onMakeCard(c.id)} className="btn-ghost-neon !py-2 !px-3 text-xs shrink-0">Make card</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import GamePanel from "@/components/GamePanel";

export default function VineFeed() {
    const { slug } = useParams();
    const [vine, setVine] = useState(null);
    const [items, setItems] = useState([]);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [v, c] = await Promise.all([
                api.get(`/vines/${slug}`),
                api.get(`/confessions/${slug}`),
            ]);
            setVine(v.data); setItems(c.data);
        } catch (e) {
            toast.error("Could not load vine.");
        } finally { setLoading(false); }
    }, [slug]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const submit = async (e) => {
        e.preventDefault();
        if (content.trim().length < 2) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/confessions/${slug}`, { content });
            if (data.status === "approved") {
                toast.success(data.message);
                setItems([data.confession, ...items]);
            } else if (data.status === "pending") {
                toast.info(data.message);
            } else {
                toast.error(data.message);
            }
            setContent("");
        } catch (err) {
            const detail = err?.response?.data?.detail || "Something cracked.";
            toast.error(detail);
        } finally { setSubmitting(false); }
    };

    const upvote = async (id) => {
        try {
            const { data } = await api.post(`/confessions/${id}/upvote`);
            setItems(items.map((x) => x.id === id ? data : x));
        } catch (e) { /* ignore */ }
    };

    if (loading) return <div data-testid="vine-loading" className="max-w-7xl mx-auto px-6 py-20 text-center label-noir">Listening...</div>;
    if (!vine) return <div className="max-w-7xl mx-auto px-6 py-20 text-center">Vine not found. <Link to="/discover" className="neon-text underline">Discover →</Link></div>;

    return (
        <div data-testid="vine-feed-page" className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 space-y-6">
                    <div>
                        <span className="label-noir text-neon">Vine · {vine.moderation_strictness}</span>
                        <h1 className="font-display text-4xl sm:text-5xl uppercase mt-2">{vine.name}</h1>
                        <p className="mt-3 text-[#A99BB8]">{vine.description || "A garden of whispers."}</p>
                    </div>

                    <form onSubmit={submit} className="noir-panel p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="label-noir text-neon">Drop a whisper</span>
                            <span className="text-xs text-[#6C597E]">{content.length}/1200</span>
                        </div>
                        <textarea
                            data-testid="confession-input"
                            rows={5}
                            maxLength={1200}
                            placeholder="Speak the unspeakable. Nobody knows it was you."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="input-noir resize-none"
                        />
                        <button data-testid="confession-submit-btn" disabled={submitting || content.trim().length < 2} className="btn-neon w-full">{submitting ? "Whispering…" : "Post anonymously"}</button>
                        <p className="text-[10px] text-[#6C597E] uppercase tracking-widest">No identity stored · 5/min limit · AI moderated</p>
                    </form>

                    <GamePanel slug={slug} />

                    <Link to={`/v/${slug}/cards`} data-testid="link-vine-cards" className="block noir-panel p-6 noir-panel-hover">
                        <span className="label-noir text-neon">Vine Cards →</span>
                        <p className="font-display text-2xl uppercase mt-1">Graphic novella gallery</p>
                    </Link>
                </aside>

                <main className="lg:col-span-8">
                    <div className="flex items-baseline justify-between mb-6">
                        <h2 className="font-display text-2xl uppercase">{items.length} whispers</h2>
                        <Link to="/discover" className="label-noir hover:text-neon">More vines →</Link>
                    </div>
                    {items.length === 0 ? (
                        <div className="noir-panel p-12 text-center">
                            <p className="font-display text-3xl uppercase">The vine is silent.</p>
                            <p className="mt-2 text-[#A99BB8]">Be the first to whisper.</p>
                        </div>
                    ) : (
                        <div className="masonry">
                            {items.map((c) => (
                                <article key={c.id} data-testid={`confession-card-${c.id}`}
                                    className="noir-panel noir-panel-hover p-5 animate-fadein">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{c.emoji || "🌿"}</span>
                                        {c.is_boosted && <span className="label-noir text-neon">★ Boosted</span>}
                                    </div>
                                    <p className="font-mono-vine leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                    <div className="mt-4 flex items-center justify-between border-t border-[#2E1645] pt-3">
                                        <span className="text-xs text-[#6C597E]">
                                            {new Date(c.created_at).toLocaleString()}
                                        </span>
                                        <button data-testid={`upvote-${c.id}`} onClick={() => upvote(c.id)} className="text-xs neon-text hover:scale-110 transition">▲ {c.upvotes}</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

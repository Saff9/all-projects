import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API } from "@/lib/api";

export default function VineCards() {
    const { slug } = useParams();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get(`/cards/${slug}`).then(r => setCards(r.data)).finally(() => setLoading(false));
    }, [slug]);
    return (
        <div data-testid="vine-cards-page" className="max-w-7xl mx-auto px-6 py-12">
            <Link to={`/v/${slug}`} className="label-noir text-[#A99BB8] hover:text-neon">← back to vine</Link>
            <h1 className="font-display text-5xl uppercase mt-3">Graphic <span className="neon-text">novella</span> gallery</h1>
            <p className="mt-2 text-[#A99BB8]">AI-rendered panels of the juiciest whispers. Long-press to share.</p>
            {loading ? <p className="mt-10 label-noir">Loading...</p> : cards.length === 0 ? (
                <div className="mt-12 noir-panel p-12 text-center">
                    <p className="font-display text-3xl uppercase">No cards yet.</p>
                    <p className="mt-2 text-[#A99BB8]">Owners can mint cards from confessions in the dashboard.</p>
                </div>
            ) : (
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map(c => (
                        <a key={c.id} data-testid={`card-${c.id}`}
                           href={`${API}/cards/image/${c.image_path}`}
                           target="_blank" rel="noreferrer"
                           className="noir-panel noir-panel-hover p-3 block">
                            <img src={`${API}/cards/image/${c.image_path}`} alt={c.caption} className="w-full aspect-square object-cover" />
                            <p className="mt-3 font-mono-vine text-sm line-clamp-3">{c.caption}</p>
                            <p className="mt-2 text-xs text-[#6C597E]">{new Date(c.generated_at).toLocaleString()}</p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

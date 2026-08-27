import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

export default function Discover() {
    const [vines, setVines] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get("/vines/discover").then(r => setVines(r.data)).finally(()=>setLoading(false));
    }, []);
    return (
        <div data-testid="discover-page" className="max-w-7xl mx-auto px-6 py-16">
            <span className="label-noir text-neon">Public garden</span>
            <h1 className="font-display text-5xl sm:text-6xl uppercase mt-2">Discover <span className="neon-text">vines</span>.</h1>
            <p className="mt-3 text-[#A99BB8] max-w-2xl">Step into a stranger's garden. Read whispers. Vote in the nightly game. Stay anonymous.</p>
            {loading ? (
                <p className="mt-12 label-noir">Searching the dark…</p>
            ) : vines.length === 0 ? (
                <p className="mt-12 label-noir">No vines yet — <Link className="neon-text underline" to="/signup">plant the first →</Link></p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                    {vines.map(v => (
                        <Link key={v.id} to={`/v/${v.slug}`} data-testid={`discover-vine-${v.slug}`}
                            className="noir-panel noir-panel-hover p-6 block">
                            <span className="label-noir text-neon">{v.moderation_strictness}</span>
                            <h3 className="font-display text-2xl uppercase mt-2">{v.name}</h3>
                            <p className="mt-2 text-[#A99BB8] line-clamp-3 text-sm">{v.description || "—"}</p>
                            <span className="mt-4 inline-block label-noir text-magenta">enter →</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

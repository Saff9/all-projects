import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CreateVine() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        moderation_strictness: "balanced",
        requires_approval: false,
        game_schedule_hour: 20,
    });
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const set = (k) => (e) => {
        const v = e.target.type === "checkbox" ? e.target.checked
                : e.target.type === "number" ? parseInt(e.target.value)
                : e.target.value;
        setForm({ ...form, [k]: v });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post("/vines", form);
            toast.success(`Vine "${data.name}" created.`);
            nav(`/v/${data.slug}`);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not create vine");
        } finally { setLoading(false); }
    };

    return (
        <div data-testid="create-vine-page" className="max-w-2xl mx-auto px-6 py-16">
            <span className="label-noir text-neon">Step 1 of 1</span>
            <h1 className="font-display text-5xl uppercase mt-2">Spin up a <span className="neon-text">new vine</span>.</h1>
            <p className="mt-3 text-[#A99BB8]">Name your secret garden, set the tone, schedule the chaos.</p>
            <form onSubmit={submit} className="mt-10 noir-panel p-8 space-y-6">
                <div>
                    <label className="label-noir block mb-2">Vine name</label>
                    <input data-testid="vine-name" value={form.name} onChange={set("name")} required minLength={2} maxLength={80} className="input-noir" placeholder="Midnight Whispers" />
                </div>
                <div>
                    <label className="label-noir block mb-2">Description</label>
                    <textarea data-testid="vine-description" value={form.description} onChange={set("description")} maxLength={600} rows={3} className="input-noir resize-none" placeholder="A vine for night owls and overthinkers." />
                </div>
                <div>
                    <label className="label-noir block mb-2">Moderation strictness</label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup">
                        {["loose","balanced","strict"].map(s => (
                            <button type="button" key={s}
                                data-testid={`vine-strictness-${s}`}
                                onClick={()=>setForm({...form, moderation_strictness: s})}
                                className={`py-3 font-display uppercase tracking-wide border-2 ${form.moderation_strictness===s ? "bg-neon text-black border-neon" : "border-[#2E1645] text-[#A99BB8] hover:border-neon"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between border-t-2 border-[#2E1645] pt-6">
                    <div>
                        <p className="font-display text-lg uppercase">Manual approval queue</p>
                        <p className="text-xs text-[#A99BB8]">Hold confessions until you approve them.</p>
                    </div>
                    <input data-testid="vine-requires-approval" type="checkbox" checked={form.requires_approval} onChange={set("requires_approval")} className="w-6 h-6 accent-neon" />
                </div>
                <div>
                    <label className="label-noir block mb-2">Daily game hour (UTC, -1 = off)</label>
                    <input data-testid="vine-game-hour" type="number" min={-1} max={23} value={form.game_schedule_hour} onChange={set("game_schedule_hour")} className="input-noir" />
                </div>
                <button data-testid="create-vine-submit" disabled={loading} className="btn-neon w-full">{loading ? "Sprouting..." : "Plant the vine"}</button>
            </form>
        </div>
    );
}

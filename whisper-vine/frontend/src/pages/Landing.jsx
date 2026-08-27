import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div data-testid="landing-page" className="relative">
            {/* Hero */}
            <section className="relative overflow-hidden border-b-2 border-[#2E1645]">
                <div className="absolute inset-0 -z-10 grain">
                    <img
                        src="https://images.unsplash.com/flagged/photo-1564128928548-0d648ee059a8?crop=entropy&cs=srgb&fm=jpg&q=85"
                        alt=""
                        className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#09030E]/60 via-[#09030E]/85 to-[#09030E]" />
                </div>
                <div className="max-w-7xl mx-auto px-6 py-20 sm:py-32 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7">
                        <span data-testid="hero-eyebrow" className="label-noir text-neon">Anonymous · Confessional · Game Engine</span>
                        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase mt-4 leading-[0.9]">
                            Whisper into <br/>
                            the <span className="neon-text">vine</span>.<br/>
                            <span className="text-[#A99BB8]">Burn the trace.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base sm:text-lg text-[#A99BB8] leading-relaxed">
                            Spin up a Vine. Receive anonymous confessions. Run AI-built nightly games.
                            Turn the juiciest secrets into shareable graphic-novella cards. Zero senders. Zero traces.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to="/signup" data-testid="hero-cta-create" className="btn-neon">Create your vine</Link>
                            <Link to="/discover" data-testid="hero-cta-explore" className="btn-ghost-neon">Explore vines</Link>
                            <a href={`${process.env.REACT_APP_BACKEND_URL}/api/download/whispervine_full.zip`} data-testid="hero-cta-download" className="btn-ghost-neon">⬇ Download source (.zip)</a>
                        </div>
                        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-xs">
                            <div><span className="neon-text font-display text-3xl block">0</span><span className="label-noir">submitter id stored</span></div>
                            <div><span className="neon-text font-display text-3xl block">3s</span><span className="label-noir">moderation latency</span></div>
                            <div><span className="neon-text font-display text-3xl block">24/7</span><span className="label-noir">games running</span></div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="noir-panel p-6 rotate-[-2deg] grain">
                            <div className="label-noir mb-2">A WHISPER</div>
                            <p className="font-mono-vine text-lg leading-relaxed">
                                "🌒 I told my therapist I was fine but I haven't slept in four days.
                                The vine listens better than humans."
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs text-[#6C597E]">— anonymous</span>
                                <span className="neon-text text-xs">▲ 412</span>
                            </div>
                        </div>
                        <div className="noir-panel p-6 mt-4 rotate-[1.5deg] grain">
                            <div className="label-noir text-magenta mb-2">UNPOPULAR OPINION · LIVE</div>
                            <p className="font-mono-vine">"Open offices are the panopticon for millennials."</p>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-neon text-black py-2 text-center font-display uppercase tracking-wider">Agree 64%</div>
                                <div className="bg-magenta text-black py-2 text-center font-display uppercase tracking-wider">Disagree 36%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 noir-panel p-8 noir-panel-hover">
                        <span className="label-noir text-neon">01 · Privacy by design</span>
                        <h3 className="font-display text-3xl uppercase mt-3">No sender. No trace. No drama.</h3>
                        <p className="mt-3 text-[#A99BB8]">Confessions land in the database with a vine ID and content — never a user ID. Rate limits use a hashed fingerprint that disappears in 60 seconds.</p>
                    </div>
                    <div className="md:col-span-5 noir-panel p-8 noir-panel-hover">
                        <span className="label-noir text-neon">02 · AI moderation</span>
                        <h3 className="font-display text-3xl uppercase mt-3">Stops harm. Saves jokes.</h3>
                        <p className="mt-3 text-[#A99BB8]">Two-stage classifier (regex + Claude Sonnet 4.5). Knows the difference between a doxx and a dark joke.</p>
                    </div>
                    <div className="md:col-span-4 noir-panel p-8 noir-panel-hover">
                        <span className="label-noir text-neon">03 · Nightly games</span>
                        <h3 className="font-display text-2xl uppercase mt-3">Would You Rather. Unpopular Opinion.</h3>
                        <p className="mt-3 text-[#A99BB8] text-sm">Auto-scheduled per vine. Anonymous voting. Animated results.</p>
                    </div>
                    <div className="md:col-span-4 noir-panel p-8 noir-panel-hover">
                        <span className="label-noir text-neon">04 · Vine Cards</span>
                        <h3 className="font-display text-2xl uppercase mt-3">Confessions become art.</h3>
                        <p className="mt-3 text-[#A99BB8] text-sm">Top whispers become graphic-novella panels via Gemini Nano Banana. Shareable noir.</p>
                    </div>
                    <div className="md:col-span-4 noir-panel p-8 noir-panel-hover">
                        <span className="label-noir text-neon">05 · Owner dashboard</span>
                        <h3 className="font-display text-2xl uppercase mt-3">Your secret club.</h3>
                        <p className="mt-3 text-[#A99BB8] text-sm">Approval queue, stats, branding, ad-free toggle. Built for creators.</p>
                    </div>
                </div>
            </section>

            {/* CTA strip */}
            <section className="border-t-2 border-[#2E1645] bg-[#160822]">
                <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                    <div>
                        <h2 className="font-display text-4xl sm:text-5xl uppercase">Plant a vine in 30 seconds.</h2>
                        <p className="mt-3 text-[#A99BB8] max-w-xl">Sign up free. Share your vine link. Watch the whispers grow at midnight.</p>
                    </div>
                    <Link to="/signup" data-testid="footer-cta-signup" className="btn-neon">Start now →</Link>
                </div>
            </section>
        </div>
    );
}

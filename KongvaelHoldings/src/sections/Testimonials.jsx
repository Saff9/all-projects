import { useScrollReveal } from '../hooks/useScrollReveal'
import './Testimonials.css'

const testimonials = [
    {
        name: 'Aarav Sharma',
        role: 'Early Supporter',
        amount: '₹500',
        text: "I donated because I believe in what Kongvael is building. The team's transparency and regular updates give me confidence that my money is making a real difference.",
        initials: 'AS',
        gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    },
    {
        name: 'Priya Mehta',
        role: 'Champion Donor',
        amount: '₹2,500',
        text: "The monthly progress calls are incredible. You can feel the passion and dedication. This isn't just a startup — it's a movement. Proud to be part of it.",
        initials: 'PM',
        gradient: 'linear-gradient(135deg, #818cf8, #a78bfa)',
    },
    {
        name: 'Rohan Kapoor',
        role: 'Visionary Donor',
        amount: '₹5,000',
        text: "I've seen many startups come and go. Kongvael is different — their execution speed, vision clarity, and team quality are exceptional. This is the future.",
        initials: 'RK',
        gradient: 'linear-gradient(135deg, #f472b6, #a78bfa)',
    },
    {
        name: 'Sneha Iyer',
        role: 'Supporter',
        amount: '₹2,000',
        text: "Even a small donation made me feel like I'm part of something big. The community they're building around this project is inspiring. Can't wait to see what's next!",
        initials: 'SI',
        gradient: 'linear-gradient(135deg, #34d399, #22d3ee)',
    },
]

export default function Testimonials({ onDonate }) {
    const sectionRef = useScrollReveal()

    return (
        <section className="testimonials section" id="testimonials" ref={sectionRef}>
            <div className="container">
                <div className="testimonials__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        Donor Stories
                    </div>
                    <h2 className="section-title">What Our Donors Say</h2>
                    <p className="section-subtitle">
                        Real words from real people who believe in our mission.
                        Join them and become part of the Kongvael story.
                    </p>
                </div>

                <div className="testimonials__grid">
                    {testimonials.map((t, i) => (
                        <div key={i} className={`testimonials__card glass-card reveal reveal-delay-${(i % 4) + 1}`}>
                            <div className="testimonials__stars">⭐⭐⭐⭐⭐</div>
                            <p className="testimonials__text">"{t.text}"</p>
                            <div className="testimonials__author">
                                <div className="testimonials__avatar" style={{ background: t.gradient }}>
                                    {t.initials}
                                </div>
                                <div className="testimonials__info">
                                    <strong className="testimonials__name">{t.name}</strong>
                                    <span className="testimonials__role">{t.role} · {t.amount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="testimonials__cta reveal reveal-delay-2">
                    <div className="testimonials__cta-count">
                        <strong>142+</strong> donors and counting
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => onDonate()}
                    >
                        Join Them — Donate Now
                    </button>
                </div>
            </div>
        </section>
    )
}

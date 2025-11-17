import { useScrollReveal } from '../hooks/useScrollReveal'
import './Impact.css'

const impacts = [
    {
        amount: '₹500',
        title: 'Plant a Seed',
        desc: 'Covers one day of cloud hosting and helps us keep the platform running for all users.',
        icon: '🌱',
        color: '#22c55e',
    },
    {
        amount: '₹2,000',
        title: 'Build a Feature',
        desc: "Funds the development of a single product feature that thousands of users will benefit from.",
        icon: '⚡',
        color: '#3b82f6',
    },
    {
        amount: '₹1,000',
        title: 'Reach 100 Users',
        desc: "Powers a targeted marketing campaign that brings 100 new users to Kongvael's platform.",
        icon: '🚀',
        color: '#818cf8',
    },
    {
        amount: '₹2,000',
        title: 'Hire for a Week',
        desc: "Covers one week's compensation for a skilled developer working full-time on our product.",
        icon: '💻',
        color: '#a78bfa',
    },
    {
        amount: '₹5,000',
        title: 'Launch a Market',
        desc: 'Funds the go-to-market strategy for entering one new city or target vertical.',
        icon: '🌍',
        color: '#f472b6',
    },
    {
        amount: '₹1,00,000',
        title: 'Scale Everything',
        desc: 'A transformative donation that accelerates our timeline by an entire quarter. Game-changing.',
        icon: '💎',
        color: '#fbbf24',
    },
]

export default function Impact({ onDonate }) {
    const sectionRef = useScrollReveal()

    return (
        <section className="impact section" id="impact" ref={sectionRef}>
            <div className="container">
                <div className="impact__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        Your Impact
                    </div>
                    <h2 className="section-title">Every Rupee Makes a Difference</h2>
                    <p className="section-subtitle">
                        See exactly how your donation translates into real action.
                        No matter the amount, your support creates tangible impact.
                    </p>
                </div>

                <div className="impact__grid">
                    {impacts.map((item, i) => (
                        <div key={i} className={`impact__card glass-card reveal reveal-delay-${(i % 3) + 1}`}>
                            <div className="impact__card-emoji">{item.icon}</div>
                            <span className="impact__card-amount" style={{ color: item.color }}>{item.amount}</span>
                            <h3 className="impact__card-title">{item.title}</h3>
                            <p className="impact__card-desc">{item.desc}</p>
                            <button
                                className="impact__card-btn"
                                style={{ borderColor: `${item.color}40`, color: item.color }}
                                onClick={() => onDonate(item.amount.replace(/[₹,]/g, ''))}
                            >
                                Donate {item.amount}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="impact__cta reveal reveal-delay-2">
                    <p className="impact__cta-text">
                        ✨ <strong>Every donation</strong>, no matter how small, gets us one step closer to ₹5,00,000
                    </p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => onDonate()}
                    >
                        ❤️ Donate Now
                    </button>
                </div>
            </div>
        </section>
    )
}

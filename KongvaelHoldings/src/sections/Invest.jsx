import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './Invest.css'

const tiers = [
    {
        name: 'Supporter',
        emoji: '🌱',
        range: '₹500 – ₹4,999',
        color: '#22d3ee',
        popular: false,
        perks: [
            'Name on our Supporters Wall',
            'Quarterly progress newsletter',
            'Early access to product demos',
            'Exclusive community access',
        ],
    },
    {
        name: 'Champion',
        emoji: '🚀',
        range: '₹5,000 – ₹49,999',
        color: '#818cf8',
        popular: true,
        perks: [
            'Everything in Supporter tier',
            'Priority feature requests',
            'Monthly progress call access',
            'Co-branded partnership badge',
            'VIP launch event invite',
        ],
    },
    {
        name: 'Visionary',
        emoji: '💎',
        range: '₹50,000+',
        color: '#f472b6',
        popular: false,
        perks: [
            'Everything in Champion tier',
            'Advisory board nomination',
            'Direct line to founding team',
            'Custom partnership opportunities',
            'Featured in donor spotlight',
            'Lifetime premium access',
        ],
    },
]

export default function Donate({ onDonate }) {
    const sectionRef = useScrollReveal()
    const [raised] = useState(187500)
    const goal = 500000
    const percent = Math.min((raised / goal) * 100, 100)

    const formatINR = (n) => '₹' + n.toLocaleString('en-IN')

    return (
        <section className="invest section" id="donate" ref={sectionRef}>
            <div className="container">
                <div className="invest__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        Support Our Mission
                    </div>
                    <h2 className="section-title">Power the Future With Your Support</h2>
                    <p className="section-subtitle">
                        Every donation fuels our journey. Choose a tier and become a part of
                        something bigger than yourself. Together, we build the extraordinary.
                    </p>
                </div>

                <div className="invest__progress reveal reveal-delay-1">
                    <div className="invest__progress-header">
                        <span className="invest__progress-raised">
                            {formatINR(raised)} <span className="invest__progress-label">raised</span>
                        </span>
                        <span className="invest__progress-goal">
                            Goal: {formatINR(goal)}
                        </span>
                    </div>
                    <div className="invest__progress-bar">
                        <div
                            className="invest__progress-fill"
                            style={{ width: `${percent}%` }}
                        >
                            <div className="invest__progress-glow"></div>
                        </div>
                    </div>
                    <div className="invest__progress-meta">
                        <p className="invest__progress-backers">
                            <strong>142</strong> generous donors have contributed
                        </p>
                        <p className="invest__progress-percent">
                            <strong>{Math.round(percent)}%</strong> funded
                        </p>
                    </div>
                </div>

                <div className="invest__tiers">
                    {tiers.map((tier, i) => (
                        <div
                            key={i}
                            className={`invest__tier glass-card reveal reveal-delay-${i + 1} ${tier.popular ? 'invest__tier--popular' : ''}`}
                        >
                            {tier.popular && <div className="invest__tier-badge">⭐ Most Popular</div>}
                            <div className="invest__tier-emoji">{tier.emoji}</div>
                            <div className="invest__tier-header">
                                <h3 className="invest__tier-name" style={{ color: tier.color }}>{tier.name}</h3>
                                <p className="invest__tier-range">{tier.range}</p>
                            </div>
                            <ul className="invest__tier-perks">
                                {tier.perks.map((perk, j) => (
                                    <li key={j} className="invest__tier-perk">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-primary invest__tier-btn" style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}aa)` }} onClick={() => onDonate()}>
                                Donate Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

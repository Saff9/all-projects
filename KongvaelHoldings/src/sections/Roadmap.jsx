import { useScrollReveal } from '../hooks/useScrollReveal'
import './Roadmap.css'

const phases = [
    {
        quarter: 'Q1 2026',
        title: 'Foundation',
        status: 'completed',
        items: [
            'Company incorporation & legal setup',
            'Core team assembly',
            'Market research & validation',
            'MVP architecture design',
        ],
    },
    {
        quarter: 'Q2 2026',
        title: 'Seed Funding & MVP',
        status: 'active',
        items: [
            'First funding round (current)',
            'MVP development & launch',
            'Initial user acquisition (1K users)',
            'Strategic partnerships outreach',
        ],
    },
    {
        quarter: 'Q3 2026',
        title: 'Growth Phase',
        status: 'upcoming',
        items: [
            'Scale to 10K active users',
            'Launch premium features',
            'Expand to 3 target markets',
            'Build out sales & marketing team',
        ],
    },
    {
        quarter: 'Q4 2026',
        title: 'Expansion',
        status: 'upcoming',
        items: [
            'Series A preparation',
            'International market entry',
            'Enterprise product launch',
            'Revenue milestone: $500K ARR',
        ],
    },
    {
        quarter: '2027+',
        title: 'Scale & Dominate',
        status: 'upcoming',
        items: [
            'Series A fundraise',
            'Expand to 10+ markets globally',
            'Team growth to 50+ people',
            'Product-market fit at scale',
        ],
    },
]

const statusMap = {
    completed: { label: 'Completed', color: '#22c55e' },
    active: { label: 'In Progress', color: '#3b82f6' },
    upcoming: { label: 'Upcoming', color: '#64748b' },
}

export default function Roadmap() {
    const sectionRef = useScrollReveal()

    return (
        <section className="roadmap section" id="roadmap" ref={sectionRef}>
            <div className="container">
                <div className="roadmap__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        Roadmap
                    </div>
                    <h2 className="section-title">Our Journey Ahead</h2>
                    <p className="section-subtitle">
                        A clear, ambitious roadmap showing where we've been and where we're headed.
                        Transparency is at the core of everything we do.
                    </p>
                </div>

                <div className="roadmap__timeline">
                    {phases.map((phase, i) => {
                        const status = statusMap[phase.status]
                        return (
                            <div key={i} className={`roadmap__phase reveal reveal-delay-${(i % 4) + 1}`}>
                                <div className="roadmap__line">
                                    <div
                                        className="roadmap__dot"
                                        style={{
                                            background: status.color,
                                            boxShadow: `0 0 12px ${status.color}60`,
                                        }}
                                    >
                                        {phase.status === 'completed' && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        )}
                                        {phase.status === 'active' && (
                                            <div className="roadmap__dot-pulse"></div>
                                        )}
                                    </div>
                                </div>
                                <div className="roadmap__content glass-card">
                                    <div className="roadmap__content-header">
                                        <span className="roadmap__quarter">{phase.quarter}</span>
                                        <span className="roadmap__status" style={{ color: status.color, borderColor: `${status.color}40` }}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <h3 className="roadmap__title">{phase.title}</h3>
                                    <ul className="roadmap__items">
                                        {phase.items.map((item, j) => (
                                            <li key={j} className="roadmap__item">
                                                <span className="roadmap__item-dot" style={{ background: status.color }}></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

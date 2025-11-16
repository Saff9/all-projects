import { useCountUp } from '../hooks/useCountUp'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './About.css'

const stats = [
    { value: 2026, label: 'Founded', suffix: '' },
    { value: 5, label: 'Target Markets', suffix: '+' },
    { value: 5, label: 'Funding Goal', prefix: '₹', suffix: 'L' },
    { value: 12, label: 'Team Members', suffix: '+' },
]

const features = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
        ),
        title: 'People First',
        desc: 'Every rupee donated goes directly toward empowering our mission and the communities we serve.',
        gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        ),
        title: 'Move Fast',
        desc: 'We iterate rapidly and ship real products that solve real problems. No bureaucracy, just results.',
        gradient: 'linear-gradient(135deg, #3b82f6, #818cf8)',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
        title: 'Built to Scale',
        desc: 'Our infrastructure is designed for global scale from day one — ready for millions of users.',
        gradient: 'linear-gradient(135deg, #818cf8, #a78bfa)',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
        ),
        title: 'Innovative Tech',
        desc: 'Leveraging cutting-edge technology to solve problems that others haven\'t even begun to address.',
        gradient: 'linear-gradient(135deg, #a78bfa, #f472b6)',
    },
]

function StatCard({ stat }) {
    const { count, ref } = useCountUp(stat.value, 2000)

    return (
        <div className="about__stat" ref={ref}>
            <span className="about__stat-value">
                {stat.prefix || ''}{count}{stat.suffix || ''}
            </span>
            <span className="about__stat-label">{stat.label}</span>
        </div>
    )
}

export default function About() {
    const sectionRef = useScrollReveal()

    return (
        <section className="about section" id="about" ref={sectionRef}>
            <div className="container">
                <div className="about__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        About Us
                    </div>
                    <h2 className="section-title">Why Kongvael Holdings?</h2>
                    <p className="section-subtitle">
                        We're building an ecosystem of innovative solutions that empower
                        businesses and individuals to thrive. Your support makes it possible.
                    </p>
                </div>

                <div className="about__stats reveal reveal-delay-1">
                    {stats.map((stat, i) => (
                        <StatCard key={i} stat={stat} />
                    ))}
                </div>

                <div className="about__features">
                    {features.map((feature, i) => (
                        <div key={i} className={`about__feature glass-card reveal reveal-delay-${i + 1}`}>
                            <div className="about__feature-icon" style={{ background: feature.gradient }}>
                                {feature.icon}
                            </div>
                            <h3 className="about__feature-title">{feature.title}</h3>
                            <p className="about__feature-desc">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

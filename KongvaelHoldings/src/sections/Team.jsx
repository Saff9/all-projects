import { useScrollReveal } from '../hooks/useScrollReveal'
import './Team.css'

const team = [
    {
        name: 'Alexander Kongvael',
        role: 'Founder & CEO',
        initials: 'AK',
        bio: 'Visionary entrepreneur with 10+ years in venture capital and strategic investments. Previously led growth at multiple startups from seed to Series B.',
        color: '#3b82f6',
    },
    {
        name: 'Sarah Mitchell',
        role: 'Chief Technology Officer',
        initials: 'SM',
        bio: 'Full-stack engineering leader with experience at top tech companies. Passionate about building scalable systems that handle millions of users.',
        color: '#818cf8',
    },
    {
        name: 'David Chen',
        role: 'Head of Operations',
        initials: 'DC',
        bio: 'Operations expert who has scaled companies across 5 continents. Brings efficiency and structure to rapidly growing organizations.',
        color: '#a78bfa',
    },
    {
        name: 'Elena Rodriguez',
        role: 'Chief Financial Officer',
        initials: 'ER',
        bio: 'Former investment banker with deep expertise in fundraising, financial modeling, and strategic planning for high-growth ventures.',
        color: '#60a5fa',
    },
    {
        name: 'James Park',
        role: 'Head of Product',
        initials: 'JP',
        bio: 'Product strategist who has shipped products used by millions. Obsessed with user experience and data-driven decision making.',
        color: '#34d399',
    },
    {
        name: 'Priya Sharma',
        role: 'VP of Marketing',
        initials: 'PS',
        bio: 'Growth marketing strategist who has driven 10x user acquisition at previous ventures. Expert in brand building and digital marketing.',
        color: '#f59e0b',
    },
]

export default function Team() {
    const sectionRef = useScrollReveal()

    return (
        <section className="team section" id="team" ref={sectionRef}>
            <div className="container">
                <div className="team__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        Our Team
                    </div>
                    <h2 className="section-title">The People Behind the Vision</h2>
                    <p className="section-subtitle">
                        A world-class team of entrepreneurs, engineers, and strategists
                        committed to building something extraordinary.
                    </p>
                </div>

                <div className="team__grid">
                    {team.map((member, i) => (
                        <div key={i} className={`team__card glass-card reveal reveal-delay-${(i % 3) + 1}`}>
                            <div className="team__avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}80)` }}>
                                {member.initials}
                            </div>
                            <h3 className="team__name">{member.name}</h3>
                            <span className="team__role" style={{ color: member.color }}>{member.role}</span>
                            <p className="team__bio">{member.bio}</p>
                            <div className="team__socials">
                                <a href="#" className="team__social" aria-label="LinkedIn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                </a>
                                <a href="#" className="team__social" aria-label="Twitter">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { useEffect, useRef, useState } from 'react'
import './Hero.css'

function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
    useEffect(() => {
        const tick = () => {
            const diff = targetDate - Date.now()
            if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                mins: Math.floor((diff % 3600000) / 60000),
                secs: Math.floor((diff % 60000) / 1000),
            })
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [targetDate])
    return timeLeft
}

export default function Hero({ onDonate }) {
    const canvasRef = useRef(null)
    const deadline = useRef(Date.now() + 30 * 86400000).current
    const cd = useCountdown(deadline)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let raf
        let particles = []

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)

        class Dot {
            constructor() { this.reset() }
            reset() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                this.r = Math.random() * 1.5 + 0.3
                this.vx = (Math.random() - 0.5) * 0.3
                this.vy = (Math.random() - 0.5) * 0.3
                this.a = Math.random() * 0.4 + 0.05
            }
            update() {
                this.x += this.vx
                this.y += this.vy
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1
            }
            draw() {
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(99, 102, 241, ${this.a})`
                ctx.fill()
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Dot())

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => { p.update(); p.draw() })
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - d / 120)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
            raf = requestAnimationFrame(animate)
        }
        animate()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    }, [])

    return (
        <section className="hero" id="hero">
            <canvas ref={canvasRef} className="hero__canvas" />
            <div className="hero__gradient" />

            <div className="hero__content">
                <div className="hero__label">
                    <span className="hero__label-dot" />
                    First Funding Round — Now Open
                </div>

                <h1 className="hero__title">
                    Building the future,<br />
                    <span className="hero__title-em">together.</span>
                </h1>

                <p className="hero__desc">
                    Kongvael Holdings is on a mission to build innovative technology solutions.
                    Support our journey and help us reach our ₹5,00,000 goal.
                </p>

                <div className="hero__countdown">
                    <span className="hero__countdown-label">Round closes in</span>
                    <div className="hero__countdown-boxes">
                        {[
                            { val: cd.days, lbl: 'Days' },
                            { val: cd.hours, lbl: 'Hrs' },
                            { val: cd.mins, lbl: 'Min' },
                            { val: cd.secs, lbl: 'Sec' },
                        ].map((u, i) => (
                            <div key={i} className="hero__cd-box">
                                <span className="hero__cd-val">{String(u.val).padStart(2, '0')}</span>
                                <span className="hero__cd-lbl">{u.lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero__actions">
                    <button className="btn btn-primary btn-lg" onClick={() => onDonate()}>
                        Donate Now
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </button>
                    <a href="#about" className="btn btn-secondary btn-lg" onClick={e => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }) }}>
                        Learn More
                    </a>
                </div>

                <div className="hero__proof">
                    <div className="hero__avatars">
                        {['A', 'P', 'R', 'S'].map((l, i) => (
                            <div key={i} className="hero__avatar">{l}</div>
                        ))}
                        <div className="hero__avatar hero__avatar--more">+138</div>
                    </div>
                    <div className="hero__proof-text">
                        <strong>142</strong> people have donated · <span className="hero__proof-amt">₹1.87L raised</span>
                    </div>
                </div>
            </div>

            <div className="hero__metrics">
                <div className="hero__metric">
                    <span className="hero__metric-val">₹5L</span>
                    <span className="hero__metric-lbl">Goal</span>
                </div>
                <div className="hero__metric-line" />
                <div className="hero__metric">
                    <span className="hero__metric-val">37%</span>
                    <span className="hero__metric-lbl">Funded</span>
                </div>
                <div className="hero__metric-line" />
                <div className="hero__metric">
                    <span className="hero__metric-val">5+</span>
                    <span className="hero__metric-lbl">Markets</span>
                </div>
            </div>
        </section>
    )
}

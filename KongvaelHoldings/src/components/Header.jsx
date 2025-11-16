import { useState, useEffect } from 'react'
import './Header.css'

export default function Header({ onDonate }) {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'About', href: '#about' },
        { label: 'Donate', href: '#donate' },
        { label: 'Team', href: '#team' },
        { label: 'Roadmap', href: '#roadmap' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Contact', href: '#contact' },
    ]

    const handleNavClick = (e, href) => {
        e.preventDefault()
        setMobileOpen(false)
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="header__inner">
                <a href="#" className="header__logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                    <div className="header__logo-icon">
                        <span>K</span>
                    </div>
                    <span className="header__logo-text">Kongvael</span>
                </a>

                <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="header__link"
                            onClick={(e) => handleNavClick(e, link.href)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <button
                        className="header__cta"
                        onClick={() => { setMobileOpen(false); onDonate(); }}
                    >
                        Donate Now
                    </button>
                </nav>

                <button
                    className={`header__hamburger ${mobileOpen ? 'header__hamburger--open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    )
}

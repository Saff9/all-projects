import './Footer.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <div className="footer__logo-icon">K</div>
                            <span>Kongvael Holdings</span>
                        </div>
                        <p className="footer__desc">
                            Building the future through innovation and community support. Your donation
                            powers our mission to create extraordinary impact.
                        </p>
                        <div className="footer__socials">
                            <a href="#" className="footer__social" aria-label="Twitter">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                            </a>
                            <a href="#" className="footer__social" aria-label="LinkedIn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                            </a>
                            <a href="#" className="footer__social" aria-label="GitHub">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                            </a>
                            <a href="https://www.instagram.com/kongvaelholdings" className="footer__social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer__column">
                        <h4 className="footer__heading">Company</h4>
                        <a href="#about" className="footer__link">About Us</a>
                        <a href="#team" className="footer__link">Our Team</a>
                        <a href="#roadmap" className="footer__link">Roadmap</a>
                        <a href="#" className="footer__link">Careers</a>
                    </div>

                    <div className="footer__column">
                        <h4 className="footer__heading">Support</h4>
                        <a href="#donate" className="footer__link">Donate</a>
                        <a href="#faq" className="footer__link">FAQ</a>
                        <a href="#" className="footer__link">Our Impact</a>
                        <a href="#contact" className="footer__link">Contact</a>
                    </div>

                    <div className="footer__column">
                        <h4 className="footer__heading">Stay Updated</h4>
                        <p className="footer__newsletter-text">Get the latest updates on our progress and milestones.</p>
                        <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="your@email.com" className="footer__input" />
                            <button type="submit" className="footer__submit">→</button>
                        </form>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© {currentYear} Kongvael Holdings. All rights reserved.</p>
                    <div className="footer__bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

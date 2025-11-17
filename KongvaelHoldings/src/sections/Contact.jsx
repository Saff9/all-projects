import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './Contact.css'

export default function Contact() {
    const sectionRef = useScrollReveal()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        interest: '',
        message: '',
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 4000)
        setFormData({ name: '', email: '', interest: '', message: '' })
    }

    return (
        <section className="contact section" id="contact" ref={sectionRef}>
            <div className="container">
                <div className="contact__layout">
                    <div className="contact__info reveal">
                        <div className="section-label">
                            <span className="dot"></span>
                            Get in Touch
                        </div>
                        <h2 className="section-title">Let's Build Together</h2>
                        <p className="section-subtitle">
                            Want to support Kongvael Holdings or learn more about our mission?
                            We'd love to hear from you. Our team responds within 24 hours.
                        </p>

                        <div className="contact__details">
                            <div className="contact__detail">
                                <div className="contact__detail-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </div>
                                <div>
                                    <span className="contact__detail-label">Email</span>
                                    <a href="mailto:hello@kongvaelholdings.com" className="contact__detail-value">hello@kongvaelholdings.com</a>
                                </div>
                            </div>
                            <div className="contact__detail">
                                <div className="contact__detail-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <div>
                                    <span className="contact__detail-label">Location</span>
                                    <span className="contact__detail-value">Global — Remote First</span>
                                </div>
                            </div>
                            <div className="contact__detail">
                                <div className="contact__detail-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                </div>
                                <div>
                                    <span className="contact__detail-label">Website</span>
                                    <span className="contact__detail-value">kongvaelholdings.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="contact__form glass-card reveal reveal-delay-2" onSubmit={handleSubmit}>
                        {submitted && (
                            <div className="contact__success">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                Thank you! We'll reach out shortly.
                            </div>
                        )}
                        <div className="contact__field">
                            <label htmlFor="contact-name">Full Name</label>
                            <input
                                type="text"
                                id="contact-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                required
                            />
                        </div>
                        <div className="contact__field">
                            <label htmlFor="contact-email">Email Address</label>
                            <input
                                type="email"
                                id="contact-email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="contact__field">
                            <label htmlFor="contact-interest">How can you help?</label>
                            <select
                                id="contact-interest"
                                name="interest"
                                value={formData.interest}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select an option</option>
                                <option value="supporter">🌱 Donate (₹500 – ₹4,999)</option>
                                <option value="champion">🚀 Champion Donor (₹5,000 – ₹49,999)</option>
                                <option value="visionary">💎 Visionary Donor (₹50,000+)</option>
                                <option value="partner">🤝 Partnership / Collaboration</option>
                                <option value="other">💬 Just Curious / Other</option>
                            </select>
                        </div>
                        <div className="contact__field">
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Share your thoughts, questions, or how you'd like to help..."
                                rows="4"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg contact__submit">
                            Send Message
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}

import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './FAQ.css'

const faqs = [
    {
        q: 'What does Kongvael Holdings do?',
        a: 'Kongvael Holdings is a diversified venture-building company focused on creating and scaling innovative technology businesses. We identify high-potential market opportunities and build solutions from the ground up.',
    },
    {
        q: 'How will my donation be used?',
        a: 'Your donation goes directly toward building our vision: 40% Product Development, 25% Marketing & User Acquisition, 20% Team Growth, and 15% Operations. Every rupee is tracked and accounted for.',
    },
    {
        q: 'What do I get as a donor?',
        a: 'Every tier comes with unique benefits — from community access and progress newsletters (Supporter, ₹500+) to advisory board nomination and direct founding team access (Visionary, ₹50,000+). Check our donation tiers for full details!',
    },
    {
        q: 'Is my donation secure?',
        a: 'Absolutely. All transactions are processed through secure, encrypted payment channels. We work with trusted payment partners to ensure your data and funds are fully protected.',
    },
    {
        q: 'How much are you trying to raise?',
        a: 'Our first funding round targets ₹5,00,000 (₹5 Lakh). This capital will fuel our MVP launch, initial marketing, and team expansion — the critical foundations for growth.',
    },
    {
        q: 'Can I donate from outside India?',
        a: 'Yes! We welcome supporters from around the world. Our platform supports international payments, and our team will help you with any cross-border requirements.',
    },
    {
        q: 'How can I track your progress?',
        a: 'All donors receive regular progress updates via email. Champion and Visionary donors get monthly progress calls with the founding team. We believe in radical transparency — you\'ll always know where we stand.',
    },
]

function FAQItem({ faq, isOpen, toggle }) {
    return (
        <div className={`faq__item glass-card ${isOpen ? 'faq__item--open' : ''}`}>
            <button className="faq__question" onClick={toggle}>
                <span>{faq.q}</span>
                <div className="faq__icon">
                    <span></span>
                    <span></span>
                </div>
            </button>
            <div className="faq__answer">
                <p>{faq.a}</p>
            </div>
        </div>
    )
}

export default function FAQ() {
    const sectionRef = useScrollReveal()
    const [openIndex, setOpenIndex] = useState(null)

    return (
        <section className="faq section" id="faq" ref={sectionRef}>
            <div className="container">
                <div className="faq__header reveal">
                    <div className="section-label">
                        <span className="dot"></span>
                        FAQ
                    </div>
                    <h2 className="section-title">Questions? We've Got Answers</h2>
                    <p className="section-subtitle">
                        Everything you need to know about supporting Kongvael Holdings.
                        Can't find your answer? Reach out to us directly.
                    </p>
                </div>

                <div className="faq__list">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`reveal reveal-delay-${(i % 3) + 1}`}>
                            <FAQItem
                                faq={faq}
                                isOpen={openIndex === i}
                                toggle={() => setOpenIndex(openIndex === i ? null : i)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

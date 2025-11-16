import { useState, useEffect } from 'react'
import './StickyDonate.css'

export default function StickyDonate({ onDonate }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 600)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={`sticky-donate ${visible ? 'sticky-donate--visible' : ''}`}>
            <div className="sticky-donate__inner">
                <div className="sticky-donate__info">
                    <span className="sticky-donate__live">
                        <span className="sticky-donate__live-dot" />
                        LIVE
                    </span>
                    <span className="sticky-donate__progress-text">
                        <strong>₹1,87,500</strong> / ₹5,00,000
                    </span>
                    <div className="sticky-donate__bar">
                        <div className="sticky-donate__bar-fill" style={{ width: '37%' }} />
                    </div>
                </div>
                <button className="sticky-donate__cta" onClick={() => onDonate()}>
                    Donate Now
                </button>
            </div>
        </div>
    )
}

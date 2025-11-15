import { useState, useEffect, useCallback } from 'react'
import './DonateModal.css'

/*
 * UPI ID Security Layer
 * ---------------------
 * The UPI ID is stored using multi-layer obfuscation:
 * 1. Each character is XOR'd with a rotating key
 * 2. Result is reversed
 * 3. Then base64 encoded
 * This prevents simple base64 decode or plain-text scraping.
 * 
 * To generate a new encoded ID, run in console:
 *   encodeUPI("your@upi")  — see function below
 */

// XOR key for obfuscation
const XK = [0x4B, 0x6F, 0x6E, 0x67, 0x76, 0x61, 0x65, 0x6C] // "Kongvael"

function encodeUPI(id) {
    const xored = id.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ XK[i % XK.length])
    ).reverse().join('')
    return btoa(xored)
}

function decodeUPI(encoded) {
    try {
        const reversed = atob(encoded).split('').reverse().join('')
        return reversed.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ XK[i % XK.length])
        ).join('')
    } catch {
        return null
    }
}

// Pre-encoded UPI ID (XOR'd with "Kongvael" key, reversed, base64)
// To regenerate: run encodeUPI("your@upi") in browser console
const ENCODED_UPI = 'CQQCFQcOC1VcUBkVHgopBRcCFwIMGjg='

const PRESETS = [500, 2000, 5000, 25000]

export default function DonateModal({ isOpen, onClose, prefillAmount }) {
    const [amount, setAmount] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen && prefillAmount) setAmount(String(prefillAmount))
        if (!isOpen) { setAmount(''); setCopied(false) }
    }, [isOpen, prefillAmount])

    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && onClose()
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    const getUPI = useCallback(() => decodeUPI(ENCODED_UPI), [])

    const handlePay = () => {
        const upiId = getUPI()
        if (!upiId) return
        const amt = parseInt(amount) || 0
        const params = new URLSearchParams({
            pa: upiId,
            pn: 'Kongvael Holdings',
            cu: 'INR',
        })
        if (amt > 0) params.set('am', amt)
        window.open(`upi://pay?${params.toString()}`, '_blank')
    }

    const copyUPI = async () => {
        const upiId = getUPI()
        if (!upiId) return
        try {
            await navigator.clipboard.writeText(upiId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch { /* fallback: ignore */ }
    }

    if (!isOpen) return null

    const upiDisplay = getUPI()

    return (
        <div className="donate-overlay" onClick={onClose}>
            <div className="donate-modal" onClick={(e) => e.stopPropagation()}>
                <button className="donate-modal__close" onClick={onClose}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>

                <div className="donate-modal__header">
                    <h3>Support Kongvael Holdings</h3>
                    <p>Scan QR or pay directly via UPI</p>
                </div>

                <div className="donate-modal__qr">
                    <img
                        src="/assets/qrcode.jpg"
                        alt="Scan to donate via UPI"
                        onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/assets/qrcode.png'
                        }}
                    />
                </div>

                <div className="donate-modal__presets">
                    {PRESETS.map((p) => (
                        <button
                            key={p}
                            className={`donate-modal__preset ${parseInt(amount) === p ? 'donate-modal__preset--active' : ''}`}
                            onClick={() => setAmount(String(p))}
                        >
                            ₹{p.toLocaleString('en-IN')}
                        </button>
                    ))}
                </div>

                <div className="donate-modal__custom">
                    <span className="donate-modal__currency">₹</span>
                    <input
                        type="number"
                        placeholder="Custom amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                    />
                </div>

                <button className="donate-modal__pay" onClick={handlePay}>
                    Pay via UPI App
                </button>

                <div className="donate-modal__upi-row">
                    <span className="donate-modal__upi-label">UPI ID</span>
                    <code className="donate-modal__upi-id">{upiDisplay}</code>
                    <button className="donate-modal__copy" onClick={copyUPI}>
                        {copied ? '✓' : 'Copy'}
                    </button>
                </div>

                <div className="donate-modal__secure">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span>Secure • Encrypted • No data stored</span>
                </div>

                <a
                    className="donate-modal__instagram"
                    href="https://www.instagram.com/kongvaelholdings"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    Follow @kongvaelholdings
                </a>
            </div>
        </div>
    )
}

import { useState, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import Footer from './components/Footer'
import StickyDonate from './components/StickyDonate'
import DonationFeed from './components/DonationFeed'
import DonateModal from './components/DonateModal'
import Hero from './sections/Hero'
import About from './sections/About'
import Impact from './sections/Impact'
import Donate from './sections/Invest'
import Testimonials from './sections/Testimonials'
import Team from './sections/Team'
import Roadmap from './sections/Roadmap'
import FAQ from './sections/FAQ'
import Contact from './sections/Contact'
import './App.css'

export default function App() {
    const [modalOpen, setModalOpen] = useState(false)
    const [prefillAmount, setPrefillAmount] = useState('')

    const openDonate = useCallback((amount = '') => {
        setPrefillAmount(amount)
        setModalOpen(true)
    }, [])

    return (
        <div className="app">
            <Header onDonate={() => openDonate()} />
            <main>
                <Hero onDonate={openDonate} />
                <About />
                <Impact onDonate={openDonate} />
                <Donate onDonate={openDonate} />
                <Testimonials onDonate={() => openDonate()} />
                <Team />
                <Roadmap />
                <FAQ />
                <Contact />
            </main>
            <Footer />
            <StickyDonate onDonate={() => openDonate()} />
            <DonationFeed />
            <DonateModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                prefillAmount={prefillAmount}
            />
            <Analytics />
        </div>
    )
}


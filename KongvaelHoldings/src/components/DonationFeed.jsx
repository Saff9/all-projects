import { useState, useEffect } from 'react'
import './DonationFeed.css'

const donorNames = [
    'Aarav S.', 'Priya M.', 'Rohan K.', 'Sneha T.', 'Vikram J.',
    'Ananya P.', 'Karthik R.', 'Meera D.', 'Arjun B.', 'Riya G.',
    'Sameer N.', 'Pooja L.', 'Aditya V.', 'Nisha C.', 'Rahul H.',
]

const amounts = [
    '₹500', '₹1,000', '₹2,000', '₹5,000', '₹750',
    '₹10,000', '₹1,500', '₹3,000', '₹2,500',
]

const timeAgo = [
    '2 mins ago', '5 mins ago', '8 mins ago', '12 mins ago',
    '15 mins ago', '22 mins ago', '30 mins ago',
]

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

export default function DonationFeed() {
    const [notification, setNotification] = useState(null)
    const [show, setShow] = useState(false)

    useEffect(() => {
        const showNotification = () => {
            const donor = {
                name: getRandomItem(donorNames),
                amount: getRandomItem(amounts),
                time: getRandomItem(timeAgo),
            }
            setNotification(donor)
            setShow(true)
            setTimeout(() => setShow(false), 5000)
        }

        const firstTimeout = setTimeout(showNotification, 5000)
        const interval = setInterval(showNotification, 10000 + Math.random() * 8000)

        return () => {
            clearTimeout(firstTimeout)
            clearInterval(interval)
        }
    }, [])

    if (!show || !notification) return null

    return (
        <div className="donation-feed">
            <div className="donation-toast">
                <span className="donation-toast__heart">❤️</span>
                <div className="donation-toast__content">
                    <p className="donation-toast__name">
                        {notification.name} donated <span className="donation-toast__amount">{notification.amount}</span>
                    </p>
                    <span className="donation-toast__time">{notification.time}</span>
                </div>
            </div>
        </div>
    )
}

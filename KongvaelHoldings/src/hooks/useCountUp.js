import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 2000, startOnVisible = true) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (!startOnVisible) {
            animate()
            return
        }

        const node = ref.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true
                    animate()
                }
            },
            { threshold: 0.3 }
        )

        observer.observe(node)
        return () => observer.unobserve(node)
    }, [end, duration])

    function animate() {
        const startTime = performance.now()
        const step = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }
        requestAnimationFrame(step)
    }

    return { count, ref }
}

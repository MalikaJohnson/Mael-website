import { useEffect, useState } from 'react'
import { CinematicCanvas } from '../components/canvas/CinematicCanvas'
import './App.css'

export default function App() {
  const [presenceProgress, setPresenceProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      frame = 0
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const progress = Math.min(window.scrollY / maxScroll, 1)
      setPresenceProgress(progress)
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <main className="mael-app">
      <CinematicCanvas presenceProgress={presenceProgress} />
      <div className="mael-sr-status" aria-live="polite">
        Mael cinematic experience
      </div>
    </main>
  )
}

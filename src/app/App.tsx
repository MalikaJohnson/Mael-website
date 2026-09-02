import { CinematicCanvas } from '../components/canvas/CinematicCanvas'
import './App.css'

export default function App() {
  return (
    <main className="mael-app">
      <CinematicCanvas />
      <div className="mael-sr-status" aria-live="polite">
        Mael cinematic experience
      </div>
    </main>
  )
}

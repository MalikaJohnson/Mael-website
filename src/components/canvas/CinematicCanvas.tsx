import { Canvas } from '@react-three/fiber'
import { Camera } from './Camera'
import { Lighting } from './Lighting'

export function CinematicCanvas() {
  return (
    <div className="cinematic-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 2000 }}
      >
        <color attach="background" args={['#000000']} />
        <Camera />
        <Lighting />
      </Canvas>
    </div>
  )
}

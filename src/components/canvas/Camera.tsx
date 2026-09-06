import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraProps {
  presenceProgress?: number
}

export function Camera({ presenceProgress = 0 }: CameraProps) {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    const progress = THREE.MathUtils.clamp(presenceProgress, 0, 1)

    // The visitor is carried through the space rather than directly steering it.
    const driftX = Math.sin(elapsed * 0.11) * 0.035
    const driftY = Math.cos(elapsed * 0.09) * 0.025
    const awarenessPull = THREE.MathUtils.smoothstep(progress, 0.2, 0.8)

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, driftX, 0.025)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, driftY - awarenessPull * 0.06, 0.025)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10 - awarenessPull * 0.22, 0.02)

    camera.lookAt(0, -0.25 - awarenessPull * 0.08, -4.5)
  })

  return null
}

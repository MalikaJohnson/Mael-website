import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 1400

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      const radius = Math.pow(Math.random(), 0.55) * 48 + 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))

      positions[i3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i3 + 1] = Math.cos(phi) * radius * 0.68
      positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius

      sizes[i] = Math.random() * 1.4 + 0.35
      phases[i] = Math.random() * Math.PI * 2
    }

    return { positions, sizes, phases }
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#d8d4cc',
        size: 0.055,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const points = pointsRef.current
    if (!points) return

    const elapsed = clock.getElapsedTime()
    points.rotation.y = elapsed * 0.0025
    points.rotation.x = Math.sin(elapsed * 0.045) * 0.008

    const geometry = points.geometry
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      const phase = phases[i]
      const baseY = positions[i3 + 1]
      const drift = Math.sin(elapsed * 0.055 + phase) * 0.018
      attribute.array[i3 + 1] = baseY + drift
    }

    attribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={new THREE.BufferGeometry()}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={PARTICLE_COUNT} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 2200

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const phases = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      const radius = Math.pow(Math.random(), 0.62) * 32 + 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))

      positions[i3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i3 + 1] = Math.cos(phi) * radius * 0.58
      positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      phases[i] = Math.random() * Math.PI * 2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry, phases }
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#d8d4cc',
        size: 0.085,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const points = pointsRef.current
    if (!points) return

    const elapsed = clock.getElapsedTime()
    points.rotation.y = elapsed * 0.004
    points.rotation.x = Math.sin(elapsed * 0.04) * 0.012

    const attribute = points.geometry.getAttribute('position') as THREE.BufferAttribute
    const array = attribute.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      array[i3 + 1] += Math.sin(elapsed * 0.065 + phases[i]) * 0.0007
    }

    attribute.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}

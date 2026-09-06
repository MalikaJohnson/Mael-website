import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HorizonProps {
  progress?: number
}

type HorizonFragment = {
  geometry: THREE.BufferGeometry
  material: THREE.LineBasicMaterial
  phase: number
  strength: number
}

export function Horizon({ progress = 0 }: HorizonProps) {
  const groupRef = useRef<THREE.Group>(null)

  const fragments = useMemo<HorizonFragment[]>(() => {
    const fragmentSpecs = [
      { start: 0.12, length: 0.32, phase: 0.7, strength: 0.9 },
      { start: 1.18, length: 0.22, phase: 2.4, strength: 0.52 },
      { start: 2.02, length: 0.38, phase: 4.1, strength: 0.72 },
      { start: 3.32, length: 0.18, phase: 1.6, strength: 0.38 },
      { start: 4.08, length: 0.28, phase: 5.2, strength: 0.64 },
      { start: 5.28, length: 0.24, phase: 3.3, strength: 0.48 },
    ]

    return fragmentSpecs.map(({ start, length, phase, strength }) => {
      const points: THREE.Vector3[] = []
      const segments = 28

      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments
        const angle = start + t * length
        const wave =
          Math.sin(angle * 2.7 + phase) * 0.055 +
          Math.sin(angle * 6.1 - phase * 0.7) * 0.025
        const radius = 3.35 + wave
        const vertical = 0.38 + Math.sin(angle * 2.2 + phase) * 0.035

        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * vertical,
            -7.5 + Math.sin(angle * 1.7 + phase) * 0.11,
          ),
        )
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color('#b59a62'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      return { geometry, material, phase, strength }
    })
  }, [])

  useFrame(({ clock }) => {
    const target = THREE.MathUtils.clamp(progress, 0, 1)
    const emergence = THREE.MathUtils.smoothstep(target, 0.2, 0.72)
    const time = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(time * 0.23) * 0.012
      groupRef.current.rotation.y = Math.sin(time * 0.11) * 0.018
      groupRef.current.position.x = Math.sin(time * 0.17) * 0.012
    }

    fragments.forEach(({ material, phase, strength }) => {
      const shimmer = 0.72 + Math.sin(time * 0.46 + phase) * 0.28
      const targetOpacity = emergence * 0.17 * strength * shimmer
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.045)
    })
  })

  return (
    <group ref={groupRef}>
      {fragments.map(({ geometry, material }, index) => (
        <line key={index} geometry={geometry} material={material} />
      ))}
    </group>
  )
}

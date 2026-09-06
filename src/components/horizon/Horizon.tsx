import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HorizonProps {
  progress?: number
}

export function Horizon({ progress = 0 }: HorizonProps) {
  const lineRef = useRef<THREE.Line>(null)
  const glowRef = useRef<THREE.Line>(null)

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const segments = 192

    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2
      const irregularity =
        1 +
        Math.sin(angle * 3.0 + 0.8) * 0.025 +
        Math.sin(angle * 7.0 - 0.4) * 0.012
      const radius = 3.35 * irregularity
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.38,
          -7.5 + Math.sin(angle * 2.0) * 0.08,
        ),
      )
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#c7a86b'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  const glowMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#80663b'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const target = THREE.MathUtils.clamp(progress, 0, 1)
    const emergence = THREE.MathUtils.smoothstep(target, 0.18, 0.7)
    const breathing = Math.sin(clock.getElapsedTime() * 0.28) * 0.018

    material.opacity = THREE.MathUtils.lerp(material.opacity, emergence * 0.42, 0.035)
    glowMaterial.opacity = THREE.MathUtils.lerp(glowMaterial.opacity, emergence * 0.11, 0.035)

    if (lineRef.current) {
      lineRef.current.rotation.z = breathing
      lineRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.012
    }

    if (glowRef.current) {
      glowRef.current.rotation.z = breathing
      glowRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.012
      glowRef.current.scale.setScalar(1.018)
    }
  })

  return (
    <group>
      <line ref={glowRef} geometry={geometry} material={glowMaterial} />
      <line ref={lineRef} geometry={geometry} material={material} />
    </group>
  )
}

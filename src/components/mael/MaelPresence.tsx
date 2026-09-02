import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Scene 01 / 002 — The Presence.
 * Mael is intentionally not a readable character yet. The scene only
 * suggests an enormous presence through a translucent spatial silhouette.
 */
export function MaelPresence() {
  const groupRef = useRef<THREE.Group>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vWorldPosition;

          void main() {
            // Almost invisible atmospheric material: a suggestion, not a body.
            float verticalFade = smoothstep(-8.0, -1.5, vWorldPosition.y) *
              (1.0 - smoothstep(4.0, 9.0, vWorldPosition.y));
            float breathing = 0.82 + sin(uTime * 0.22) * 0.06;
            float alpha = verticalFade * 0.055 * breathing;
            gl_FragColor = vec4(vec3(0.70, 0.72, 0.74), alpha);
          }
        `,
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    material.uniforms.uTime.value = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.08) * 0.015
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.06) * 0.015
  })

  return (
    <group ref={groupRef} position={[0, -1.8, -7.5]} scale={[2.8, 4.8, 1.7]}>
      <mesh material={material}>
        <sphereGeometry args={[1, 48, 32]} />
      </mesh>
      <mesh position={[0, 0.25, 0.08]} scale={[0.58, 0.78, 0.52]} material={material}>
        <sphereGeometry args={[1, 40, 28]} />
      </mesh>
    </group>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 2200

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, phases, sizes, brightness } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const phases = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const brightness = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      const radius = Math.pow(Math.random(), 0.62) * 32 + 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))

      positions[i3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i3 + 1] = Math.cos(phi) * radius * 0.58
      positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      phases[i] = Math.random() * Math.PI * 2

      // Most stars are tiny points; only a small minority are brighter.
      sizes[i] = THREE.MathUtils.lerp(0.42, 1.05, Math.pow(Math.random(), 2.8))
      brightness[i] = THREE.MathUtils.lerp(0.28, 0.9, Math.pow(Math.random(), 3.2))
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
    return { geometry, phases, sizes, brightness }
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aBrightness;
          varying float vBrightness;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float depthScale = 70.0 / max(-mvPosition.z, 1.0);
            gl_PointSize = max(0.65, aSize * depthScale);
            vBrightness = aBrightness;
          }
        `,
        fragmentShader: `
          varying float vBrightness;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float distanceFromCenter = length(centered);

            // A tiny stellar core with only a whisper of surrounding light.
            float core = 1.0 - smoothstep(0.05, 0.22, distanceFromCenter);
            float halo = 1.0 - smoothstep(0.12, 0.5, distanceFromCenter);
            float alpha = (core * 0.95 + halo * 0.08) * vBrightness;

            if (alpha < 0.012) discard;
            gl_FragColor = vec4(vec3(0.88, 0.86, 0.81), alpha);
          }
        `,
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

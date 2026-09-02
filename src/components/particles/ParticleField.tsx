import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 2200
const PRESENCE_CENTER = new THREE.Vector3(0, -0.9, -7.5)

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, phases } = useMemo(() => {
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

      sizes[i] = THREE.MathUtils.lerp(0.42, 1.05, Math.pow(Math.random(), 2.8))
      brightness[i] = THREE.MathUtils.lerp(0.28, 0.9, Math.pow(Math.random(), 3.2))
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
    return { geometry, phases }
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uPresenceCenter: { value: PRESENCE_CENTER },
          uPresenceStrength: { value: 0.42 },
          uOrbitStrength: { value: 0.12 },
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aBrightness;
          uniform vec3 uPresenceCenter;
          uniform float uPresenceStrength;
          uniform float uOrbitStrength;
          uniform float uTime;
          varying float vBrightness;

          mat2 rotate(float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return mat2(c, -s, s, c);
          }

          void main() {
            vec3 displaced = position;
            vec3 fromPresence = position - uPresenceCenter;
            float distanceToPresence = length(fromPresence);

            // Mael is felt first as a gravitational absence. The field bends
            // around an unresolved center instead of revealing an object.
            float influence = 1.0 - smoothstep(1.5, 16.5, distanceToPresence);
            float orbitalZone = 1.0 - smoothstep(2.0, 11.5, distanceToPresence);
            float coreVoid = 1.0 - smoothstep(1.8, 4.8, distanceToPresence);

            vec3 radial = normalize(fromPresence + vec3(0.0001));

            // Nearby stars accelerate into curved paths around the presence.
            float orbitAngle = uTime * 0.075 * influence * orbitalZone;
            vec2 orbitXZ = rotate(orbitAngle) * fromPresence.xz;
            vec3 orbitalPosition = vec3(orbitXZ.x, fromPresence.y, orbitXZ.y) + uPresenceCenter;

            // Pull the surrounding field inward, but preserve a dark center.
            // The resulting negative space makes the unseen mass readable.
            displaced = mix(displaced, orbitalPosition, influence * 0.72);
            displaced -= radial * influence * uPresenceStrength * 0.72;
            displaced += radial * coreVoid * 0.62;

            // Add a subtle second-order arc so the field does not read as a
            // simple radial vortex or a visible ring.
            vec3 tangent = normalize(vec3(-fromPresence.z, 0.0, fromPresence.x) + vec3(0.0001));
            displaced += tangent * influence * orbitalZone * uOrbitStrength * 2.2;

            vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
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
    material.uniforms.uTime.value = elapsed
    points.rotation.y = elapsed * 0.0025
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

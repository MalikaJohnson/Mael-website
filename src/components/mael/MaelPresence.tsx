import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Scene 01 / 002 — The Presence.
 *
 * Mael is not rendered as a visible object here. Presence is expressed by
 * the environment: the particle field receives a gravitational influence
 * from an unseen point in space. This component reserves the scene-level
 * presence hook without introducing a readable silhouette too early.
 */
export function MaelPresence() {
  useEffect(() => {
    // Keep the spatial anchor explicit so the next scene can animate it
    // without replacing the particle field or introducing a new world.
    const anchor = new THREE.Vector3(0, -0.9, -7.5)
    return () => anchor.set(0, 0, 0)
  }, [])

  return null
}

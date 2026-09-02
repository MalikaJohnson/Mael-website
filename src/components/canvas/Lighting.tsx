import { AmbientLight, PointLight } from 'three'

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 4]} intensity={0.15} distance={30} />
    </>
  )
}

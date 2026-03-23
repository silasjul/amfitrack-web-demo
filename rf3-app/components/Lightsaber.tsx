"use client"

import { useGLTF } from '@react-three/drei'

export default function Lightsaber() {
  const { scene } = useGLTF('models/Lightsaber/scene.gltf')

  return ( 
    <primitive scale={0.3} object={scene} rotation-y={Math.PI / 2} />
  )
}

'use client'

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useLayoutEffect } from 'react'

export default function FlightHelmet() {
  const { scene } = useGLTF('models/FlightHelmet/glTF/FlightHelmet.gltf')

  useLayoutEffect(() => {
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [scene])
  
  return <primitive position={[0, -0.35, 0]} object={scene} />
}
"use client";

import { useGLTF, Center } from "@react-three/drei";
import LightsaberPlasma from "./LightsaberPlasma";

export default function Lightsaber() {
  const { scene } = useGLTF("models/Lightsaber/scene.gltf");

  return (
    <>
      <LightsaberPlasma />
      <Center>
        <primitive object={scene} scale={0.3} rotation-y={Math.PI / 2} />
      </Center>
    </>
  );
}

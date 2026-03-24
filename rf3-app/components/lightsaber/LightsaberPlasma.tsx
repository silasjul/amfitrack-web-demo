"use client";

import { useControls, folder } from "leva";

export default function LightsaberPlasma() {
  const { color, offset, length, radius } = useControls({
    lightsaber: folder({
      color: {
        value: "red",
      },
      offset: {
        value: -0.9,
        min: -2,
        max: 0,
      },
      length: {
        value: 1.5,
        min: 0,
        max: 2,
      },
      radius: {
        value: 0.02,
        min: 0.001,
        max: 0.05,
      },
    }),
  });

  return (
    <mesh rotation-x={Math.PI / 2} position-z={offset}>
      <cylinderGeometry args={[radius, radius, length, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

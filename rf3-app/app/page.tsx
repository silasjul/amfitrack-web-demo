"use client";

import * as THREE from 'three';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PivotControls } from "@react-three/drei";
import { useControls, folder, button, monitor } from "leva";
import FlightHelmet from "@/components/FlightHelmet";
import Lightsaber from "@/components/Lightsaber";
import Light from "@/components/Light";
import { useState } from 'react';
import { useSensorTracking } from "@/hooks/useSensorTracking";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const { modelRef, resetCenter } = useSensorTracking();

  const {
    mode,
    exposure,
    enabled,
    pivotOffsetX,
    pivotOffsetY,
    pivotOffsetZ,
    files,
    model,
  } = useControls({
    toneMapping: folder({
      mode: {
        value: THREE.ReinhardToneMapping as THREE.ToneMapping,
        options: {
          None: THREE.NoToneMapping,
          Linear: THREE.LinearToneMapping, // Default
          Reinhard: THREE.ReinhardToneMapping,
          Cineon: THREE.CineonToneMapping,
          ACESFilmic: THREE.ACESFilmicToneMapping,
        },
      },
      exposure: {
        value: 3,
        min: 0,
        max: 10,
      },
    }),
    pivotControls: folder({
      enabled: {
        value: false,
      },
      pivotOffsetX: {
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        label: "X",
      },
      pivotOffsetY: {
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        label: "Y",
      },
      pivotOffsetZ: {
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        label: "Z",
      },
    }),
    environment: folder({
      files: {
        value: "environmentMaps/Deathstar_Hanger_4k.hdr",
        options: {
          "Crashed Star Destroyer": "environmentMaps/CrashedStarDestroyer_4k.hdr",
          "Death Star Hangar": "environmentMaps/Deathstar_Hanger_4k.hdr",
          "Death Star Tractor Beam": "environmentMaps/DeathStar_TractorBeam_4k.hdr",
          "Jabba's Throne Room": "environmentMaps/JabbaTHroneRoom_4k.hdr",
          "Maz's Castle": "environmentMaps/MazCastle_4k.hdr",
          "Mos Eisley Cantina": "environmentMaps/MosEisleyCanteen_4k.hdr",
          "Rebel Base": "environmentMaps/RebelBase_4k.hdr",
        },
      },
    }),
    model: folder({
      model: {
        options: {
          "Light Saber": <Lightsaber />,
          "Flight Helmet": <FlightHelmet />,
        },
      },
    }),
    calibration: folder({
      resetCenter: button(() => {
        resetCenter();
      }),
    }),
  });

  return (
    <div className="relative h-screen w-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.25, 0.75], near: 0.1, far: 1000 }}
        gl={{ toneMapping: mode, toneMappingExposure: exposure }}
      >
        <OrbitControls enabled={!isDragging} />
        <Environment files={files} background />
        <Light />
          <group ref={modelRef}>
            <PivotControls enabled={enabled} scale={0.6} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)}>
              <group position={[pivotOffsetX, pivotOffsetY, pivotOffsetZ]}>
                {model}
              </group>
            </PivotControls>
          </group>
      </Canvas>
    </div>
  );
}

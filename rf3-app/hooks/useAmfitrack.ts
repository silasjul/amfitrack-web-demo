"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AmfitrackWeb } from "@/amfitrackWebSDK";
import { PRODUCT_ID_SENSOR, PRODUCT_ID_SOURCE } from "@/amfitrackWebSDK/config";

const POSITION_SCALE = 0.01;

export function useAmfitrack(positionScale: number = POSITION_SCALE) {
  /**
   * State
   */
  const amfitrackWebRef = useRef(new AmfitrackWeb());
  const modelRef = useRef<THREE.Group | null>(null);

  // Devices
  const hubRef = useRef<HIDDevice | null>(null);
  const sourceRef = useRef<HIDDevice | null>(null);

  const [status, setStatus] = useState("Disconnected");
  const [devices, setDevices] = useState<HIDDevice[]>([]);

  // Position
  const latestSensorPositionRef = useRef(new THREE.Vector3());
  const centerOffsetRef = useRef(new THREE.Vector3());

  // Rotation
  const rotationOffsetRef = useRef(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0, "XYZ")),
  );

  /**
   * Methods
   */
  const resetCenter = useCallback(() => {
    centerOffsetRef.current.copy(latestSensorPositionRef.current);
    if (modelRef.current) {
      modelRef.current.position.set(0, 0, 0);
    }
  }, []);

  const requestConnectionDevice = useCallback(async () => {
    const device = await amfitrackWebRef.current.requestConnection();
    if (device?.productId === PRODUCT_ID_SENSOR) {
      hubRef.current = device;
    } else if (device?.productId === PRODUCT_ID_SOURCE) {
      sourceRef.current = device;
    }
  }, []);

  const autoConnectAuthorizedDevices = async () => {
    const devices =
      await amfitrackWebRef.current.autoConnectAuthorizedDevices();
    if (devices) {
      setDevices(devices);
    }
    setStatus("Connected");
  };
  
  useEffect(() => {
    autoConnectAuthorizedDevices();
  }, [])

  // useEffect(() => {
  //   const sensor = null;

  //   // sensor position
  //   const sensorPosition = new THREE.Vector3(
  //     -sensor.position.y,
  //     sensor.position.z,
  //     -sensor.position.x,
  //   ); // remaps sensor coordinates to threejs coordinates
  //   latestSensorPositionRef.current.copy(sensorPosition);

  //   const relativePosition = sensorPosition
  //     .clone()
  //     .sub(centerOffsetRef.current);
  //   const modelPosition = relativePosition
  //     .clone()
  //     .multiplyScalar(positionScale);
  //   modelRef.current.position.copy(modelPosition);

  //   // sensor quaternion
  //   const sensorQuaternion = new THREE.Quaternion(
  //     -sensor.quaternion.y,
  //     sensor.quaternion.z,
  //     -sensor.quaternion.x,
  //     sensor.quaternion.w,
  //   ).normalize();
  //   sensorQuaternion.multiply(rotationOffsetRef.current);
  //   modelRef.current.quaternion.copy(sensorQuaternion);
  // }, []);

  return {
    modelRef,
    resetCenter,
  };
}

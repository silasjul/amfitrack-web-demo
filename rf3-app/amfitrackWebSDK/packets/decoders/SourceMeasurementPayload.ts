import { IPayloadDecoder } from "../PacketDecoder";

type SourceMeasurementData = ReturnType<SourceMeasurementPayload["getDecoded"]>;

export class SourceMeasurementPayload implements IPayloadDecoder<SourceMeasurementData> {
  public getDecoded(payload: Uint8Array) {
    const view = new DataView(
      payload.buffer,
      payload.byteOffset,
      payload.byteLength,
    );
    const LE = true;

    const current = {
      x: view.getFloat32(0, LE),
      y: view.getFloat32(4, LE),
      z: view.getFloat32(8, LE),
    };

    const imu = {
      acc_x: view.getInt16(12, LE) * 0.000122, // In g
      acc_y: view.getInt16(14, LE) * 0.000122,
      acc_z: view.getInt16(16, LE) * 0.000122,
      gyro_x: view.getInt16(18, LE) * 0.07, // In deg per sec
      gyro_y: view.getInt16(20, LE) * 0.07,
      gyro_z: view.getInt16(22, LE) * 0.07,
    };

    const MAG_SCALE = 0.012207;
    const magneto = {
      mag_x: view.getInt16(24, LE) * MAG_SCALE,
      mag_y: view.getInt16(26, LE) * MAG_SCALE,
      mag_z: view.getInt16(28, LE) * MAG_SCALE,
    };

    const temperature = payload[30] * 0.5 - 30;
    const sourceStatus = payload[31];
    const sourceState = payload[32];
    const rssi = payload[33];

    const frameId = payload[34] | (payload[35] << 8) | (payload[36] << 16);

    let voltage = [0, 0, 0, 0];

    // when voltage is available
    if (payload.length > 37) {
      voltage = [
        view.getFloat32(37, LE),
        view.getFloat32(41, LE),
        view.getFloat32(45, LE),
        view.getFloat32(49, LE),
      ];
    }

    return {
      current,
      imu,
      magneto,
      temperature,
      sourceStatus,
      sourceState,
      rssi,
      frameId,
      voltage,
    };
  }
}
import { IPayloadDecoder } from "../PacketDecoder";
import { LE } from "../../config";

export type EmfImuFrameIdData = ReturnType<EmfImuFrameIdPayload["getDecoded"]>;

export class EmfImuFrameIdPayload implements IPayloadDecoder<EmfImuFrameIdData> {
  public getDecoded(payload: Uint8Array) {
    return null;
  }
}

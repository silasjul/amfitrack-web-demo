import { Packet } from "./Packet";
import { SourceMeasurementPayload } from "./decoders/SourceMeasurementPayload";

enum PayloadType {
  SOURCE_MEASUREMENT = 0x24,
}

export interface IPayloadDecoder<T> {
  getDecoded(payload: Uint8Array): T;
}

export class PacketDecoder {
  private packet: Packet;
  private payloadType: PayloadType;

  constructor(packet: Packet) {
    this.packet = packet;
    this.payloadType = packet.getHeader()[3] as PayloadType;
  }

  public getDecodedHeader() {
    const headerBytes = this.packet.getHeader();

    // | Bits [7:6]: 0 = NoAck, 1 = Request Ack, 2 = Ack, 3 = Reply.
    // | Bits [5:0]: Time to live for packet routing.

    return {
      payloadLength: headerBytes[0], // Length of payload including CRC, in bytes.
      packetType: headerBytes[1],
      packetNumber: headerBytes[2], // Sequentially increasing packet number, used when sending back ack.
      payloadType: this.payloadType,
      sourceTxId: headerBytes[4],
      destinationTxId: headerBytes[5],
      crc: headerBytes[6],
    };
  }

  public getDecodedPayload() {
    const payloadBytes = this.packet.getPayload();

    switch (this.payloadType) {
      case PayloadType.SOURCE_MEASUREMENT:
        return new SourceMeasurementPayload().getDecoded(payloadBytes);
      default:
        throw new Error(`Unknown payload type: ${this.payloadType}`);
    }
  }

  public getPayloadType() {
    return this.payloadType;
  }
}

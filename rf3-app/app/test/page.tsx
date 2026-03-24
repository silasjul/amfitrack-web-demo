"use client";

import AmfitrackWeb from "@/amfitrackWebSDK/AmfitrackWeb";
import React, { useRef } from "react";

export default function page() {
  const amfitrackWebRef = useRef(new AmfitrackWeb());

  const getPacketHeader = () => {
    const PAYLOAD_LENGTH = 0;
    // Length of payload including CRC, in bytes.
    const PACKET_TYPE = 1;
    // | Bits [7:6]: 0 = NoAck, 1 = Request Ack, 2 = Ack, 3 = Reply.
    // | Bits [5:0]: Time to live for packet routing.
    const PACKET_NUMBER = 2;
    // Sequentially increasing packet number, used when sending back ack.
    const PAYLOAD_TYPE = 3;
    // See :class:`amfiprot.payload.PayloadType`
    const SOURCE_TX_ID = 4;
    const DESTINATION_TX_ID = 5;
  };

  const packet = new Uint8Array([
    61, 53, 0, 100, 36, 252, 255, 217, 234, 2, 50, 68, 114, 108, 7, 68, 21, 149,
    28, 68, 152, 255, 91, 1, 77, 32, 0, 0, 8, 0, 254, 255, 202, 255, 227, 255,
    127, 255, 230, 1, 0, 0, 103, 39, 13, 77, 107, 25, 66, 226, 247, 25, 66, 129,
    109, 28, 66, 97, 201, 50, 66, 172, 0,
  ]);

  return <div>test page</div>;
}

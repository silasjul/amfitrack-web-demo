"use client";

import AmfitrackWeb from "@/amfitrackWebSDK/AmfitrackWeb";
import React, { useRef } from "react";

export default function page() {
  const amfitrackWebRef = useRef(new AmfitrackWeb());

  return <div>test page</div>;
}

import threading
import time
from typing import Any

import amfiprot
import amfiprot_amfitrack as amfitrack

VENDOR_ID = 0xC17
PRODUCT_ID_SENSOR = 0xD12
PRODUCT_ID_SOURCE = 0xD01


class AmfitrackSensorReader:
    """Continuously reads AMFITRACK sensor packets in a background thread."""

    def __init__(self) -> None:
        self._conn: amfiprot.USBConnection | None = None
        self._sensor_devices: list[amfitrack.Device] = []
        self._latest_by_id: dict[int, dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._running = False
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._running:
            return

        self._conn = self._connect()
        nodes = self._conn.find_nodes()
        devices: list[amfitrack.Device] = []
        sensors: list[amfitrack.Device] = []

        print(f"Found {len(nodes)} node(s).")
        for node in nodes:
            print(f"[{node.tx_id}] {node.name}")
            dev = amfitrack.Device(node)
            devices.append(dev)
            if dev.name() == "Amfitrack Sensor":
                sensors.append(dev)

        self._sensor_devices = sensors
        self._conn.start()

        print(f"Found {len(devices)} device(s).")
        print(f"Found {len(self._sensor_devices)} sensor device(s).")

        self._running = True
        self._thread = threading.Thread(target=self._read_loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._running = False

    def get_latest_frames(self) -> list[dict[str, Any]]:
        with self._lock:
            return [self._latest_by_id[key].copy() for key in sorted(self._latest_by_id)]

    def _connect(self) -> amfiprot.USBConnection:
        try:
            return amfiprot.USBConnection(VENDOR_ID, PRODUCT_ID_SENSOR)
        except Exception:
            try:
                return amfiprot.USBConnection(VENDOR_ID, PRODUCT_ID_SOURCE)
            except Exception as exc:
                raise RuntimeError("No AMFITRACK device found") from exc

    def _read_loop(self) -> None:
        while self._running:
            has_packet = False
            for idx, dev in enumerate(self._sensor_devices):
                if not dev.packet_available():
                    continue

                has_packet = True
                packet = dev.get_packet()
                if not isinstance(packet.payload, amfitrack.payload.EmfImuFrameIdPayload):
                    continue

                payload = packet.payload
                data = {
                    "id": idx,
                    "timestamp": time.time(),
                    "position": {
                        "x": payload.emf.pos_x,
                        "y": payload.emf.pos_y,
                        "z": payload.emf.pos_z,
                    },
                    "quaternion": {
                        "x": payload.emf.quat_x,
                        "y": payload.emf.quat_y,
                        "z": payload.emf.quat_z,
                        "w": payload.emf.quat_w,
                    },
                }

                with self._lock:
                    self._latest_by_id[idx] = data

            if not has_packet:
                # Small sleep to avoid busy-looping if no packets are available.
                time.sleep(0.001)
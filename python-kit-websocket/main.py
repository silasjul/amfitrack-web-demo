import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from src.amfitrack import AmfitrackSensorReader

STREAM_RATE_HZ = 120.0
STREAM_INTERVAL_SEC = 1.0 / STREAM_RATE_HZ

sensor_reader = AmfitrackSensorReader()


@asynccontextmanager
async def lifespan(_: FastAPI):
    sensor_reader_started = False
    try:
        try:
            sensor_reader.start()
            sensor_reader_started = True
        except RuntimeError as exc:
            print(str(exc))
        yield
    finally:
        if sensor_reader_started:
            sensor_reader.stop()


app = FastAPI(title="AMFITRACK Sensor WebSocket", lifespan=lifespan)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/sensors")
async def stream_sensors(websocket: WebSocket) -> None:
    await websocket.accept()
    loop = asyncio.get_running_loop()
    next_tick = loop.time()

    try:
        while True:
            frames = sensor_reader.get_latest_frames()
            await websocket.send_json(
                {
                    "timestamp": time.time(),
                    "rate_hz": STREAM_RATE_HZ,
                    "sensors": frames,
                }
            )

            next_tick += STREAM_INTERVAL_SEC
            sleep_for = next_tick - loop.time()
            if sleep_for > 0:
                await asyncio.sleep(sleep_for)
            else:
                # If we're behind schedule, reset cadence from now.
                next_tick = loop.time()
    except WebSocketDisconnect:
        return

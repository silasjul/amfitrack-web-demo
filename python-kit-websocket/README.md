# AMFITRACK FastAPI WebSocket (120Hz)

This project exposes AMFITRACK sensor data over a WebSocket stream at **120 messages/second**.

## Run

From project root in PowerShell:

```powershell
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

WebSocket endpoint:

`ws://localhost:8000/ws/sensors`

Health endpoint:

`http://localhost:8000/health`

## Message shape

Each WebSocket message is JSON like:

```json
{
  "timestamp": 1763930351.34,
  "rate_hz": 120.0,
  "sensors": [
    {
      "id": 0,
      "timestamp": 1763930351.33,
      "position": { "x": 0.12, "y": 0.03, "z": 0.91 },
      "quaternion": { "x": 0.0, "y": 0.0, "z": 0.71, "w": 0.70 }
    }
  ]
}
```

## How data is sent

Data is sent from the server with:

```python
await websocket.send_json(
    {
        "timestamp": time.time(),
        "rate_hz": 120.0,
        "sensors": frames,
    }
)
```

The loop runs every `1/120` seconds.

## JS client example (receive stream)

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/sensors");

ws.onopen = () => console.log("Connected");
ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log(payload.sensors);
};
ws.onclose = () => console.log("Disconnected");
```

# RoadScanAI — Backend

FastAPI backend for RoadScanAI, a pothole detection and severity classification system. Receives GPS-tagged pothole alerts from an ESP32-CAM (running a MobileNetV2 classifier), deduplicates/clusters nearby detections, and serves unfixed potholes to a frontend dashboard.

## Tech Stack

- **API**: FastAPI
- **Database**: PostgreSQL, hosted on [Neon](https://neon.tech) (Postgres 17)
- **ORM**: SQLAlchemy
- **Package manager**: [uv](https://docs.astral.sh/uv/)
- **Hardware**: ESP32-CAM (MobileNetV2 inference), NEO-6M GPS, GSM module

## Project Structure

```
roadscanai-backend/
│
├── app/
│   ├── main.py          # FastAPI app, routes, CORS config
│   ├── database.py      # Neon connection setup
│   ├── models.py        # SQLAlchemy tables: Detection, Pothole
│   ├── schemas.py        # Pydantic request/response models
│   └── crud.py             # Save + dedup/clustering logic
│
├── init_db.py              # Creates tables (run once)
├── reset_db.py              # Drops + recreates tables (dev/testing only)
├── pyproject.toml
├── uv.lock
├── .env                       # DATABASE_URL (not committed)
└── .gitignore
```

## Setup

1. Clone the repo and install dependencies:
   ```bash
   uv sync
   ```

2. Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/roadscanai?sslmode=require
   ```
   Get this from your Neon project dashboard — use the **pooled** connection string (hostname contains `-pooler`).

3. Create the database tables:
   ```bash
   uv run python init_db.py
   ```

4. Run the server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

5. Open the interactive API docs:
   ```
   http://127.0.0.1:8000/docs
   ```

## How It Works

1. The ESP32-CAM captures a frame, runs inference locally (MobileNetV2, 4-class: normal/low/medium/high), and — if it detects damage — sends a JSON payload to `POST /api/v1/detections`, tagged with its current GPS location.
2. To avoid sending the same pothole multiple times in one pass, the ESP32 applies a **cooldown** (~8s) after each detection before capturing again.
3. The backend stores every raw detection, then checks if it's near (within ~8m) and recent (within ~4s) relative to an existing active pothole. This backend-side check is a **safety net** — it exists mainly to catch GSM retransmits or duplicate sends, not to do the primary deduplication (that's the ESP32's job).
   - If it matches an existing pothole: the pothole's `last_seen` and `detection_count` update. Severity is only ever **upgraded**, never downgraded, by a later reading (a `high` reading is never overwritten by a lower one from the same cluster).
   - If it doesn't match: a new pothole cluster is created.
4. The frontend dashboard polls `GET /api/v1/potholes/unfixed` on an interval (e.g. every 15–30s) to refresh the map with all currently active (unfixed) potholes.

## API Reference

### `POST /api/v1/detections`

Called by the ESP32-CAM whenever it detects road damage.

**Request body — this is the exact JSON the hardware sends:**

```json
{
  "device_id": "esp32cam_01",
  "seq": 1,
  "timestamp": "2026-07-10T06:43:46.929Z",
  "gps": {
    "lat": 27.7172,
    "lon": 85.3240,
    "hdop": 1.2,
    "fix": true,
    "speed_kmh": 20.5
  },
  "prediction": "high",
  "confidence": 0.91
}
```

| Field | Type | Notes |
|---|---|---|
| `device_id` | string | Identifies which ESP32-CAM unit sent this |
| `seq` | integer | Increments by 1 per send; used to detect dropped packets over GSM |
| `timestamp` | ISO 8601 datetime | From the NEO-6M GPS's UTC clock |
| `gps.lat` / `gps.lon` | float | Coordinates of the detection |
| `gps.hdop` | float | GPS fix quality; lower is better. Values > 5 are treated as unreliable and not clustered |
| `gps.fix` | boolean | Whether the GPS had a valid fix at time of capture |
| `gps.speed_kmh` | float | Vehicle speed, reported directly by the GPS module |
| `prediction` | string | One of: `normal`, `low`, `medium`, `high` |
| `confidence` | float | Confidence of the predicted class, 0–1 |

**Response:**

```json
{
  "status": "stored",
  "clustered": true
}
```

- `clustered: true` → this detection matched an existing nearby/recent pothole and was merged into it.
- `clustered: false` → this detection created a new pothole (or was an unreliable/normal reading that was logged but not clustered).

---

### `GET /api/v1/potholes/unfixed`

Called by the frontend dashboard, on a polling interval, to refresh the map.

**Response:**

```json
[
  {
    "id": 12,
    "lat": 27.7172,
    "lon": 85.3240,
    "severity": "high",
    "confidence": 0.91,
    "first_seen": "2026-07-10T09:12:00",
    "last_seen": "2026-07-10T09:14:22",
    "detection_count": 3,
    "status": "active"
  }
]
```

| Field | Notes |
|---|---|
| `severity` | Highest severity seen across all merged detections for this pothole — used for map color-coding |
| `first_seen` | Timestamp of the detection that first created this pothole cluster |
| `last_seen` | Timestamp of the most recent detection merged into this cluster |
| `detection_count` | How many raw detections were merged into this pothole |
| `status` | Always `"active"` for this endpoint — only unfixed potholes are returned |

Only potholes with `status: "active"` are returned. Fixed/resolved potholes are excluded automatically.

## Testing

Use the Swagger UI at `/docs` to send test payloads directly, or via curl:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/detections \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "esp32cam_01",
    "seq": 1,
    "timestamp": "2026-07-10T06:43:46.929Z",
    "gps": {"lat": 27.7172, "lon": 85.3240, "hdop": 1.2, "fix": true, "speed_kmh": 20.5},
    "prediction": "high",
    "confidence": 0.91
  }'
```

## Known Limitations

- Dedup uses plain Python + haversine distance rather than a spatial index (e.g. PostGIS) — fine at this project's scale, but won't scale to large datasets.
- Backend dedup only merges detections within a short time window (~4s). Repeated visits to the same physical pothole across separate trips (hours/days apart) currently create separate pothole entries rather than updating one persistent record.
- `prediction` values are not yet validated against the 4 allowed classes at the API layer — malformed values from firmware could cause a server error rather than a clean validation error.

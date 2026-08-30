from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta, datetime, timezone
from math import radians, sin, cos, sqrt, atan2

from app.models import Detection, Pothole
from app.schemas import DetectionPayload

# Nepal timezone (UTC+5:45)
NEPAL_TZ = timezone(timedelta(hours=5, minutes=45))

def get_nepal_time() -> datetime:
    """Get current time in Nepal timezone as naive datetime for DB storage."""
    utc_now = datetime.now(timezone.utc)
    nepal_now = utc_now.astimezone(NEPAL_TZ)
    return nepal_now.replace(tzinfo=None)  # Remove timezone info for DB

# Safety-net dedup only — the ESP32's capture cooldown handles primary dedup.
# This just catches GSM retransmits or accidental duplicate sends.
DEDUP_DISTANCE_METERS = 8
DEDUP_TIME_WINDOW = timedelta(seconds=4)
MAX_HDOP = 5  # readings above this GPS error margin are treated as unreliable

SEVERITY_RANK = {"normal": 0, "low": 1, "medium": 2, "high": 3}


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points, in meters."""
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def save_detection(db: Session, payload: DetectionPayload) -> dict:
    reliable_gps = payload.gps.fix and payload.gps.hdop <= MAX_HDOP

    # Get current Nepal time (works correctly on any server timezone)
    server_timestamp = get_nepal_time()

    # Auto-generate seq per device (get max seq for this device + 1)
    max_seq = db.query(func.max(Detection.seq)).filter(
        Detection.device_id == payload.device_id
    ).scalar()
    next_seq = (max_seq or 0) + 1

    detection = Detection(
        device_id=payload.device_id,
        seq=next_seq,
        timestamp=server_timestamp,
        lat=payload.gps.lat,
        lon=payload.gps.lon,
        hdop=payload.gps.hdop,
        gps_fix=payload.gps.fix,
        speed_kmh=payload.gps.speed_kmh,
        prediction=payload.prediction,
        confidence=payload.confidence,
    )
    db.add(detection)

    # Unreliable GPS fix or a "no damage" reading — log it, but don't cluster it.
    if not reliable_gps or payload.prediction == "normal":
        db.commit()
        return {"status": "stored", "clustered": False}

    # Look for a recent, nearby active pothole to merge into (safety-net dedup).
    recent_active = (
        db.query(Pothole)
        .filter(
            Pothole.status == "active",
            Pothole.last_seen >= server_timestamp - DEDUP_TIME_WINDOW,
        )
        .all()
    )

    match = None
    for p in recent_active:
        if (
            haversine(p.lat, p.lon, payload.gps.lat, payload.gps.lon)
            <= DEDUP_DISTANCE_METERS
            
        ):
            match = p
            break

    if match:
        match.last_seen = server_timestamp
        match.detection_count += 1

        new_rank = SEVERITY_RANK[payload.prediction]
        current_rank = SEVERITY_RANK[match.severity]

        if new_rank > current_rank:
            # More severe reading — always take it, never downgrade later.
            match.severity = payload.prediction
            match.confidence = payload.confidence
        elif new_rank == current_rank and payload.confidence > match.confidence:
            # Same severity, but a more confident reading — keep the better one.
            match.confidence = payload.confidence

        detection.pothole_id = match.id
    else:
        new_pothole = Pothole(
            lat=payload.gps.lat,
            lon=payload.gps.lon,
            severity=payload.prediction,
            confidence=payload.confidence,
            first_seen=server_timestamp,
            last_seen=server_timestamp,
        )
        db.add(new_pothole)
        db.flush()  # populate new_pothole.id before commit
        detection.pothole_id = new_pothole.id

    db.commit()
    return {"status": "stored", "clustered": match is not None}


def get_unfixed_potholes(db: Session):
    """Active (unfixed) potholes — polled by the frontend dashboard."""
    return (
        db.query(Pothole)
        .filter(Pothole.status == "active")
        .order_by(Pothole.last_seen.desc())
        .all()
    )

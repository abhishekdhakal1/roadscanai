from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone, timedelta
from app.database import Base

# Nepal timezone (UTC+5:45)
NEPAL_TZ = timezone(timedelta(hours=5, minutes=45))

def get_nepal_time() -> datetime:
    """Get current time in Nepal timezone."""
    return datetime.now(timezone.utc).astimezone(NEPAL_TZ)


class Detection(Base):
    """Raw, unprocessed reading from the ESP32-CAM — one row per JSON received."""

    __tablename__ = "detections"

    id = Column(Integer, primary_key=True)
    device_id = Column(String, nullable=False)
    seq = Column(Integer, nullable=False)
    timestamp = Column(
        DateTime, nullable=False, default=get_nepal_time
    )  # server-side Nepal time

    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    hdop = Column(Float)
    gps_fix = Column(Boolean, default=False)
    speed_kmh = Column(Float)

    prediction = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    pothole_id = Column(Integer, ForeignKey("potholes.id"), nullable=True)


class Pothole(Base):
    """Deduplicated pothole cluster — what the dashboard displays."""

    __tablename__ = "potholes"

    id = Column(Integer, primary_key=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    severity = Column(String, nullable=False)  # normal | low | medium | high
    confidence = Column(Float, nullable=False)
    first_seen = Column(DateTime, nullable=False)
    last_seen = Column(DateTime, nullable=False)
    detection_count = Column(Integer, default=1)
    status = Column(String, default="active")  # active | fixed | false_positive

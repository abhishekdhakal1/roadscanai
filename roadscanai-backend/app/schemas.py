from pydantic import BaseModel, ConfigDict
from datetime import datetime


class GPSData(BaseModel):
    lat: float
    lon: float
    hdop: float
    fix: bool
    speed_kmh: float


class DetectionPayload(BaseModel):
    device_id: str
    seq: int
    timestamp: datetime
    gps: GPSData
    prediction: str
    confidence: float


class DetectionResponse(BaseModel):
    status: str
    clustered: bool


class PotholeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lat: float
    lon: float
    severity: str
    confidence: float
    first_seen: datetime
    last_seen: datetime
    detection_count: int
    status: str

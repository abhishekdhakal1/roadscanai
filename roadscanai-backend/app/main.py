from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.schemas import DetectionPayload, DetectionResponse, PotholeOut
from app import crud


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="RoadScanAI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # local frontend dev
        "https://pothole-dashboard-five.vercel.app",  # replace with your actual Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.post("/api/v1/detections", response_model=DetectionResponse)
def receive_detection(payload: DetectionPayload, db: Session = Depends(get_db)):
    """Called by the ESP32-CAM whenever it detects road damage."""
    return crud.save_detection(db, payload)


@app.get("/api/v1/potholes/unfixed", response_model=List[PotholeOut])
def unfixed_potholes(db: Session = Depends(get_db)):
    """Called by the frontend dashboard on a polling interval."""
    return crud.get_unfixed_potholes(db)

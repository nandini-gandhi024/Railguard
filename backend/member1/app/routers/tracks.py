from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Track

router = APIRouter(prefix="/tracks", tags=["Tracks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TrackCreate(BaseModel):
    location: str
    section: str
    division: str
    zone: str
    track_age: int
    steel_grade: str
    traffic_per_day: int
    speed_limit: float
    curve_radius: float
    previous_repairs: str
    last_tamping_days: int
    network_importance: str
    status: str = "Active"
    latitude: float
    longitude: float


@router.post("/")
def create_track(track: TrackCreate, db: Session = Depends(get_db)):

    new_track = Track(
        location=track.location,
        section=track.section,
        division=track.division,
        zone=track.zone,
        track_age=track.track_age,
        steel_grade=track.steel_grade,
        traffic_per_day=track.traffic_per_day,
        speed_limit=track.speed_limit,
        curve_radius=track.curve_radius,
        previous_repairs=track.previous_repairs,
        last_tamping_days=track.last_tamping_days,
        network_importance=track.network_importance,
        status=track.status,
        latitude=track.latitude,
        longitude=track.longitude
    )

    db.add(new_track)
    db.commit()
    db.refresh(new_track)

    return new_track


@router.get("/")
def get_tracks(db: Session = Depends(get_db)):
    return db.query(Track).all()


@router.get("/{track_id}")
def get_track(track_id: int, db: Session = Depends(get_db)):

    track = db.query(Track).filter(Track.id == track_id).first()

    if not track:
        return {"error": "Track not found"}

    return track
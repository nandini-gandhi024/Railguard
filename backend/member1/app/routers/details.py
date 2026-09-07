from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Track,
    Defect,
    Weather,
    Maintenance,
    RiskAssessment,
    MaintenancePriority
)

router = APIRouter(
    prefix="/tracks",
    tags=["Track Details"]
)


@router.get("/{track_id}/details")
def get_track_details(track_id: int, db: Session = Depends(get_db)):

    track = db.query(Track).filter(
        Track.id == track_id
    ).first()

    if not track:
        return {"error": "Track not found"}

    defects = db.query(Defect).filter(
        Defect.track_id == track_id
    ).all()

    weather = db.query(Weather).filter(
        Weather.track_id == track_id
    ).all()

    maintenance = db.query(Maintenance).filter(
        Maintenance.track_id == track_id
    ).all()

    risk = db.query(RiskAssessment).filter(
        RiskAssessment.track_id == track_id
    ).all()

    priority = db.query(MaintenancePriority).filter(
        MaintenancePriority.track_id == track_id
    ).all()

    return {
        "track": track,
        "defects": defects,
        "weather": weather,
        "maintenance": maintenance,
        "risk": risk,
        "priority": priority
    }
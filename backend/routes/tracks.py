from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track
from models.schemas import TrackCreate, TrackResponse

router = APIRouter(tags=["Tracks"])


@router.get("/health", summary="Backend Health Check")
def health_check():
    """Returns backend system status."""
    return {
        "status": "healthy",
        "service": "RailGuard AI Backend",
        "sih_problem_statement": "SIH26027"
    }


@router.get("/tracks", response_model=List[TrackResponse], summary="Get All Track Sections")
def get_all_tracks(db: Session = Depends(get_db)):
    """Retrieves list of all monitored railway track sections."""
    tracks = db.query(Track).all()
    return tracks


@router.get("/tracks/{track_id}", response_model=TrackResponse, summary="Get Single Track Detail")
def get_track_by_id(track_id: str, db: Session = Depends(get_db)):
    """Retrieves track asset details by track_id (e.g., T041)."""
    track = db.query(Track).filter(Track.track_id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track ID '{track_id}' not found in database."
        )
    return track


@router.post("/tracks", response_model=TrackResponse, summary="Create or Update Track Entry")
def create_or_update_track(track_in: TrackCreate, db: Session = Depends(get_db)):
    """
    Creates a new track asset entry or updates an existing track in the database.
    Idempotent endpoint ensuring seamless integration with frontend & seed operations.
    """
    existing_track = db.query(Track).filter(Track.track_id == track_in.track_id).first()
    
    if existing_track:
        # Update existing track attributes
        existing_track.location = track_in.location
        existing_track.section = track_in.section
        existing_track.division = track_in.division
        existing_track.zone = track_in.zone
        existing_track.track_age = track_in.track_age
        existing_track.steel_grade = track_in.steel_grade
        existing_track.traffic_per_day = track_in.traffic_per_day
        existing_track.speed_limit = track_in.speed_limit
        existing_track.curve_radius = track_in.curve_radius
        existing_track.previous_repairs = track_in.previous_repairs
        existing_track.last_tamping_days = track_in.last_tamping_days
        existing_track.network_importance = track_in.network_importance
        db.commit()
        db.refresh(existing_track)
        return existing_track

    new_track = Track(
        track_id=track_in.track_id,
        location=track_in.location,
        section=track_in.section,
        division=track_in.division,
        zone=track_in.zone,
        track_age=track_in.track_age,
        steel_grade=track_in.steel_grade,
        traffic_per_day=track_in.traffic_per_day,
        speed_limit=track_in.speed_limit,
        curve_radius=track_in.curve_radius,
        previous_repairs=track_in.previous_repairs,
        last_tamping_days=track_in.last_tamping_days,
        network_importance=track_in.network_importance,
        status="Operational"
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)
    return new_track

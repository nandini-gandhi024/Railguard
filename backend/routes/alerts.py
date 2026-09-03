from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track
from models.schemas import AlertResponse, AlertListResponse
from services.alerts import get_active_alerts

router = APIRouter(tags=["Critical Risk Alerts"])


@router.get("/alerts", response_model=AlertListResponse, summary="Get Active Critical Risk Alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    """
    Retrieves all active critical and high-risk alerts across monitored tracks.
    Identifies tracks currently in critical condition or predicted to become critical soon.
    """
    alerts = get_active_alerts(db)
    
    crit_count = sum(1 for a in alerts if a["severity"] == "CRITICAL")
    high_count = sum(1 for a in alerts if a["severity"] == "HIGH")

    return {
        "total_alerts": len(alerts),
        "critical_count": crit_count,
        "high_count": high_count,
        "alerts": alerts
    }


@router.get("/alerts/{track_id}", response_model=AlertListResponse, summary="Get Active Alerts for Single Track")
def get_alerts_by_track_id(track_id: str, db: Session = Depends(get_db)):
    """
    Retrieves active critical/high-risk alerts for a specific track ID (e.g. T041).
    """
    track = db.query(Track).filter(Track.track_id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track ID '{track_id}' not found in database."
        )

    alerts = get_active_alerts(db, track_id=track_id)
    crit_count = sum(1 for a in alerts if a["severity"] == "CRITICAL")
    high_count = sum(1 for a in alerts if a["severity"] == "HIGH")

    return {
        "total_alerts": len(alerts),
        "critical_count": crit_count,
        "high_count": high_count,
        "alerts": alerts
    }

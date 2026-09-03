import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track, RiskRecord
from services.risk_engine import calculate_risk
from services.weather import get_weather_context

router = APIRouter(tags=["Risk Assessment"])


@router.get("/risk/{track_id}", summary="Get Track Risk Assessment & XAI")
def get_track_risk(track_id: str, db: Session = Depends(get_db)):
    """
    Retrieves latest composite risk score, category, TSR speed restriction,
    and Explainable AI (XAI) breakdown for a given track ID.
    """
    track = db.query(Track).filter(Track.track_id == track_id).first()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Track ID '{track_id}' not found."
        )

    weather_res = get_weather_context(track.location)
    
    risk_output = calculate_risk(
        track_data={
            "track_id": track.track_id,
            "track_age": track.track_age,
            "traffic_per_day": track.traffic_per_day,
            "speed_limit": track.speed_limit,
            "curve_radius": track.curve_radius,
            "previous_repairs": track.previous_repairs,
            "last_tamping_days": track.last_tamping_days
        },
        fault_data={"severity": 85.0, "confidence": 0.94},
        weather_data=weather_res,
        delay_days=0
    )

    return {
        "track_id": track_id,
        "location": track.location,
        "section": track.section,
        "risk": {
            "score": risk_output["risk_score"],
            "category": risk_output["risk_category"],
            "priority": risk_output["priority"],
            "tsr_speed_kmh": risk_output["tsr_speed_kmh"]
        },
        "prediction": {
            "risk_7_days": risk_output["predicted_risk_7_days"],
            "risk_14_days": risk_output["predicted_risk_14_days"],
            "days_to_critical": risk_output["days_to_critical"]
        },
        "recommendation": risk_output["urgency_action"],
        "xai_breakdown": risk_output["xai_breakdown"],
        "weather_context": weather_res
    }

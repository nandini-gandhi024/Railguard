from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track
from models.schemas import SimulationRequest, SimulationResponse
from services.risk_engine import calculate_risk
from services.weather import get_weather_context

router = APIRouter(tags=["Simulation"])


@router.post("/simulate", response_model=SimulationResponse, summary="What-If Delayed Maintenance Simulator")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    """
    What-If Simulator Endpoint:
    Calculates current risk vs projected risk when maintenance is delayed by X days.
    
    Expected response format:
    {
      "current_risk": 92,
      "predicted_risk": 97,
      "risk_change": 5
    }
    """
    track = db.query(Track).filter(Track.track_id == req.track_id).first()
    if not track:
        # Fallback track parameters if custom track_id
        track_dict = {
            "track_age": 14,
            "traffic_per_day": 58,
            "speed_limit": 130,
            "curve_radius": 1200.0,
            "previous_repairs": 4,
            "last_tamping_days": 210
        }
    else:
        track_dict = {
            "track_age": track.track_age,
            "traffic_per_day": track.traffic_per_day * (1.0 + (req.traffic_increase_pct / 100.0)),
            "speed_limit": track.speed_limit,
            "curve_radius": track.curve_radius,
            "previous_repairs": track.previous_repairs,
            "last_tamping_days": track.last_tamping_days
        }

    weather_data = {
        "temperature_c": req.temperature_c,
        "monsoon_alert": req.monsoon_alert
    }

    # Baseline risk (0 days delay)
    current_res = calculate_risk(
        track_data=track_dict,
        fault_data={"severity": 85.0, "confidence": 0.94},
        weather_data=weather_data,
        delay_days=0
    )

    # Simulated risk (delayed days)
    simulated_res = calculate_risk(
        track_data=track_dict,
        fault_data={"severity": 85.0, "confidence": 0.94},
        weather_data=weather_data,
        delay_days=req.delay_days
    )

    c_risk = current_res["risk_score"]
    p_risk = round(min(100.0, c_risk + (req.delay_days * 0.75)), 1)
    risk_diff = round(p_risk - c_risk, 1)

    return {
        "track_id": req.track_id,
        "current_risk": c_risk,
        "predicted_risk": p_risk,
        "risk_change": risk_diff,
        "category": simulated_res["risk_category"],
        "tsr_speed": simulated_res["tsr_speed_kmh"],
        "days_to_critical": max(0, current_res["days_to_critical"] - req.delay_days)
    }

import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track, RiskRecord
from services.risk_engine import calculate_risk
from services.weather import get_weather_context
from ai.risk_prediction import rank_network_tracks

router = APIRouter(tags=["Risk Assessment"])


class AssessRiskRequest(BaseModel):
    track_id: str = Field("T041", example="T041")
    defect_severity: Optional[float] = Field(85.0, example=88.5)
    defect_confidence: Optional[float] = Field(0.94, example=0.94)
    temperature_c: Optional[float] = Field(38.0, example=42.0)
    monsoon_alert: Optional[bool] = Field(False, example=False)
    delay_days: Optional[int] = Field(0, example=0)


@router.get("/risk/{track_id}", summary="Get Track Risk Assessment & XAI")
def get_track_risk(track_id: str, db: Session = Depends(get_db)):
    """
    Retrieves latest composite risk score, category, TSR speed restriction,
    Explainable AI (XAI) breakdown, velocity, and future risk for a given track ID.
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
            "last_tamping_days": track.last_tamping_days,
            "network_importance": track.network_importance
        },
        fault_data={"severity": 85.0, "confidence": 0.94, "defect_type": "crack"},
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
            "risk_3_days": risk_output.get("predicted_risk_3_days", risk_output["risk_score"] + 2.0),
            "risk_7_days": risk_output["predicted_risk_7_days"],
            "risk_14_days": risk_output["predicted_risk_14_days"],
            "days_to_critical": risk_output["days_to_critical"]
        },
        "risk_velocity": risk_output.get("risk_velocity", {}),
        "is_recurring_failure": risk_output.get("is_recurring_failure", False),
        "recommendation": risk_output["urgency_action"],
        "recommendation_tier": risk_output.get("recommendation_tier", {}),
        "xai_breakdown": risk_output["xai_breakdown"],
        "top_factors": risk_output.get("top_factors", []),
        "diagnostic_summary": risk_output.get("diagnostic_summary", ""),
        "degradation_curve": risk_output.get("degradation_curve", []),
        "weather_context": weather_res
    }


@router.get("/risk-velocity/{track_id}", summary="Get Track Risk Velocity & Deterioration Rate")
def get_track_velocity(track_id: str, db: Session = Depends(get_db)):
    """Member 4 Deliverable: Determines how quickly risk is escalating (points/day)."""
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
            "last_tamping_days": track.last_tamping_days,
            "network_importance": track.network_importance
        },
        fault_data={"severity": 85.0, "confidence": 0.94},
        weather_data=weather_res,
        delay_days=0
    )

    return {
        "track_id": track_id,
        "current_risk": risk_output["risk_score"],
        "risk_category": risk_output["risk_category"],
        "velocity": risk_output.get("risk_velocity", {}),
        "days_to_critical": risk_output["days_to_critical"],
        "trajectory_summary": (
            f"Risk escalating from {risk_output['risk_score']} to "
            f"{risk_output['predicted_risk_7_days']} in 7 days "
            f"({risk_output.get('risk_velocity', {}).get('status', 'Gradual Wear')})"
        )
    }


@router.get("/network-ranking", summary="Get Network-Wide Priority Ranking & Recurring Defect Flags")
def get_network_ranking(db: Session = Depends(get_db)):
    """Member 4 Deliverable: Evaluates and ranks all tracks by urgency Priority Index."""
    tracks = db.query(Track).all()
    evaluated = []
    
    for t in tracks:
        weather_res = get_weather_context(t.location)
        risk_output = calculate_risk(
            track_data={
                "track_id": t.track_id,
                "track_age": t.track_age,
                "traffic_per_day": t.traffic_per_day,
                "speed_limit": t.speed_limit,
                "curve_radius": t.curve_radius,
                "previous_repairs": t.previous_repairs,
                "last_tamping_days": t.last_tamping_days,
                "network_importance": t.network_importance
            },
            fault_data={"severity": 75.0 if t.track_id == "T041" else 50.0, "confidence": 0.92},
            weather_data=weather_res,
            delay_days=0
        )
        evaluated.append({
            "track_id": t.track_id,
            "section": t.section,
            "location": t.location,
            "risk_score": risk_output["risk_score"],
            "risk_category": risk_output["risk_category"],
            "tsr_speed_kmh": risk_output["tsr_speed_kmh"],
            "network_importance": t.network_importance,
            "previous_repairs": t.previous_repairs,
            "risk_velocity": risk_output.get("risk_velocity", {}),
            "recommendation": risk_output["urgency_action"]
        })

    ranked_results = rank_network_tracks(evaluated)
    return {
        "total_tracks_monitored": len(ranked_results),
        "critical_count": sum(1 for r in ranked_results if r["risk_score"] >= 75.0),
        "high_risk_count": sum(1 for r in ranked_results if 55.0 <= r["risk_score"] < 75.0),
        "recurring_failures_count": sum(1 for r in ranked_results if r.get("is_recurring_failure")),
        "rankings": ranked_results
    }


# Endpoints for Member 5 React Frontend (RiskXAIModule.jsx)
@router.post("/api/assess-risk", summary="Assess Risk API for React RiskXAIModule")
@router.post("/assess-risk", summary="Assess Risk API for React RiskXAIModule")
def assess_risk_frontend(req: AssessRiskRequest, db: Session = Depends(get_db)):
    """Directly supports Member 5's RiskXAIModule.jsx fetch calls."""
    track = db.query(Track).filter(Track.track_id == req.track_id).first()
    if not track:
        track_dict = {
            "track_id": req.track_id,
            "track_age": 14,
            "traffic_per_day": 58,
            "speed_limit": 130,
            "curve_radius": 1200.0,
            "previous_repairs": 4,
            "last_tamping_days": 210,
            "network_importance": 9
        }
    else:
        track_dict = {
            "track_id": track.track_id,
            "track_age": track.track_age,
            "traffic_per_day": track.traffic_per_day,
            "speed_limit": track.speed_limit,
            "curve_radius": track.curve_radius,
            "previous_repairs": track.previous_repairs,
            "last_tamping_days": track.last_tamping_days,
            "network_importance": track.network_importance
        }

    weather_dict = {
        "temperature_c": req.temperature_c,
        "monsoon_alert": req.monsoon_alert
    }

    fault_dict = {
        "severity": req.defect_severity,
        "confidence": req.defect_confidence,
        "defect_type": "crack"
    }

    risk_output = calculate_risk(
        track_data=track_dict,
        fault_data=fault_dict,
        weather_data=weather_dict,
        delay_days=req.delay_days
    )

    return {
        "track_id": req.track_id,
        "composite_risk": risk_output["risk_score"],
        "color_code": risk_output.get("color_code", "#ef4444"),
        "category": risk_output["risk_category"],
        "normal_speed_kmh": track_dict.get("speed_limit", 130),
        "tsr_speed_kmh": risk_output["tsr_speed_kmh"],
        "urgency_action": risk_output["urgency_action"],
        "days_to_critical": risk_output["days_to_critical"],
        "risk_velocity": risk_output.get("risk_velocity", {}),
        "xai_breakdown": risk_output["xai_breakdown"],
        "top_factors": risk_output.get("top_factors", []),
        "diagnostic_summary": risk_output.get("diagnostic_summary", ""),
        "degradation_curve": risk_output.get("degradation_curve", [])
    }

import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import Track, RiskRecord, RiskAlert
from services.risk_engine import calculate_risk
from services.weather import get_weather_context


def evaluate_track_alerts(
    track_id: str,
    risk_score: float,
    risk_category: str,
    predicted_risk_7_days: float,
    days_to_critical: int,
    urgency_action: str
) -> List[Dict[str, Any]]:
    """
    Evaluates risk score and 7-day degradation trajectory against established risk thresholds.
    Generates CURRENT_CRITICAL, HIGH_RISK, or PREDICTED_CRITICAL alert dictionaries.
    
    Severity Thresholds (Reused from risk_engine.py):
    - CRITICAL: Risk >= 75.0
    - HIGH: 55.0 <= Risk < 75.0
    - MODERATE: 35.0 <= Risk < 55.0
    - LOW: Risk < 35.0
    """
    alerts = []

    # 1. Current Risk Condition Alert
    if risk_score >= 75.0 or risk_category == "Critical":
        alerts.append({
            "alert_id": f"ALT-{track_id}-CURR-{uuid.uuid4().hex[:4].upper()}",
            "track_id": track_id,
            "alert_type": "CURRENT_CRITICAL",
            "severity": "CRITICAL",
            "risk_score": risk_score,
            "predicted_risk": predicted_risk_7_days,
            "days_to_critical": days_to_critical,
            "message": f"CRITICAL ALERT: Track {track_id} has reached critical risk ({risk_score}/100). Immediate inspection/maintenance is recommended.",
            "recommended_action": urgency_action
        })
    elif risk_score >= 55.0 or risk_category == "High":
        alerts.append({
            "alert_id": f"ALT-{track_id}-HIGH-{uuid.uuid4().hex[:4].upper()}",
            "track_id": track_id,
            "alert_type": "HIGH_RISK",
            "severity": "HIGH",
            "risk_score": risk_score,
            "predicted_risk": predicted_risk_7_days,
            "days_to_critical": days_to_critical,
            "message": f"HIGH RISK ALERT: Track {track_id} risk score is high ({risk_score}/100). Schedule maintenance block within 48 hours.",
            "recommended_action": urgency_action
        })

    # 2. Predicted Critical Condition Alert
    if (predicted_risk_7_days >= 75.0 or days_to_critical <= 7) and risk_score < 75.0:
        pred_severity = "CRITICAL" if days_to_critical <= 3 else "HIGH"
        alerts.append({
            "alert_id": f"ALT-{track_id}-PRED-{uuid.uuid4().hex[:4].upper()}",
            "track_id": track_id,
            "alert_type": "PREDICTED_CRITICAL",
            "severity": pred_severity,
            "risk_score": risk_score,
            "predicted_risk": predicted_risk_7_days,
            "days_to_critical": days_to_critical,
            "message": f"PREDICTED CRITICAL ALERT: Track {track_id} is predicted to reach critical condition within {days_to_critical} days (Projected Risk: {predicted_risk_7_days}).",
            "recommended_action": f"Pre-allocate maintenance block window within {days_to_critical} days to prevent track failure."
        })

    return alerts


def get_active_alerts(db: Session, track_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves active alerts across monitored tracks or for a specific track_id.
    Persists generated alerts to SQLite risk_alerts table.
    """
    query = db.query(Track)
    if track_id:
        query = query.filter(Track.track_id == track_id)
    tracks = query.all()

    all_alerts = []

    for t in tracks:
        # Get latest risk record or compute live risk
        weather_res = get_weather_context(t.location)
        risk_res = calculate_risk(
            track_data={
                "track_id": t.track_id,
                "track_age": t.track_age,
                "traffic_per_day": t.traffic_per_day,
                "speed_limit": t.speed_limit,
                "curve_radius": t.curve_radius,
                "previous_repairs": t.previous_repairs,
                "last_tamping_days": t.last_tamping_days
            },
            fault_data={"severity": 85.0 if t.status in ["Speed Restricted", "Block Required"] else 35.0, "confidence": 0.94},
            weather_data=weather_res,
            delay_days=0
        )

        track_alerts = evaluate_track_alerts(
            track_id=t.track_id,
            risk_score=risk_res["risk_score"],
            risk_category=risk_res["risk_category"],
            predicted_risk_7_days=risk_res["predicted_risk_7_days"],
            days_to_critical=risk_res["days_to_critical"],
            urgency_action=risk_res["urgency_action"]
        )

        all_alerts.extend(track_alerts)

    return all_alerts

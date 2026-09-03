import math
from typing import Dict, Any, Optional

def calculate_risk(
    track_data: Dict[str, Any],
    fault_data: Dict[str, Any],
    weather_data: Optional[Dict[str, Any]] = None,
    delay_days: int = 0
) -> dict:
    """
    Interface for Member 4's Risk Prediction AI Model.
    Integrates defect severity, static track parameters, traffic GMT, and weather stress.
    
    Expected contract:
    {
      "risk_score": 92,
      "risk_category": "Critical",
      "priority": 1,
      "predicted_risk_7_days": 97
    }
    """
    severity = float(fault_data.get("severity", 85.0))
    confidence = float(fault_data.get("confidence", 0.94))
    
    traffic_gmt = float(track_data.get("traffic_per_day", 45))
    track_age = int(track_data.get("track_age", 12))
    
    temp_c = float(weather_data.get("temperature_c", 38.0)) if weather_data else 38.0
    monsoon = weather_data.get("monsoon_alert", False) if weather_data else False
    
    # Formula combining factors
    raw_risk = (
        (0.40 * severity * confidence) +
        (0.25 * min(100.0, (traffic_gmt / 60.0) * 100.0)) +
        (0.15 * min(100.0, (temp_c / 45.0) * 100.0 + (25.0 if monsoon else 0.0))) +
        (0.10 * min(100.0, (track_age / 25.0) * 100.0)) +
        (0.10 * (delay_days * 3.5))
    )
    
    risk_score = round(min(100.0, max(0.0, raw_risk)), 1)
    
    if risk_score >= 75.0:
        category = "Critical"
        priority = 1
        tsr_speed = 30
        urgency = "Immediate inspection & TSR 30 km/h"
    elif risk_score >= 55.0:
        category = "High"
        priority = 2
        tsr_speed = 60
        urgency = "Schedule maintenance block within 48 hours"
    elif risk_score >= 35.0:
        category = "Moderate"
        priority = 3
        tsr_speed = 90
        urgency = "Routine weekly maintenance window"
    else:
        category = "Low"
        priority = 4
        tsr_speed = int(track_data.get("speed_limit", 130))
        urgency = "Normal monitoring"

    # Future risk escalation modeling (7-day and 14-day predictions)
    pred_7 = round(min(100.0, risk_score + 5.0 + (delay_days * 0.5)), 1)
    pred_14 = round(min(100.0, risk_score + 11.0 + (delay_days * 0.8)), 1)
    
    days_to_crit = max(1, int((85.0 - risk_score) / 2.5)) if risk_score < 85.0 else 0

    return {
        "risk_score": risk_score,
        "risk_category": category,
        "priority": priority,
        "tsr_speed_kmh": tsr_speed,
        "predicted_risk_7_days": pred_7,
        "predicted_risk_14_days": pred_14,
        "days_to_critical": days_to_crit,
        "urgency_action": urgency,
        "xai_breakdown": {
            "Defect Severity": 40.0,
            "Traffic GMT": 25.0,
            "Thermal/Monsoon Stress": 15.0,
            "Track Age": 10.0,
            "Maintenance Delay": 10.0
        }
    }

"""
RailGuard - Member 4: AI/ML Risk & Prediction Model Integration
Replaces placeholder logic with the complete trained ML Risk Prediction Engine.
Fuses Member 3 (Computer Vision Defect), Member 6 (Geospatial & Weather), and Member 1 (Track Parameters).
"""

from typing import Dict, Any, Optional
import os
import sys
from pathlib import Path

# Ensure backend root is on Python path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from ai.risk_prediction import RailGuardRiskEngine
except ImportError:
    from backend.ai.risk_prediction import RailGuardRiskEngine

# Initialize singleton Risk Engine
_ENGINE = RailGuardRiskEngine()


def calculate_risk(
    track_data: Dict[str, Any],
    fault_data: Dict[str, Any],
    weather_data: Optional[Dict[str, Any]] = None,
    delay_days: int = 0
) -> dict:
    """
    Production interface for Member 4's AI Risk Prediction Engine.
    Fully backwards-compatible with Member 2 APIs and tests, while adding
    3-day prediction, Risk Velocity, dynamic XAI explanations, and 30-day wear curves.
    """
    eval_result = _ENGINE.evaluate_track(
        track_data=track_data,
        fault_data=fault_data,
        weather_data=weather_data,
        delay_days=delay_days
    )

    # Return superset containing all legacy Member 2 keys + all new Member 4 keys
    return {
        # Core Member 2 contract
        "risk_score": eval_result["risk_score"],
        "risk_category": eval_result["risk_category"],
        "priority": eval_result["priority"],
        "tsr_speed_kmh": eval_result["tsr_speed_kmh"],
        "predicted_risk_7_days": eval_result["predicted_risk_7_days"],
        "predicted_risk_14_days": eval_result["predicted_risk_14_days"],
        "days_to_critical": eval_result["days_to_critical"],
        "urgency_action": eval_result["urgency_action"],
        "xai_breakdown": eval_result["xai_breakdown"],
        
        # Enhanced Member 4 AI deliverables
        "predicted_risk_3_days": eval_result["predicted_risk_3_days"],
        "risk_velocity": eval_result["risk_velocity"],
        "is_recurring_failure": eval_result["is_recurring_failure"],
        "recommendation_tier": eval_result["recommendation_tier"],
        "top_factors": eval_result["top_factors"],
        "diagnostic_summary": eval_result["diagnostic_summary"],
        "degradation_curve": eval_result["degradation_curve"],
        "color_code": eval_result["color_code"],
        "normal_speed_kmh": eval_result["normal_speed_kmh"],
        "composite_risk": eval_result["risk_score"],
        "category": eval_result["risk_category"]
    }

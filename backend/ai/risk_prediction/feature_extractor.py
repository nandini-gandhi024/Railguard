"""
RailGuard - Member 4: AI/ML Risk & Prediction
Feature Extractor & Data Fusion Pipeline
Fuses:
  - Member 3: Fault Detection (defect class, severity, confidence)
  - Member 6: Weather & Environmental Data (temp, rainfall, flood risk)
  - Member 1: Track Geometry & Operational Data (age, traffic GMT, repairs, tamping)
"""

from typing import Dict, Any, Optional, List
import numpy as np

# Weight factors for defect types based on Indian Railways P-Way Manual danger classification
DEFECT_WEIGHTS: Dict[str, float] = {
    "crack": 1.00,             # Transverse crack - Highest catastrophic derailment risk
    "track_buckling": 0.98,    # Lateral distortion under thermal stress
    "broken_sleeper": 0.85,    # Structural gauge loss
    "head_check": 0.75,        # Rolling Contact Fatigue (RCF)
    "ballast_void": 0.70,      # Dynamic dip / trackbed pumping
    "surface_defect": 0.65,    # Surface spalling / corrugation
    "missing_clip": 0.55,      # Fastener failure
    "normal": 0.05,            # No defect
    "unknown": 0.50
}

# Environmental risk string to numeric mapping
ENV_RISK_MAP: Dict[str, float] = {
    "CRITICAL": 1.00,
    "HIGH": 0.75,
    "MODERATE": 0.50,
    "LOW": 0.20,
    "NONE": 0.00
}


def extract_features(
    track_data: Dict[str, Any],
    fault_data: Dict[str, Any],
    weather_data: Optional[Dict[str, Any]] = None,
    delay_days: int = 0
) -> Dict[str, float]:
    """
    Extracts a standardized, normalized numeric feature dictionary.
    Returns normalized values [0.0 - 1.0] and raw values for modeling.
    """
    # 1. Defect parameters (Member 3)
    defect_type = str(fault_data.get("defect_type", "crack")).lower().replace(" ", "_")
    defect_base_weight = DEFECT_WEIGHTS.get(defect_type, 0.70)
    raw_severity = float(fault_data.get("severity", 80.0))
    raw_confidence = float(fault_data.get("confidence", 0.90))
    defect_score = (raw_severity / 100.0) * raw_confidence * defect_base_weight

    # 2. Track operational parameters (Member 1)
    traffic_gmt = float(track_data.get("traffic_per_day", track_data.get("traffic_gmt_per_day", 45.0)))
    traffic_norm = min(1.0, traffic_gmt / 80.0)

    track_age = float(track_data.get("track_age", 12.0))
    age_norm = min(1.0, track_age / 30.0)

    speed_limit = float(track_data.get("speed_limit", track_data.get("speed_limit_kmh", 130.0)))
    speed_norm = min(1.0, speed_limit / 160.0)

    curve_radius = float(track_data.get("curve_radius", 1200.0))
    # Sharp curves (<800m) experience significantly higher lateral flange wear
    curve_stress = 1.0 - min(1.0, max(0.0, (curve_radius - 400.0) / 1600.0))

    previous_repairs = float(track_data.get("previous_repairs", 2.0))
    repair_fatigue = min(1.0, previous_repairs / 6.0)

    last_tamping_days = float(track_data.get("last_tamping_days", 180.0))
    tamping_gap = min(1.0, last_tamping_days / 365.0)

    network_importance = float(track_data.get("network_importance", 8.0))
    importance_norm = min(1.0, max(0.1, network_importance / 10.0))

    # 3. Weather and environmental parameters (Member 6)
    temp_c = 35.0
    rainfall_mm = 5.0
    env_risk_score = 40.0
    monsoon = False

    if weather_data:
        temp_c = float(weather_data.get("temperature", weather_data.get("temperature_c", 35.0)))
        rainfall_mm = float(weather_data.get("rainfall", 5.0))
        monsoon = bool(weather_data.get("monsoon_alert", False) or rainfall_mm > 25.0)
        env_score_raw = weather_data.get("environmental_risk_score", None)
        if env_score_raw is not None:
            env_risk_score = float(env_score_raw)
        else:
            flood_str = str(weather_data.get("flood_risk", "MODERATE")).upper()
            env_risk_score = ENV_RISK_MAP.get(flood_str, 0.5) * 100.0

    # High rail temperatures (>45C) cause severe buckling risk; low (<5C) causes brittle fracture
    thermal_stress = max(0.0, (temp_c - 30.0) / 25.0) if temp_c >= 30.0 else max(0.0, (10.0 - temp_c) / 15.0)
    thermal_stress = min(1.0, thermal_stress)

    rain_stress = min(1.0, rainfall_mm / 60.0)
    if monsoon:
        rain_stress = max(rain_stress, 0.6)

    # 4. Maintenance deferral delay
    delay_impact = min(1.0, (delay_days * 3.5) / 100.0)

    return {
        "defect_score": defect_score,
        "traffic_norm": traffic_norm,
        "age_norm": age_norm,
        "curve_stress": curve_stress,
        "repair_fatigue": repair_fatigue,
        "tamping_gap": tamping_gap,
        "thermal_stress": thermal_stress,
        "rain_stress": rain_stress,
        "env_risk_norm": env_risk_score / 100.0,
        "importance_norm": importance_norm,
        "delay_impact": delay_impact,
        # Raw features preserved for XAI explainability
        "_raw_severity": raw_severity,
        "_raw_confidence": raw_confidence,
        "_raw_defect_type": defect_type,
        "_raw_traffic_gmt": traffic_gmt,
        "_raw_track_age": track_age,
        "_raw_temp_c": temp_c,
        "_raw_rainfall_mm": rainfall_mm,
        "_raw_previous_repairs": previous_repairs,
        "_raw_importance": network_importance,
        "_raw_delay_days": delay_days
    }


def feature_dict_to_vector(features: Dict[str, float]) -> List[float]:
    """Converts normalized features into an ordered vector for ML models."""
    ordered_keys = [
        "defect_score",
        "traffic_norm",
        "age_norm",
        "curve_stress",
        "repair_fatigue",
        "tamping_gap",
        "thermal_stress",
        "rain_stress",
        "env_risk_norm",
        "importance_norm",
        "delay_impact"
    ]
    return [features[k] for k in ordered_keys]

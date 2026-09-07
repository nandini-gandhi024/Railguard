"""
RailGuard - Member 4: AI/ML Risk & Prediction
Explainable AI (XAI) Engine & Feature Attribution
Calculates:
  - Exact percentage contribution of each risk factor (summing to 100%)
  - Top contributing factors list
  - Natural language diagnostic explanation for the dashboard and railway engineers
"""

from typing import Dict, Any, List


def compute_xai_attribution(
    features: Dict[str, float],
    risk_score: float,
    track_id: str = "T041"
) -> Dict[str, Any]:
    """
    Computes dynamic, normalized feature attributions for a given track evaluation.
    Answers: 'Why is this track high-risk?'
    """
    raw_defect_type = features.get("_raw_defect_type", "crack").replace("_", " ").title()
    raw_severity = features.get("_raw_severity", 85.0)
    raw_confidence = features.get("_raw_confidence", 0.94)
    raw_traffic = features.get("_raw_traffic_gmt", 58.0)
    raw_temp = features.get("_raw_temp_c", 42.0)
    raw_rainfall = features.get("_raw_rainfall_mm", 12.0)
    raw_age = features.get("_raw_track_age", 14.0)
    raw_repairs = int(features.get("_raw_previous_repairs", 4.0))

    # Weight components according to normalized input values
    w_defect = max(0.05, features.get("defect_score", 0.70) * 0.38)
    w_traffic = max(0.05, features.get("traffic_norm", 0.65) * 0.24)
    w_weather = max(0.05, (features.get("thermal_stress", 0.4) + features.get("rain_stress", 0.2) + features.get("env_risk_norm", 0.4)) / 3.0 * 0.18)
    w_age = max(0.05, features.get("age_norm", 0.45) * 0.10)
    w_repairs = max(0.05, (features.get("repair_fatigue", 0.5) + features.get("tamping_gap", 0.5)) / 2.0 * 0.10)

    total_weight = w_defect + w_traffic + w_weather + w_age + w_repairs
    if total_weight <= 0.0:
        total_weight = 1.0

    pct_defect = round((w_defect / total_weight) * 100.0, 1)
    pct_traffic = round((w_traffic / total_weight) * 100.0, 1)
    pct_weather = round((w_weather / total_weight) * 100.0, 1)
    pct_age = round((w_age / total_weight) * 100.0, 1)
    pct_repairs = round(100.0 - (pct_defect + pct_traffic + pct_weather + pct_age), 1)

    # Compatible with Member 5 Recharts Radar & Bar Chart
    xai_breakdown = {
        "Defect Severity": pct_defect,
        "Traffic GMT": pct_traffic,
        "Thermal/Monsoon Stress": pct_weather,
        "Track Age": pct_age,
        "Maintenance Delay": pct_repairs
    }

    # Generate human-readable top factors
    top_factors: List[Dict[str, Any]] = [
        {
            "factor": f"{raw_defect_type} Detected",
            "contribution_pct": pct_defect,
            "metric": f"Severity: {raw_severity:.0f}/100, Conf: {raw_confidence*100:.0f}%",
            "impact": "Primary structural vulnerability"
        },
        {
            "factor": "Axle Load & Traffic Volume",
            "contribution_pct": pct_traffic,
            "metric": f"{raw_traffic:.1f} GMT / day",
            "impact": "Continuous dynamic cyclic fatigue loading"
        },
        {
            "factor": "Thermal & Environmental Stress",
            "contribution_pct": pct_weather,
            "metric": f"{raw_temp:.1f}°C Rail Temp, {raw_rainfall:.1f}mm Rain",
            "impact": "Thermal expansion buckling & subgrade moisture"
        },
        {
            "factor": "Track Asset Age",
            "contribution_pct": pct_age,
            "metric": f"{raw_age:.0f} Years in Service",
            "impact": "Metallurgical aging and cumulative micro-wear"
        },
        {
            "factor": "Prior Maintenance History",
            "contribution_pct": pct_repairs,
            "metric": f"{raw_repairs} Prior Joint Repairs",
            "impact": "Stress concentration at recurring weld/joint heat zones"
        }
    ]

    # Sort descending by contribution percentage
    top_factors.sort(key=lambda x: x["contribution_pct"], reverse=True)

    # Build natural language narrative explanation
    risk_level_str = "Critical" if risk_score >= 75.0 else ("High" if risk_score >= 55.0 else "Moderate")
    summary = (
        f"Track {track_id} is assessed at {risk_level_str} Risk ({risk_score:.1f}/100) primarily driven by "
        f"{raw_defect_type.lower()} ({pct_defect}% contribution) under heavy axle loading of {raw_traffic:.1f} GMT/day ({pct_traffic}%). "
        f"Environmental stress ({raw_temp:.1f}°C, {pct_weather}%) and {raw_repairs} prior weld repairs ({pct_repairs}%) accelerate fracture velocity."
    )

    return {
        "xai_breakdown": xai_breakdown,
        "top_factors": top_factors,
        "summary": summary
    }

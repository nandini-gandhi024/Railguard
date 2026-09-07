"""
RailGuard - Member 4: AI/ML Risk & Prediction
Future Risk Forecaster & Degradation Physics Engine
Predicts:
  - Current Risk
  - 3-Day Risk
  - 7-Day Risk
  - 14-Day Risk
  - 30-Day Degradation Projection Curve
  - Days to Critical Failure Threshold (85.0)
Based on Paris' Law of Crack Growth & Cumulative Axle Tonnage.
"""

from typing import Dict, Any, List
import math


def forecast_risk_trajectory(
    base_risk: float,
    traffic_gmt: float = 45.0,
    weather_stress: float = 0.5,
    delay_days: int = 0
) -> Dict[str, Any]:
    """
    Computes future risk forecast using non-linear crack propagation physics.
    da/dt = alpha * (GMT / 40)^1.3 * (1 + beta * Weather) * (Risk / 50)^1.2
    """
    # Daily wear acceleration factor
    gmt_multiplier = math.pow(max(10.0, traffic_gmt) / 45.0, 1.25)
    env_multiplier = 1.0 + (0.45 * max(0.0, min(1.0, weather_stress)))
    
    # Non-linear crack growth parameter: cracks accelerate as they deepen
    crack_depth_factor = math.pow(max(20.0, base_risk) / 60.0, 1.35)
    
    # Base daily growth rate (points/day)
    daily_growth_rate = 0.35 * gmt_multiplier * env_multiplier * crack_depth_factor
    
    # Future projections (with asymptotic saturation at 99.8)
    def project_at_day(t_days: float) -> float:
        if base_risk <= 25.0:
            growth = t_days * 0.15 * gmt_multiplier
        elif base_risk <= 55.0:
            growth = t_days * 0.45 * gmt_multiplier
        else:
            # Accelerated compounding growth for high/critical risks
            growth = (math.pow(1.0 + (daily_growth_rate / 35.0), t_days) - 1.0) * 35.0
        
        projected = base_risk + growth + (delay_days * 0.25)
        return round(min(99.8, max(0.0, projected)), 1)

    risk_3d = project_at_day(3.0)
    risk_7d = project_at_day(7.0)
    risk_14d = project_at_day(14.0)

    # Days to reach critical failure threshold (85.0)
    if base_risk >= 85.0:
        days_to_crit = 0
    else:
        remaining = 85.0 - base_risk
        est_days = int(math.ceil(remaining / max(0.2, daily_growth_rate)))
        days_to_crit = max(1, min(60, est_days))

    # Generate 30-Day Degradation Curve formatted for Recharts frontend
    degradation_curve: List[Dict[str, Any]] = []
    checkpoint_days = [0, 2, 4, 7, 10, 14, 21, 28, 30]
    for d in checkpoint_days:
        r_val = project_at_day(float(d))
        degradation_curve.append({
            "day": f"Day {d}",
            "day_num": d,
            "risk_score": r_val,
            "critical_threshold": 85.0
        })

    # Risk Velocity calculation (points / day over 7-day window)
    velocity_pts_per_day = round((risk_7d - base_risk) / 7.0, 2)
    
    if velocity_pts_per_day >= 2.5 or base_risk >= 85.0:
        velocity_status = "Rapid Deterioration"
        velocity_alert = "CRITICAL: Accelerated flaw propagation detected. Immediate intervention required."
    elif velocity_pts_per_day >= 1.4:
        velocity_status = "Accelerated Wear"
        velocity_alert = "WARNING: Above-average wear rate under heavy axle load and thermal stress."
    elif velocity_pts_per_day >= 0.6:
        velocity_status = "Gradual Wear"
        velocity_alert = "MODERATE: Normal expected linear fatigue accumulation."
    else:
        velocity_status = "Stable"
        velocity_alert = "STABLE: Track parameters within safe operational tolerances."

    return {
        "current_risk": base_risk,
        "predicted_risk_3_days": risk_3d,
        "predicted_risk_7_days": risk_7d,
        "predicted_risk_14_days": risk_14d,
        "days_to_critical": days_to_crit,
        "risk_velocity": {
            "points_per_day": velocity_pts_per_day,
            "status": velocity_status,
            "alert": velocity_alert
        },
        "degradation_curve": degradation_curve
    }

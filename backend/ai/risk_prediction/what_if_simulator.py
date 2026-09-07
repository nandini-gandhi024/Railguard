"""
RailGuard - Member 4: AI/ML Risk & Prediction
What-If Scenario Simulation Engine
Simulates:
  - Maintenance delays (e.g. 0 to 21 days)
  - Extreme weather scenarios (heat waves, heavy monsoon)
  - Freight surges (+0% to +60% GMT)
  - Speed restrictions (TSR mitigation effect)
  - Repair today vs deferral contrast
"""

from typing import Dict, Any, List, Optional
import math


def simulate_scenario(
    base_risk: float,
    delay_days: int = 0,
    temp_c: float = 38.0,
    monsoon_alert: bool = False,
    traffic_increase_pct: float = 0.0,
    speed_restriction_active: bool = False
) -> Dict[str, Any]:
    """
    Simulates risk impact under adjusted environmental and operational parameters.
    Returns simulated risk score, change delta, and intervention recommendations.
    """
    # 1. Base weather delta
    temp_delta = max(0.0, (temp_c - 35.0) * 0.45)
    monsoon_delta = 7.5 if monsoon_alert else 0.0
    
    # 2. Traffic surge delta
    traffic_delta = (traffic_increase_pct / 100.0) * 8.5
    
    # 3. Deferral delay impact (accelerates with existing risk level)
    delay_multiplier = 0.9 + (base_risk / 100.0) * 0.7
    delay_delta = delay_days * 0.85 * delay_multiplier

    # 4. Mitigation bonus if Temporary Speed Restriction (TSR) is applied
    mitigation = -6.0 if speed_restriction_active else 0.0

    raw_simulated = base_risk + temp_delta + monsoon_delta + traffic_delta + delay_delta + mitigation
    simulated_risk = round(min(99.9, max(5.0, raw_simulated)), 1)
    risk_change = round(simulated_risk - base_risk, 1)

    # TSR and Category assignment
    if simulated_risk >= 75.0:
        category = "Critical"
        priority = 1
        tsr_speed = 30
        urgency = "Immediate inspection & TSR 30 km/h"
    elif simulated_risk >= 55.0:
        category = "High"
        priority = 2
        tsr_speed = 60
        urgency = "Schedule maintenance block within 48 hours"
    elif simulated_risk >= 35.0:
        category = "Moderate"
        priority = 3
        tsr_speed = 90
        urgency = "Routine weekly maintenance window"
    else:
        category = "Low"
        priority = 4
        tsr_speed = 130
        urgency = "Normal monitoring"

    # Counterfactuals
    repair_today_risk = round(max(15.0, base_risk * 0.35), 1)
    days_to_crit = max(0, int(math.ceil((85.0 - simulated_risk) / 2.0))) if simulated_risk < 85.0 else 0

    return {
        "current_risk": base_risk,
        "simulated_risk": simulated_risk,
        "risk_change": risk_change,
        "category": category,
        "priority": priority,
        "tsr_speed": tsr_speed,
        "urgency_action": urgency,
        "days_to_critical": days_to_crit,
        "repair_today_projected_risk": repair_today_risk,
        "delay_7_days_projected_risk": round(min(99.9, simulated_risk + 6.2), 1),
        "delay_14_days_projected_risk": round(min(99.9, simulated_risk + 13.8), 1)
    }

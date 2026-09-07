"""
RailGuard - Member 4: AI/ML Risk & Prediction
Network-Wide Priority Ranker & Recurring Failure Identifier
Ranks all monitored tracks by safety urgency.
Flags recurring joint failures and rapid-wear zones.
"""

from typing import Dict, Any, List


def rank_network_tracks(
    analyzed_tracks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Ranks tracks by composite Priority Index:
      Priority_Index = (Risk_Score * 0.6) + (Network_Importance * 2.5) + (Velocity_Factor * 10.0)
    Assigns sequential priority ranks (1, 2, 3, ...) and recurring failure badges.
    """
    ranked = []
    for t in analyzed_tracks:
        risk = float(t.get("risk_score", 50.0))
        importance = float(t.get("network_importance", 8.0))
        repairs = int(t.get("previous_repairs", 1))
        
        velocity_info = t.get("risk_velocity", {})
        velocity_pts = float(velocity_info.get("points_per_day", 1.0))

        # Recurring failure if 3 or more previous weld/track repairs in same location
        is_recurring = repairs >= 3 or t.get("is_recurring_failure", False)

        # Composite priority sorting key
        # Critical tracks always trump lower-tier tracks regardless of importance
        tier_weight = 1000.0 if risk >= 75.0 else (500.0 if risk >= 55.0 else 0.0)
        recurring_weight = 30.0 if is_recurring else 0.0
        priority_index = tier_weight + (risk * 0.7) + (importance * 3.0) + (velocity_pts * 8.0) + recurring_weight

        item = dict(t)
        item["priority_index"] = round(priority_index, 2)
        item["is_recurring_failure"] = is_recurring
        if is_recurring:
            item["recurring_alert"] = f"RECURRING FAILURE WARNING: {repairs} previous repairs recorded at this location."
        ranked.append(item)

    # Sort descending by priority_index
    ranked.sort(key=lambda x: x["priority_index"], reverse=True)

    # Assign rank 1..N
    for i, item in enumerate(ranked, start=1):
        item["priority_rank"] = i
        item["priority"] = 1 if item["current_risk" if "current_risk" in item else "risk_score"] >= 75.0 else (2 if item.get("risk_score", 0) >= 55.0 else 3)

    return ranked

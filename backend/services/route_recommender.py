from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import Track
from services.risk_engine import calculate_risk
from services.weather import get_weather_context


def recommend_alternative_route(db: Session, target_track_id: str) -> Dict[str, Any]:
    """
    Decision-Support Service:
    Evaluates candidate alternative railway track sections in the corridor/zone
    and calculates a transparent Alternative Route Score.
    
    Formula:
      Safety Score = 100.0 - Candidate Composite Risk
      Status Bonus = +20.0 (Operational), +5.0 (Speed Restricted), 0.0 (Block Required)
      Delay Penalty = 12.0 mins detour penalty
      Alternative Route Score = min(100.0, max(0.0, Safety Score + Status Bonus - Delay Penalty))
    """
    target_track = db.query(Track).filter(Track.track_id == target_track_id).first()
    if not target_track:
        return {
            "affected_track": target_track_id,
            "affected_track_risk": 0.0,
            "condition": "Unknown",
            "recommended_route": None,
            "alternative_route_score": None,
            "availability": None,
            "estimated_delay_minutes": None,
            "reason": [f"Track ID '{target_track_id}' not found in database."],
            "warning": "Decision support recommendation only. Final routing authority rests with Indian Railways Traffic Controller."
        }

    # Calculate target track risk
    weather_res = get_weather_context(target_track.location)
    target_risk = calculate_risk(
        track_data={
            "track_id": target_track.track_id,
            "track_age": target_track.track_age,
            "traffic_per_day": target_track.traffic_per_day,
            "speed_limit": target_track.speed_limit,
            "curve_radius": target_track.curve_radius,
            "previous_repairs": target_track.previous_repairs,
            "last_tamping_days": target_track.last_tamping_days
        },
        fault_data={"severity": 85.0 if target_track.status in ["Speed Restricted", "Block Required"] else 35.0, "confidence": 0.94},
        weather_data=weather_res,
        delay_days=0
    )

    # Query candidate parallel tracks in same section, zone, or division (excluding target_track_id)
    candidates = db.query(Track).filter(
        Track.track_id != target_track_id
    ).all()

    # Prefer candidates in same section or zone first
    same_section = [c for c in candidates if c.section == target_track.section]
    same_zone = [c for c in candidates if c.zone == target_track.zone and c not in same_section]
    other_candidates = [c for c in candidates if c not in same_section and c not in same_zone]

    evaluated_candidates = []

    for c in same_section + same_zone + other_candidates:
        c_weather = get_weather_context(c.location)
        c_risk = calculate_risk(
            track_data={
                "track_id": c.track_id,
                "track_age": c.track_age,
                "traffic_per_day": c.traffic_per_day,
                "speed_limit": c.speed_limit,
                "curve_radius": c.curve_radius,
                "previous_repairs": c.previous_repairs,
                "last_tamping_days": c.last_tamping_days
            },
            fault_data={"severity": 35.0 if c.status == "Operational" else 75.0, "confidence": 0.94},
            weather_data=c_weather,
            delay_days=0
        )

        c_risk_score = c_risk["risk_score"]
        
        # Calculate transparent Alternative Route Score
        safety_score = 100.0 - c_risk_score
        status_bonus = 20.0 if c.status == "Operational" else (5.0 if c.status == "Speed Restricted" else 0.0)
        delay_penalty = 12.0 if c.section == target_track.section else 25.0
        
        total_score = round(min(100.0, max(0.0, safety_score + status_bonus - delay_penalty)), 1)

        # Candidate suitability threshold: Must have lower risk than target AND status != 'Block Required'
        if c_risk_score < target_risk["risk_score"] and c.status != "Block Required":
            evaluated_candidates.append({
                "track": c,
                "risk": c_risk,
                "score": total_score,
                "delay_minutes": int(delay_penalty)
            })

    # Sort candidates by score descending
    evaluated_candidates.sort(key=lambda x: x["score"], reverse=True)

    if evaluated_candidates:
        best = evaluated_candidates[0]
        best_track = best["track"]
        best_risk = best["risk"]
        best_score = best["score"]
        best_delay = best["delay_minutes"]

        return {
            "affected_track": target_track.track_id,
            "affected_track_risk": target_risk["risk_score"],
            "condition": target_risk["risk_category"],
            "recommended_route": best_track.track_id,
            "alternative_route_score": best_score,
            "availability": best_track.status,
            "estimated_delay_minutes": best_delay,
            "reason": [
                f"Lower risk score ({best_risk['risk_score']}/100 vs {target_risk['risk_score']}/100)",
                f"Operationally '{best_track.status}' on {best_track.location}",
                f"Sufficient corridor capacity ({best_track.traffic_per_day} GMT/day)",
                f"Estimated traffic diversion delay: {best_delay} minutes"
            ],
            "warning": "Decision support recommendation only. Final routing authority rests with Indian Railways Traffic Controller."
        }
    else:
        return {
            "affected_track": target_track.track_id,
            "affected_track_risk": target_risk["risk_score"],
            "condition": target_risk["risk_category"],
            "recommended_route": None,
            "alternative_route_score": None,
            "availability": None,
            "estimated_delay_minutes": None,
            "reason": ["No suitable alternative route with lower risk score found in corridor."],
            "warning": "Decision support recommendation only. Final routing authority rests with Indian Railways Traffic Controller."
        }
    

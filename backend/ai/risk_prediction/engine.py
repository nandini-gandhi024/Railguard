"""
RailGuard - Member 4: AI/ML Risk & Prediction
Unified Master Risk Engine Facade
Provides simple, high-level interface for Member 2 and Backend APIs.
"""

from typing import Dict, Any, Optional, List

from .feature_extractor import extract_features
from .risk_model import get_risk_model
from .forecaster import forecast_risk_trajectory
from .explainability import compute_xai_attribution
from .what_if_simulator import simulate_scenario
from .budget_optimizer import optimize_budget_allocation, assign_maintenance_tier
from .ranker import rank_network_tracks


class RailGuardRiskEngine:
    """
    Master Risk Intelligence System (Member 4).
    Fuses computer vision defects, weather stress, and track parameters
    into predictions, velocity, explanations, and budget optimization.
    """

    def __init__(self, weights_path: Optional[str] = None):
        self.model = get_risk_model()

    def evaluate_track(
        self,
        track_data: Dict[str, Any],
        fault_data: Dict[str, Any],
        weather_data: Optional[Dict[str, Any]] = None,
        delay_days: int = 0
    ) -> Dict[str, Any]:
        """
        Complete track risk evaluation pipeline.
        Calculates:
          - Composite Risk Score (0-100)
          - Risk Category & Priority Rank
          - Temporary Speed Restriction (TSR km/h)
          - 3-day, 7-day, 14-day future risk projections
          - Days to critical failure (85.0 threshold)
          - Risk Velocity & deterioration status
          - Explainable AI (XAI) feature contribution breakdown
          - Maintenance recommendation tier
        """
        track_id = str(track_data.get("track_id", "T041"))
        
        # 1. Extract and normalize fused features
        features = extract_features(track_data, fault_data, weather_data, delay_days)

        # 2. Predict baseline risk score using ML model
        risk_score = self.model.predict(features)

        # 3. Categorize Risk & Speed Restriction
        speed_limit = int(track_data.get("speed_limit", track_data.get("speed_limit_kmh", 130)))
        if risk_score >= 75.0:
            category = "Critical"
            priority = 1
            tsr_speed = 30
            color_code = "#ef4444"
            urgency = "Immediate inspection & TSR 30 km/h"
        elif risk_score >= 55.0:
            category = "High"
            priority = 2
            tsr_speed = 60
            color_code = "#f59e0b"
            urgency = "Schedule maintenance block within 48 hours"
        elif risk_score >= 35.0:
            category = "Moderate"
            priority = 3
            tsr_speed = 90
            color_code = "#3b82f6"
            urgency = "Routine weekly maintenance window"
        else:
            category = "Low"
            priority = 4
            tsr_speed = speed_limit
            color_code = "#10b981"
            urgency = "Normal monitoring"

        # 4. Forecast degradation trajectory & velocity
        traffic_gmt = float(features.get("_raw_traffic_gmt", 45.0))
        weather_stress = (features.get("thermal_stress", 0.4) + features.get("rain_stress", 0.2)) / 2.0
        forecast = forecast_risk_trajectory(
            base_risk=risk_score,
            traffic_gmt=traffic_gmt,
            weather_stress=weather_stress,
            delay_days=delay_days
        )

        # 5. Compute Explainable AI (XAI) feature attribution
        xai_res = compute_xai_attribution(features, risk_score, track_id)

        # 6. Maintenance Tier Recommendation
        previous_repairs = int(features.get("_raw_previous_repairs", 2))
        is_recurring = previous_repairs >= 3
        tier_info = assign_maintenance_tier(risk_score, is_recurring)

        # Assemble unified response matching Member 2 and Member 5 contracts
        return {
            "track_id": track_id,
            "risk_score": risk_score,
            "risk_category": category,
            "category": category,
            "priority": priority,
            "normal_speed_kmh": speed_limit,
            "tsr_speed_kmh": tsr_speed,
            "tsr_speed": tsr_speed,
            "color_code": color_code,
            "predicted_risk_3_days": forecast["predicted_risk_3_days"],
            "predicted_risk_7_days": forecast["predicted_risk_7_days"],
            "predicted_risk_14_days": forecast["predicted_risk_14_days"],
            "days_to_critical": forecast["days_to_critical"],
            "risk_velocity": forecast["risk_velocity"],
            "urgency_action": urgency,
            "recommendation_tier": tier_info,
            "is_recurring_failure": is_recurring,
            "xai_breakdown": xai_res["xai_breakdown"],
            "top_factors": xai_res["top_factors"],
            "diagnostic_summary": xai_res["summary"],
            "degradation_curve": forecast["degradation_curve"]
        }

    def simulate(
        self,
        base_risk: float,
        delay_days: int = 0,
        temp_c: float = 38.0,
        monsoon_alert: bool = False,
        traffic_increase_pct: float = 0.0,
        speed_restriction_active: bool = False
    ) -> Dict[str, Any]:
        """Runs what-if simulation for delayed maintenance or weather stress."""
        return simulate_scenario(
            base_risk=base_risk,
            delay_days=delay_days,
            temp_c=temp_c,
            monsoon_alert=monsoon_alert,
            traffic_increase_pct=traffic_increase_pct,
            speed_restriction_active=speed_restriction_active
        )

    def optimize_budget(
        self,
        candidate_tracks: List[Dict[str, Any]],
        total_budget_inr: float = 5000000.0
    ) -> Dict[str, Any]:
        """Optimizes maintenance spending across tracks within budget (default ₹50 Lakh)."""
        return optimize_budget_allocation(candidate_tracks, total_budget_inr)

    def rank_network(
        self,
        tracks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Ranks entire network tracks by urgency priority index."""
        return rank_network_tracks(tracks)

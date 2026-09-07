"""
RailGuard - Member 4: AI/ML Risk & Prediction Package
Exports:
  - RailGuardRiskEngine (Master Facade)
  - extract_features
  - forecast_risk_trajectory
  - compute_xai_attribution
  - simulate_scenario
  - optimize_budget_allocation
  - rank_network_tracks
"""

from .engine import RailGuardRiskEngine
from .feature_extractor import extract_features, feature_dict_to_vector
from .forecaster import forecast_risk_trajectory
from .explainability import compute_xai_attribution
from .what_if_simulator import simulate_scenario
from .budget_optimizer import optimize_budget_allocation, assign_maintenance_tier
from .ranker import rank_network_tracks

__all__ = [
    "RailGuardRiskEngine",
    "extract_features",
    "feature_dict_to_vector",
    "forecast_risk_trajectory",
    "compute_xai_attribution",
    "simulate_scenario",
    "optimize_budget_allocation",
    "assign_maintenance_tier",
    "rank_network_tracks"
]

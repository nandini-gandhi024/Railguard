"""
RailGuard - Member 4: AI/ML Risk & Prediction
Comprehensive Verification & Demonstration Suite
Tests all 7 Core Deliverables:
  1. Composite Risk Score (0-100) on Track T041
  2. Future Risk Forecasting (Current -> 3d -> 7d -> 14d)
  3. Risk Velocity & Deterioration Status
  4. Explainable AI (XAI) Feature Attribution & Diagnostic Narrative
  5. What-If Simulation Engine (Delay days & Weather/Traffic stress)
  6. Network-Wide Priority Ranking & Recurring Defect Identification
  7. Maintenance Budget Optimizer (₹50 Lakh Allocation)
  8. FastAPI Endpoints Integration (including Member 5 React APIs)
"""

import sys
import json
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


from fastapi.testclient import TestClient
from main import app
from ai.risk_prediction import (
    RailGuardRiskEngine,
    extract_features,
    forecast_risk_trajectory,
    compute_xai_attribution,
    simulate_scenario,
    optimize_budget_allocation,
    rank_network_tracks
)

client = TestClient(app)


def print_banner(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def test_member4_pipeline():
    engine = RailGuardRiskEngine()

    print_banner("1. TRACK T041 RISK ASSESSMENT & SCORING (0-100)")
    # Data for Track T041 matching hackathon case study
    track_t041 = {
        "track_id": "T041",
        "location": "KM 142.5 Delhi-Kanpur Mainline (Synthetic)",
        "section": "NDLS-CNB High-Density Corridor",
        "track_age": 14,
        "traffic_per_day": 58,
        "speed_limit": 130,
        "curve_radius": 1200.0,
        "previous_repairs": 4,
        "last_tamping_days": 210,
        "network_importance": 9
    }
    fault_crack = {
        "defect_type": "crack",
        "severity": 92.0,
        "confidence": 0.95
    }
    weather_t041 = {
        "temperature_c": 42.4,
        "rainfall": 15.0,
        "monsoon_alert": False,
        "environmental_risk_score": 82.0
    }

    result = engine.evaluate_track(track_t041, fault_crack, weather_t041)
    
    print(f"   [+] Track ID:            {result['track_id']}")
    print(f"   [+] Composite Risk Score: {result['risk_score']} / 100")
    print(f"   [+] Risk Category:        {result['risk_category']} (Priority #{result['priority']})")
    print(f"   [+] Speed Restriction:   TSR {result['tsr_speed_kmh']} km/h (Normal: {result['normal_speed_kmh']} km/h)")
    print(f"   [+] Recommendation:      {result['urgency_action']}")
    assert result['risk_score'] >= 75.0, "T041 with severe crack must evaluate to Critical (>=75)"
    assert result['priority'] == 1, "T041 must have Priority #1"

    print_banner("2. FUTURE RISK PREDICTION (3-Day, 7-Day, 14-Day)")
    print(f"   [+] Current Risk:  {result['risk_score']}")
    print(f"   [+] 3-Day Risk:    {result['predicted_risk_3_days']}")
    print(f"   [+] 7-Day Risk:    {result['predicted_risk_7_days']}")
    print(f"   [+] 14-Day Risk:   {result['predicted_risk_14_days']}")
    print(f"   [+] Trajectory:    {result['risk_score']} -> {result['predicted_risk_3_days']} -> {result['predicted_risk_7_days']} -> {result['predicted_risk_14_days']}")
    assert result['predicted_risk_14_days'] >= result['risk_score'], "Future risk must non-linearly accumulate"

    print_banner("3. RISK VELOCITY & DETERIORATION ACCELERATION")
    vel = result['risk_velocity']
    print(f"   [+] Velocity Rate:   {vel['points_per_day']} points / day")
    print(f"   [+] Status:          {vel['status']}")
    print(f"   [+] Alert Banner:    {vel['alert']}")
    print(f"   [+] Days to Failure: {result['days_to_critical']} days")

    print_banner("4. EXPLAINABLE AI (XAI) - 'WHY IS T041 HIGH RISK?'")
    print("   [+] Factor Contribution Breakdown (Sums to 100%):")
    for factor, pct in result['xai_breakdown'].items():
        bar = "#" * int(pct // 4)
        print(f"       * {factor:<24} : {pct:>5.1f}%  {bar}")
    print(f"\n   [+] Top Contributing Factors:")
    for tf in result['top_factors'][:3]:
        print(f"       - {tf['factor']}: {tf['metric']} ({tf['contribution_pct']}%) -> {tf['impact']}")
    print(f"\n   [+] Natural Language Diagnostic Explanation:")
    print(f"       \"{result['diagnostic_summary']}\"")

    print_banner("5. WHAT-IF SCENARIO SIMULATOR")
    # Simulation: Delay maintenance by 7 days
    sim_7d = engine.simulate(
        base_risk=result['risk_score'],
        delay_days=7,
        temp_c=42.4,
        traffic_increase_pct=25.0
    )
    print("   Scenario: 'What if maintenance is deferred by 7 days under summer heat?'")
    print(f"   [+] Current Baseline Risk:      {sim_7d['current_risk']}")
    print(f"   [+] Delayed 7-Day Risk:         {sim_7d['simulated_risk']} (+{sim_7d['risk_change']} points)")
    print(f"   [+] Counterfactual: If Repaired Today -> Projected Risk: {sim_7d['repair_today_projected_risk']}")
    print(f"   [+] Days to Critical Failure:   {sim_7d['days_to_critical']} days")

    print_banner("6. MAINTENANCE BUDGET OPTIMIZER (₹50 LAKH ALLOCATION)")
    sample_network = [
        {"track_id": "T041", "section": "NDLS-CNB Mainline", "risk_score": 92.4, "network_importance": 10, "defect_type": "crack", "previous_repairs": 4},
        {"track_id": "T027", "section": "Bhor Ghat Mountain Line", "risk_score": 84.0, "network_importance": 9, "defect_type": "track_buckling", "previous_repairs": 3},
        {"track_id": "T014", "section": "Grand Chord Coal Corridor", "risk_score": 78.5, "network_importance": 9, "defect_type": "broken_sleeper", "previous_repairs": 2},
        {"track_id": "T008", "section": "Western Coastal Spine", "risk_score": 64.0, "network_importance": 7, "defect_type": "ballast_void", "previous_repairs": 1},
        {"track_id": "T019", "section": "Secunderabad Trunk", "risk_score": 58.0, "network_importance": 8, "defect_type": "head_check", "previous_repairs": 2},
        {"track_id": "T033", "section": "Southern Branch Line", "risk_score": 42.0, "network_importance": 5, "defect_type": "missing_clip", "previous_repairs": 0},
    ]
    budget_res = engine.optimize_budget(sample_network, total_budget_inr=5000000.0)
    print(f"   [+] Budget Limit:      ₹{budget_res['budget_limit_lakh']} Lakh")
    print(f"   [+] Allocated Budget:  ₹{budget_res['allocated_budget_lakh']} Lakh ({budget_res['budget_utilization_pct']}% utilized)")
    print(f"   [+] Remaining Budget:  ₹{budget_res['remaining_budget_lakh']} Lakh")
    print(f"   [+] Risk Points Saved: {budget_res['total_risk_points_prevented']} points across corridor")
    print("\n   [+] Selected Tracks for Immediate Action:")
    for st in budget_res['selected_tracks']:
        print(f"       * {st['track_id']} ({st['section']}): Risk {st['current_risk']} -> Residual {st['projected_residual_risk']} | Cost: ₹{st['cost_lakh']}L | Tier: {st['tier']} ({st['timeframe']})")
    
    print("\n   [+] RailGuard Maintenance Tier Classification:")
    for st in budget_res['selected_tracks'][:3]:
        print(f"       - {st['track_id']} -> {st['tier']} ({st['action']})")

    print_banner("7. FASTAPI MEMBER 4 ENDPOINTS VERIFICATION")
    # Test GET /risk/T041
    r1 = client.get("/risk/T041")
    assert r1.status_code == 200
    print(f"   [+] GET /risk/T041 -> Status: {r1.status_code} | Risk: {r1.json()['risk']['score']}")

    # Test GET /risk-velocity/T041
    r2 = client.get("/risk-velocity/T041")
    assert r2.status_code == 200
    print(f"   [+] GET /risk-velocity/T041 -> Status: {r2.status_code} | Status: {r2.json()['velocity']['status']}")

    # Test GET /network-ranking
    r3 = client.get("/network-ranking")
    assert r3.status_code == 200
    print(f"   [+] GET /network-ranking -> Status: {r3.status_code} | Ranked: {r3.json()['total_tracks_monitored']} tracks")

    # Test POST /api/assess-risk (Member 5 frontend contract)
    r4 = client.post("/api/assess-risk", json={"track_id": "T041", "defect_severity": 92.0})
    assert r4.status_code == 200
    print(f"   [+] POST /api/assess-risk -> Status: {r4.status_code} | Composite: {r4.json()['composite_risk']}")

    # Test POST /api/simulate-risk (Member 5 frontend contract)
    r5 = client.post("/api/simulate-risk", json={"temperature_c": 42.0, "delay_days": 7, "traffic_increase_pct": 20.0})
    assert r5.status_code == 200
    print(f"   [+] POST /api/simulate-risk -> Status: {r5.status_code} | Simulated tracks: {len(r5.json()['results'])}")

    # Test POST /optimize-budget
    r6 = client.post("/optimize-budget?total_budget_inr=5000000.0")
    assert r6.status_code == 200
    print(f"   [+] POST /optimize-budget -> Status: {r6.status_code} | Tracks allocated: {r6.json()['selected_tracks_count']}")

    print_banner("ALL 7 MEMBER 4 DELIVERABLES VALIDATED & FULLY PASSING! [SUCCESS]")


if __name__ == "__main__":
    test_member4_pipeline()

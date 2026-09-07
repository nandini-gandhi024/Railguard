"""
RailGuard - Member 4: AI/ML Risk & Prediction Interactive Presentation Demo
Smart India Hackathon (SIH 2026) | Problem Statement: SIH26027
Run this script to showcase Member 4's complete AI Decision Engine:
  python backend/demo_member4.py
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from ai.risk_prediction import RailGuardRiskEngine


def main():
    engine = RailGuardRiskEngine()

    print("\n" + "=" * 76)
    print("  * RAILGUARD - MEMBER 4 (AI/ML: RISK & PREDICTION) LIVE SHOWCASE *")
    print("=" * 76)

    # 1. Track T041 Evaluation
    print("\n" + "-" * 76)
    print("  [DEMO 1] RISK ASSESSMENT FOR TRACK T041 (GOLDEN CORRIDOR)")
    print("-" * 76)
    track_t041 = {
        "track_id": "T041",
        "location": "KM 142.5 Delhi-Kanpur Mainline",
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

    res = engine.evaluate_track(track_t041, fault_crack, weather_t041)

    print(f"  Track ID:                {res['track_id']} ({track_t041['location']})")
    print(f"  Defect Detected:         Transverse Fatigue Crack (Severity: 92/100, Conf: 95%)")
    print(f"  Traffic GMT / Day:       58 GMT/day | Track Age: 14 Years | Prior Repairs: 4")
    print(f"  Environmental Context:   42.4 deg C Rail Surface Temp, High Expansion Stress")
    print(f"  -> RISK SCORE:           {res['risk_score']} / 100  [{res['risk_category'].upper()} - Priority #{res['priority']}]")
    print(f"  -> TSR SPEED RESTRICTION: TSR {res['tsr_speed_kmh']} km/h (Normal Line Speed: {res['normal_speed_kmh']} km/h)")
    print(f"  -> URGENCY ACTION:       {res['urgency_action']}")

    # 2. Future Risk Forecasting
    print("\n" + "-" * 76)
    print("  [DEMO 2] FUTURE RISK TRAJECTORY (3-DAY, 7-DAY, 14-DAY FORECAST)")
    print("-" * 76)
    print(f"  Current Risk:            {res['risk_score']} / 100")
    print(f"  Projected 3-Day Risk:    {res['predicted_risk_3_days']} / 100")
    print(f"  Projected 7-Day Risk:    {res['predicted_risk_7_days']} / 100")
    print(f"  Projected 14-Day Risk:   {res['predicted_risk_14_days']} / 100")
    print(f"  Degradation Trajectory:  {res['risk_score']} -> {res['predicted_risk_3_days']} -> {res['predicted_risk_7_days']} -> {res['predicted_risk_14_days']}")
    print(f"  Days to Critical (85+):  {res['days_to_critical']} days")

    # 3. Risk Velocity
    print("\n" + "-" * 76)
    print("  [DEMO 3] RISK VELOCITY & DETERIORATION ACCELERATION")
    print("-" * 76)
    vel = res['risk_velocity']
    print(f"  Risk Velocity:           {vel['points_per_day']} points / day")
    print(f"  Deterioration Status:    {vel['status']}")
    print(f"  Early Warning Alert:     {vel['alert']}")

    # 4. Explainable AI (XAI)
    print("\n" + "-" * 76)
    print("  [DEMO 4] EXPLAINABLE AI (XAI) - 'WHY IS T041 HIGH RISK?'")
    print("-" * 76)
    print("  Feature Contribution Breakdown (Sums to 100%):")
    for factor, pct in res['xai_breakdown'].items():
        bar = "#" * int(pct // 3)
        print(f"    * {factor:<24} : {pct:>5.1f}%  [{bar}]")
    
    print("\n  Top Contributing Factors for Dashboard UI:")
    for i, tf in enumerate(res['top_factors'][:4], 1):
        print(f"    {i}. {tf['factor']}: {tf['metric']} ({tf['contribution_pct']}%)")

    print(f"\n  Engineer Diagnostic Summary:")
    print(f"    \"{res['diagnostic_summary']}\"")

    # 5. What-If Simulation
    print("\n" + "-" * 76)
    print("  [DEMO 5] WHAT-IF SCENARIO SIMULATION")
    print("-" * 76)
    print("  Question: 'What if maintenance is deferred by 7 days under extreme heat?'")
    sim = engine.simulate(
        base_risk=res['risk_score'],
        delay_days=7,
        temp_c=42.4,
        traffic_increase_pct=25.0
    )
    print(f"  * Baseline Today:        Risk {sim['current_risk']} (TSR {sim['tsr_speed']} km/h)")
    print(f"  * Deferred 7 Days:       Risk {sim['simulated_risk']} (+{sim['risk_change']} points surge!)")
    print(f"  * Counterfactual:        If Repaired Today -> Risk Plummets to {sim['repair_today_projected_risk']}")

    # 6. Budget Optimizer
    print("\n" + "-" * 76)
    print("  [DEMO 6] MAINTENANCE BUDGET OPTIMIZER (Rs 50 LAKH ALLOCATION)")
    print("-" * 76)
    corridor_candidates = [
        {"track_id": "T041", "section": "NDLS-CNB Mainline", "risk_score": 92.4, "network_importance": 10, "defect_type": "crack", "previous_repairs": 4},
        {"track_id": "T027", "section": "Bhor Ghat Mountain Line", "risk_score": 84.0, "network_importance": 9, "defect_type": "track_buckling", "previous_repairs": 3},
        {"track_id": "T014", "section": "Grand Chord Coal Corridor", "risk_score": 78.5, "network_importance": 9, "defect_type": "broken_sleeper", "previous_repairs": 2},
        {"track_id": "T008", "section": "Western Coastal Spine", "risk_score": 64.0, "network_importance": 7, "defect_type": "ballast_void", "previous_repairs": 1},
        {"track_id": "T019", "section": "Secunderabad Trunk", "risk_score": 58.0, "network_importance": 8, "defect_type": "head_check", "previous_repairs": 2},
        {"track_id": "T033", "section": "Southern Branch Line", "risk_score": 42.0, "network_importance": 5, "defect_type": "missing_clip", "previous_repairs": 0},
    ]
    budget_result = engine.optimize_budget(corridor_candidates, total_budget_inr=5000000.0)

    print(f"  Available Budget:        Rs {budget_result['budget_limit_lakh']} Lakh (Rs 50,00,000)")
    print(f"  Allocated Budget:        Rs {budget_result['allocated_budget_lakh']} Lakh ({budget_result['budget_utilization_pct']}% utilized)")
    print(f"  Remaining Reserve:       Rs {budget_result['remaining_budget_lakh']} Lakh")
    print(f"  Network Risk Reduction:  {budget_result['total_risk_points_prevented']} Cumulative Risk Points Saved!\n")

    print("  OPTIMIZED TRACK REPAIR SCHEDULE & MAINTENANCE TIERS:")
    print("  " + "-" * 72)
    print(f"  {'Track':<6} | {'Section':<24} | {'Risk':<5} | {'Cost':<7} | {'Tier / Action'}")
    print("  " + "-" * 72)
    for st in budget_result['selected_tracks']:
        print(f"  {st['track_id']:<6} | {st['section']:<24} | {st['current_risk']:<5.1f} | Rs {st['cost_lakh']:>4.1f}L | {st['tier']} ({st['timeframe']})")
    print("  " + "-" * 72)

    print("\n" + "=" * 76)
    print("  [SUCCESS] ALL MEMBER 4 MODULES FULLY OPERATIONAL & READY FOR EVALUATION!")
    print("=" * 76 + "\n")


if __name__ == "__main__":
    main()

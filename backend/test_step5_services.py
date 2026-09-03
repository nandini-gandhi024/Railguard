from services.fault_detection import detect_fault
from services.risk_engine import calculate_risk
from services.weather import get_weather_context
from services.maintenance_optimizer import optimize_maintenance_schedule

print("==================================================")
print("  STEP 5: SERVICE LAYER & AI MOCK INTERFACES TEST ")
print("==================================================")

# Test 1: Fault Detection Service (Member 3 Interface)
print("\n1. Testing Fault Detection AI Service (Member 3 Mock)...")
fault_res = detect_fault(None)
print(f"   Defect Type: {fault_res['defect_type']} | Confidence: {fault_res['confidence']} | Severity: {fault_res['severity']}")
assert fault_res["defect_type"] == "crack"
assert fault_res["confidence"] == 0.94
assert fault_res["severity"] == 85.0

# Test 2: Weather & Environmental Service (Member 6 Interface)
print("\n2. Testing Weather & Environmental Context Service (Member 6 Mock)...")
weather_res = get_weather_context("Delhi Division")
print(f"   Location: {weather_res['location']} | Temp: {weather_res['temperature_c']}°C | Risk: {weather_res['environmental_risk']}")
assert weather_res["temperature_c"] == 38.0

# Test 3: Risk Engine AI Service (Member 4 Interface)
print("\n3. Testing Risk Prediction AI Service (Member 4 Mock)...")
risk_res = calculate_risk(
    track_data={"track_id": "T041", "traffic_per_day": 58, "track_age": 14, "speed_limit": 130},
    fault_data=fault_res,
    weather_data=weather_res,
    delay_days=0
)
print(f"   Risk Score: {risk_res['risk_score']} | Category: {risk_res['risk_category']} | Priority: {risk_res['priority']}")
print(f"   7-Day Projected Risk: {risk_res['predicted_risk_7_days']} | 14-Day Projected Risk: {risk_res['predicted_risk_14_days']}")
assert "risk_score" in risk_res
assert "risk_category" in risk_res
assert "priority" in risk_res
assert "predicted_risk_7_days" in risk_res

# Test 4: SIH26027 Maintenance Optimizer Service
print("\n4. Testing SIH26027 Maintenance Block Optimizer Service...")
opt_res = optimize_maintenance_schedule("T041", risk_res["risk_score"])
print(f"   Recommended Window: {opt_res['recommended_window']} | Availability Gain: +{opt_res['asset_availability_gain_pct']}%")
assert opt_res["recommended_window"] == "01:00–03:00"

print("\n==================================================")
print("  ALL STEP 5 SERVICE TESTS PASSED CLEANLY ")
print("==================================================")

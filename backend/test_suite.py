import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("==================================================================")
print("  RAILGUARD BACKEND MEMBER 2 COMPLETE AUTOMATED TEST SUITE        ")
print("==================================================================")

# Test 1: GET /
res1 = client.get("/")
print(f"\n1. GET / -> Status: {res1.status_code}")
print(f"   Payload: {res1.json()['system']} | SIH Statement: {res1.json()['sih_problem_statement']}")
assert res1.status_code == 200

# Test 2: GET /health
res2 = client.get("/health")
print(f"\n2. GET /health -> Status: {res2.status_code}")
print(f"   Payload: {res2.json()}")
assert res2.status_code == 200

# Test 3: GET /tracks
res3 = client.get("/tracks")
print(f"\n3. GET /tracks -> Status: {res3.status_code} | Monitored Tracks Count: {len(res3.json())}")
assert res3.status_code == 200
assert len(res3.json()) > 0

# Test 4: GET /tracks/T041
res4 = client.get("/tracks/T041")
print(f"\n4. GET /tracks/T041 -> Status: {res4.status_code}")
print(f"   Track Detail: {res4.json()['track_id']} - {res4.json()['location']} ({res4.json()['speed_limit']} km/h)")
assert res4.status_code == 200
assert res4.json()["track_id"] == "T041"

# Test 5: POST /tracks (Idempotent Create/Update)
res5 = client.post(
    "/tracks",
    json={
        "track_id": "T088",
        "location": "KM 95.2 Aligarh Corridor",
        "section": "NDLS-CNB Mainline",
        "division": "Delhi Division",
        "zone": "Northern Railway (NR)",
        "track_age": 10,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 48,
        "speed_limit": 130,
        "curve_radius": 1400.0,
        "previous_repairs": 2,
        "last_tamping_days": 110,
        "network_importance": 8
    }
)
print(f"\n5. POST /tracks -> Status: {res5.status_code}")
print(f"   Registered Track: {res5.json()['track_id']} - {res5.json()['location']}")
assert res5.status_code in [200, 201]

# Test 6: POST /analyze-image (Master Pipeline)
res6 = client.post(
    "/analyze-image",
    data={"track_id": "T041"}
)
print(f"\n6. POST /analyze-image -> Status: {res6.status_code}")
print(f"   Defect: {res6.json()['fault']['defect_type']} (Severity: {res6.json()['fault']['severity']})")
print(f"   Risk Score: {res6.json()['risk']['score']} ({res6.json()['risk']['category']}) | TSR: {res6.json()['risk']['tsr_speed_kmh']} km/h")
print(f"   7-Day Prediction: {res6.json()['prediction']['risk_7_days']} | 14-Day Prediction: {res6.json()['prediction']['risk_14_days']}")
assert res6.status_code == 200
assert res6.json()["track_id"] == "T041"

# Test 7: GET /risk/T041
res7 = client.get("/risk/T041")
print(f"\n7. GET /risk/T041 -> Status: {res7.status_code}")
print(f"   XAI Metrics: {list(res7.json()['xai_breakdown'].keys())}")
assert res7.status_code == 200

# Test 8: POST /simulate (What-If Delayed Maintenance)
res8 = client.post(
    "/simulate",
    json={"track_id": "T041", "delay_days": 7}
)
print(f"\n8. POST /simulate -> Status: {res8.status_code}")
print(f"   Current Risk: {res8.json()['current_risk']} -> Predicted Risk: {res8.json()['predicted_risk']} (Change: +{res8.json()['risk_change']})")
assert res8.status_code == 200
assert res8.json()["predicted_risk"] > res8.json()["current_risk"]

# Test 9: POST /optimize-maintenance (SIH26027 Block Solver)
res9 = client.post(
    "/optimize-maintenance",
    json={"corridor_section": "NDLS-CNB Mainline Corridor"}
)
print(f"\n9. POST /optimize-maintenance -> Status: {res9.status_code}")
print(f"   Recommended Slot: {res9.json()['optimized_blocks'][0]['scheduled_start']} to {res9.json()['optimized_blocks'][0]['scheduled_end']}")
print(f"   Corridor Availability Gain: +{res9.json()['metrics']['asset_availability_gain_pct']}%")
assert res9.status_code == 200

print("\n==================================================================")
print("  [SUCCESS] ALL 9 MEMBER 2 API ENDPOINTS VERIFIED AND PASSED CLEANLY!")
print("==================================================================")

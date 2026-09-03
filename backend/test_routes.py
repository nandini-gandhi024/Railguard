import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("==================================================")
print("  RAILGUARD BACKEND MEMBER 2 API ROUTE TESTS    ")
print("==================================================")

# Test 1: GET /health
res1 = client.get("/health")
print(f"\n1. GET /health -> Status: {res1.status_code}")
print(f"   Payload: {res1.json()}")
assert res1.status_code == 200

# Test 2: GET /tracks
res2 = client.get("/tracks")
print(f"\n2. GET /tracks -> Status: {res2.status_code} | Count: {len(res2.json())}")
assert res2.status_code == 200

# Test 3: POST /analyze-image (CORE PIPELINE)
res3 = client.post(
    "/analyze-image",
    data={"track_id": "T041"}
)
print(f"\n3. POST /analyze-image -> Status: {res3.status_code}")
print("   Response Payload:")
print(json.dumps(res3.json(), indent=2))
assert res3.status_code == 200
assert res3.json()["track_id"] == "T041"
assert "fault" in res3.json()
assert "risk" in res3.json()
assert "prediction" in res3.json()

# Test 4: GET /risk/T041
res4 = client.get("/risk/T041")
print(f"\n4. GET /risk/T041 -> Status: {res4.status_code}")
print(f"   Score: {res4.json()['risk']['score']} | Category: {res4.json()['risk']['category']}")
assert res4.status_code == 200

# Test 5: POST /simulate (WHAT-IF)
res5 = client.post(
    "/simulate",
    json={"track_id": "T041", "delay_days": 7}
)
print(f"\n5. POST /simulate -> Status: {res5.status_code}")
print(f"   Payload: {res5.json()}")
assert res5.status_code == 200
assert res5.json()["predicted_risk"] > res5.json()["current_risk"]

# Test 6: POST /optimize-maintenance (SIH26027)
res6 = client.post(
    "/optimize-maintenance",
    json={"corridor_section": "NDLS-CNB Mainline Corridor"}
)
print(f"\n6. POST /optimize-maintenance -> Status: {res6.status_code}")
print(f"   Gain: +{res6.json()['metrics']['asset_availability_gain_pct']}% | Reasoning: {res6.json()['reasoning']}")
assert res6.status_code == 200

print("\n==================================================")
print("  ALL MEMBER 2 API ENDPOINTS VERIFIED CLEANLY ")
print("==================================================")

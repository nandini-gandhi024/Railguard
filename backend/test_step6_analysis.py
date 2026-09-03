from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base
from routes.tracks import router as tracks_router
from routes.analysis import router as analysis_router

# Create test app mounting tracks & analysis routers
app = FastAPI()
app.include_router(tracks_router)
app.include_router(analysis_router)

# Create DB tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("==================================================")
print("  STEP 6: MASTER POST /analyze-image PIPELINE TEST")
print("==================================================")

# Test 1: POST /analyze-image with track_id T041
print("\n1. Testing POST /analyze-image (track_id: T041)...")
res = client.post("/analyze-image", data={"track_id": "T041"})
print(f"   HTTP Status: {res.status_code}")
assert res.status_code == 200

payload = res.json()
print("   Response Payload Structure:")
import json
print(json.dumps(payload, indent=2))

# Validate required JSON keys matching team contract
assert payload["track_id"] == "T041"
assert "fault" in payload
assert payload["fault"]["defect_type"] == "crack"
assert payload["fault"]["confidence"] == 0.94
assert payload["fault"]["severity"] == 85.0

assert "risk" in payload
assert "score" in payload["risk"]
assert "category" in payload["risk"]
assert "priority" in payload["risk"]

assert "prediction" in payload
assert "risk_7_days" in payload["prediction"]
assert "risk_14_days" in payload["prediction"]

assert "recommendation" in payload
assert "action" in payload["recommendation"]
assert "urgency" in payload["recommendation"]

print("\n==================================================")
print("  ALL STEP 6 ANALYSIS PIPELINE TESTS PASSED CLEANLY")
print("==================================================")

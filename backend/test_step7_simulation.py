from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base
from routes.tracks import router as tracks_router
from routes.simulation import router as simulation_router

# Create test app mounting tracks & simulation routers
app = FastAPI()
app.include_router(tracks_router)
app.include_router(simulation_router)

# Create DB tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("==================================================")
print("  STEP 7: WHAT-IF SIMULATION API TEST             ")
print("==================================================")

# Test 1: POST /simulate with 7 days delay
print("\n1. Testing POST /simulate (delay_days: 7)...")
sim_payload = {
    "track_id": "T041",
    "delay_days": 7,
    "temperature_c": 42.0,
    "monsoon_alert": True,
    "traffic_increase_pct": 25.0
}
res1 = client.post("/simulate", json=sim_payload)
print(f"   HTTP Status: {res1.status_code}")
assert res1.status_code == 200

payload = res1.json()
print("   Simulation Output Payload:")
import json
print(json.dumps(payload, indent=2))

# Validate required contract keys
assert payload["track_id"] == "T041"
assert "current_risk" in payload
assert "predicted_risk" in payload
assert "risk_change" in payload
assert payload["predicted_risk"] >= payload["current_risk"]
assert payload["risk_change"] == round(payload["predicted_risk"] - payload["current_risk"], 1)

print("\n==================================================")
print("  ALL STEP 7 SIMULATION TESTS PASSED CLEANLY     ")
print("==================================================")

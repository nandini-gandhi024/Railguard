from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base
from routes.tracks import router as tracks_router
from routes.optimization import router as optimization_router

# Create test app mounting tracks & optimization routers
app = FastAPI()
app.include_router(tracks_router)
app.include_router(optimization_router)

# Create DB tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("==================================================")
print("  STEP 8: SIH26027 BLOCK OPTIMIZATION API TEST    ")
print("==================================================")

# Test 1: POST /optimize-maintenance
print("\n1. Testing POST /optimize-maintenance (Corridor: NDLS-CNB)...")
opt_payload = {
    "corridor_section": "NDLS-CNB Mainline Corridor"
}
res1 = client.post("/optimize-maintenance", json=opt_payload)
print(f"   HTTP Status: {res1.status_code}")
assert res1.status_code == 200

payload = res1.json()
print("   SIH26027 Optimization Output Payload:")
import json
print(json.dumps(payload, indent=2))

# Validate required contract keys
assert payload["corridor_section"] == "NDLS-CNB Mainline Corridor"
assert "optimized_blocks" in payload
assert len(payload["optimized_blocks"]) > 0
assert "metrics" in payload
assert payload["metrics"]["asset_availability_gain_pct"] > 0
assert "reasoning" in payload

print("\n==================================================")
print("  ALL STEP 8 OPTIMIZATION TESTS PASSED CLEANLY   ")
print("==================================================")

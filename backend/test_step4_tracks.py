from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base
from routes.tracks import router

# Create test app mounting tracks router
app = FastAPI()
app.include_router(router)

# Create DB tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("==================================================")
print("  STEP 4: TRACK CRUD API ROUTES TEST              ")
print("==================================================")

# Test 1: GET /health
res1 = client.get("/health")
print(f"\n1. GET /health -> Status: {res1.status_code}")
print(f"   Payload: {res1.json()}")
assert res1.status_code == 200

# Test 2: POST /tracks (Create Track T099)
print("\n2. Testing POST /tracks (Create/Update Track T099)...")
new_track_payload = {
    "track_id": "T099",
    "location": "KM 88.4 Ghaziabad Section",
    "section": "NDLS-CNB Mainline",
    "division": "Delhi Division",
    "zone": "Northern Railway (NR)",
    "track_age": 9,
    "steel_grade": "60kg 90UTS",
    "traffic_per_day": 40,
    "speed_limit": 130,
    "curve_radius": 1500.0,
    "previous_repairs": 1,
    "last_tamping_days": 90,
    "network_importance": 8
}
res2 = client.post("/tracks", json=new_track_payload)
print(f"   POST /tracks -> Status: {res2.status_code}")
print(f"   Created/Updated Track: {res2.json()['track_id']} - {res2.json()['location']}")
assert res2.status_code in [200, 201]

# Test 3: GET /tracks (List All Tracks)
res3 = client.get("/tracks")
print(f"\n3. GET /tracks -> Status: {res3.status_code} | Total Tracks: {len(res3.json())}")
assert res3.status_code == 200
assert len(res3.json()) > 0

# Test 4: GET /tracks/T041
res4 = client.get("/tracks/T041")
print(f"\n4. GET /tracks/T041 -> Status: {res4.status_code}")
print(f"   Track Detail: {res4.json()['track_id']} | Speed Limit: {res4.json()['speed_limit']} km/h")
assert res4.status_code == 200

print("\n==================================================")
print("  ALL STEP 4 TRACK CRUD TESTS PASSED CLEANLY ")
print("==================================================")

from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base, SessionLocal
from database.models import Track
from routes.tracks import router as tracks_router
from routes.recommendation import router as recommendation_router
from services.route_recommender import recommend_alternative_route

app = FastAPI()
app.include_router(tracks_router)
app.include_router(recommendation_router)

Base.metadata.create_all(bind=engine)
client = TestClient(app)

print("==================================================")
print("  FEATURE 2: ALTERNATIVE ROUTE RECOMMENDATION TEST")
print("==================================================")

db = SessionLocal()

# Test 1: Critical Track (T041) -> Recommendation
print("\n1. Testing Alternative Route Recommendation for Critical Track T041...")
res_t041 = recommend_alternative_route(db, "T041")
print(f"   Affected Track: {res_t041['affected_track']} (Risk: {res_t041['affected_track_risk']})")
print(f"   Recommended Route: {res_t041['recommended_route']} | Score: {res_t041['alternative_route_score']}")
print(f"   Estimated Delay: {res_t041['estimated_delay_minutes']} mins")
print(f"   Reasons: {res_t041['reason']}")
assert res_t041["affected_track"] == "T041"
assert res_t041["recommended_route"] is not None
assert res_t041["alternative_route_score"] > 0
assert "warning" in res_t041

# Test 2: Single Isolated Track (No Alternative)
print("\n2. Testing Single Isolated Track with No Candidate Alternatives...")
# Temporarily insert isolated single track in unique section
isolated_track = Track(
    track_id="TRK-ISOLATED-999",
    location="KM 999 Remote Spur Line",
    section="ISOLATED-SPUR-SECTION",
    division="Remote Division",
    zone="Isolated Zone",
    track_age=25,
    steel_grade="52kg 90UTS",
    traffic_per_day=75,
    speed_limit=80,
    curve_radius=400.0,
    previous_repairs=9,
    last_tamping_days=300,
    network_importance=5,
    status="Block Required"
)
db.add(isolated_track)
db.commit()

res_iso = recommend_alternative_route(db, "TRK-ISOLATED-999")
print(f"   Affected Track: {res_iso['affected_track']}")
print(f"   Recommended Route: {res_iso['recommended_route']}")
print(f"   Reason: {res_iso['reason']}")
assert res_iso["affected_track"] == "TRK-ISOLATED-999"

db.close()

# API Endpoint Test
print("\n3. Testing POST /recommend-alternative-route API Endpoint...")
res_api = client.post("/recommend-alternative-route", json={"track_id": "T041"})
print(f"   HTTP Status: {res_api.status_code}")
print(f"   API Response Recommended Route: {res_api.json()['recommended_route']}")
assert res_api.status_code == 200
assert res_api.json()["affected_track"] == "T041"
assert "warning" in res_api.json()

print("\n==================================================")
print("  ALL FEATURE 2 RECOMMENDATION TESTS PASSED CLEANLY")
print("==================================================")

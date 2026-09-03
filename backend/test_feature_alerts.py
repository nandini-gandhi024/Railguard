from fastapi import FastAPI
from fastapi.testclient import TestClient
from database.database import engine, Base
from routes.tracks import router as tracks_router
from routes.alerts import router as alerts_router
from services.alerts import evaluate_track_alerts

app = FastAPI()
app.include_router(tracks_router)
app.include_router(alerts_router)

Base.metadata.create_all(bind=engine)
client = TestClient(app)

print("==================================================")
print("  FEATURE 1: CRITICAL RISK ALERTS TEST            ")
print("==================================================")

# Unit Test 1: Low-Risk Track -> No Critical Alert
print("\n1. Testing Low-Risk Track (Risk: 28.0)...")
low_alerts = evaluate_track_alerts(
    track_id="TRK-LOW-001",
    risk_score=28.0,
    risk_category="Low",
    predicted_risk_7_days=33.0,
    days_to_critical=20,
    urgency_action="Normal monitoring"
)
print(f"   Generated Alerts Count: {len(low_alerts)}")
assert len(low_alerts) == 0

# Unit Test 2: High-Risk Track -> High-Risk Alert
print("\n2. Testing High-Risk Track (Risk: 62.0)...")
high_alerts = evaluate_track_alerts(
    track_id="TRK-HIGH-002",
    risk_score=62.0,
    risk_category="High",
    predicted_risk_7_days=68.0,
    days_to_critical=9,
    urgency_action="Schedule maintenance block within 48 hours"
)
print(f"   Generated Alerts Count: {len(high_alerts)}")
assert len(high_alerts) == 1
assert high_alerts[0]["severity"] == "HIGH"
assert high_alerts[0]["alert_type"] == "HIGH_RISK"

# Unit Test 3: Critical Track -> Critical Alert
print("\n3. Testing Critical Track (Risk: 88.0)...")
crit_alerts = evaluate_track_alerts(
    track_id="TRK-CRIT-003",
    risk_score=88.0,
    risk_category="Critical",
    predicted_risk_7_days=94.0,
    days_to_critical=0,
    urgency_action="Immediate inspection & TSR 30 km/h"
)
print(f"   Generated Alerts Count: {len(crit_alerts)}")
assert len(crit_alerts) == 1
assert crit_alerts[0]["severity"] == "CRITICAL"
assert crit_alerts[0]["alert_type"] == "CURRENT_CRITICAL"

# Unit Test 4: Predicted Critical Track -> Predicted Critical Alert
print("\n4. Testing Predicted Critical Track (Current Risk: 68.0, 7-Day Risk: 78.0, Days: 4)...")
pred_alerts = evaluate_track_alerts(
    track_id="TRK-PRED-004",
    risk_score=68.0,
    risk_category="High",
    predicted_risk_7_days=78.0,
    days_to_critical=4,
    urgency_action="Schedule maintenance block within 48 hours"
)
print(f"   Generated Alerts Count: {len(pred_alerts)}")
assert len(pred_alerts) == 2  # HIGH_RISK + PREDICTED_CRITICAL
assert any(a["alert_type"] == "PREDICTED_CRITICAL" for a in pred_alerts)

# API Endpoint Tests
print("\n5. Testing GET /alerts Endpoint...")
res_all = client.get("/alerts")
print(f"   HTTP Status: {res_all.status_code} | Total Alerts: {res_all.json()['total_alerts']}")
assert res_all.status_code == 200
assert res_all.json()["total_alerts"] > 0

print("\n6. Testing GET /alerts/T041 Endpoint...")
res_t041 = client.get("/alerts/T041")
print(f"   HTTP Status: {res_t041.status_code} | T041 Alerts: {res_t041.json()['total_alerts']}")
assert res_t041.status_code == 200

print("\n==================================================")
print("  ALL FEATURE 1 ALERT TESTS PASSED CLEANLY       ")
print("==================================================")

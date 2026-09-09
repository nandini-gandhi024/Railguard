"""
RailGuard MySQL Analysis Database Test
Tests: connection, save analysis result, retrieve, verify fields
Run: .\\backend\\venv\\Scripts\\python.exe backend/test_analysis_mysql.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

os.environ.setdefault("DATABASE_URL", "sqlite:///./railguard.db")
os.environ.setdefault("MYSQL_URL", "sqlite:///./railguard_analysis.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("ADMIN_SEED_EMAIL", "admin@railguard.local")
os.environ.setdefault("ADMIN_SEED_PASSWORD", "RailGuard@Admin2026")

from fastapi.testclient import TestClient
from main import app
from database.mysql_database import test_mysql_connection, analysis_engine, AnalysisSessionLocal
from database.analysis_models import AnalysisResult
import uuid

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []


def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    results.append((name, status))
    print(f"  {status}  {name}" + (f" - {detail}" if detail else ""))


print("\n" + "=" * 60)
print("  RAILGUARD ANALYSIS DATABASE TEST SUITE")
print("=" * 60 + "\n")

# ── 1. Database connection test ───────────────────────────────────
print("1. Analysis database connectivity")
conn_status = test_mysql_connection()
check("Analysis DB connects", conn_status["status"] == "connected", conn_status.get("detail", ""))

# ── 2. Direct insert test ─────────────────────────────────────────
print("\n2. Direct insert into analysis_results table")
test_analysis_id = str(uuid.uuid4())
test_result = {
    "track_id": "T041",
    "fault": {"defect_type": "crack", "confidence": 0.94, "severity": 85.0},
    "risk": {"score": 76.5, "category": "Critical", "priority": 1, "tsr_speed_kmh": 30},
    "prediction": {"risk_7_days": 81.9, "risk_14_days": 88.2, "days_to_critical": 2},
    "recommendation": {"action": "Emergency Rail Replacement", "urgency": "Critical"},
    "xai_breakdown": {"Defect Severity": 42.5, "Traffic Load": 28.3},
}

try:
    db = AnalysisSessionLocal()
    record = AnalysisResult(
        analysis_id=test_analysis_id,
        track_id="T041",
        analyzed_by="test_script@railguard.local",
        defect_type="crack",
        confidence=0.94,
        severity=85.0,
        bounding_box={"ymin": 35, "xmin": 40, "ymax": 65, "xmax": 65},
        risk_score=76.5,
        risk_category="Critical",
        priority=1,
        tsr_speed_kmh=30,
        risk_7_days=81.9,
        risk_14_days=88.2,
        days_to_critical=2,
        recommendation_action="Emergency Rail Replacement",
        urgency="Critical",
        xai_breakdown={"Defect Severity": 42.5, "Traffic Load": 28.3},
        weather_context={"temperature": 38.5, "monsoon_alert": True},
        complete_result=test_result,
    )
    db.add(record)
    db.commit()
    check("Insert AnalysisResult record", True)
    db.close()
except Exception as e:
    check("Insert AnalysisResult record", False, str(e))

# ── 3. Retrieve and verify ────────────────────────────────────────
print("\n3. Retrieve and verify saved record")
try:
    db = AnalysisSessionLocal()
    retrieved = db.query(AnalysisResult).filter(
        AnalysisResult.analysis_id == test_analysis_id
    ).first()
    check("Record retrieved", retrieved is not None)
    if retrieved:
        check("track_id correct", retrieved.track_id == "T041")
        check("defect_type correct", retrieved.defect_type == "crack")
        check("risk_score correct", retrieved.risk_score == 76.5)
        check("complete_result is dict", isinstance(retrieved.complete_result, dict))
        check("complete_result has fault key", "fault" in retrieved.complete_result)
    db.close()
except Exception as e:
    check("Retrieve and verify", False, str(e))

# ── 4. API pipeline saves to analysis DB ─────────────────────────
print("\n4. /analyze-image API → saves to analysis database")
r = client.post("/analyze-image", data={"track_id": "T041"})
check("POST /analyze-image returns 200", r.status_code == 200, r.text[:80])
if r.status_code == 200:
    try:
        db = AnalysisSessionLocal()
        count = db.query(AnalysisResult).filter(AnalysisResult.track_id == "T041").count()
        check("At least one T041 record in analysis DB", count >= 1, f"count={count}")
        db.close()
    except Exception as e:
        check("Verify API saved to analysis DB", False, str(e))

# ── 5. Analysis history endpoint ──────────────────────────────────
print("\n5. GET /analysis-history endpoint")
r = client.get("/analysis-history?track_id=T041")
check("GET /analysis-history returns 200", r.status_code == 200)
if r.status_code == 200:
    data = r.json()
    check("Results list present", "results" in data)
    check("At least one result", data.get("total", 0) >= 1)

# ── Summary ───────────────────────────────────────────────────────
print("\n" + "=" * 60)
passed = sum(1 for _, s in results if s == PASS)
total = len(results)
print(f"  RESULT: {passed}/{total} tests passed")
if passed == total:
    print("  [SUCCESS] ALL ANALYSIS DB TESTS PASSED")
else:
    failed = [n for n, s in results if s == FAIL]
    print(f"  [FAILED] {', '.join(failed)}")
print("=" * 60 + "\n")

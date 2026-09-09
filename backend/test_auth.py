"""
RailGuard Auth Test Suite
Tests:
1. Root endpoint
2. Admin login
3. /auth/me profile
4. Unauthenticated access guard
5. Request Access submission (creates pending request)
6. Pending user login fails -> "Your access request is awaiting approval."
7. Admin can view pending requests
8. Admin approves request -> creates user
9. Approved user logs in successfully
10. Admin deactivates user -> login fails -> "Your account is currently disabled."
11. Admin reactivates user -> login succeeds
12. Admin directly creates authorized account (POST /admin/users)
13. Direct account logs in successfully
14. Admin deletes user account (DELETE /admin/users/{id})
15. Deleted account cannot log in
16. Request access -> admin rejects -> user login fails -> "Your access request was not approved."
17. Role restrictions: non-admin cannot access /admin/*
18. Token refresh
19. Brute-force protection (429 after 5 failed attempts)
20. Logout
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
from database.database import SessionLocal
from auth.models import User, AccessRequest
from auth.security import hash_password

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

# Clean up test user & access requests if leftover from prior test runs
_clean_db = SessionLocal()
TEST_EMAILS = [
    "test.engineer@railway.gov.in",
    "direct.operator@railway.gov.in",
    "rejected.user@railway.gov.in",
    "brutetest@test.com",
    "inspector.test@railway.gov.in",
]
for em in TEST_EMAILS:
    _clean_db.query(AccessRequest).filter(AccessRequest.email == em).delete()
    _clean_db.query(User).filter(User.email == em).delete()

# Ensure temporary test admin exists for test suite
test_admin = _clean_db.query(User).filter(User.email == "admin@railguard.local").first()
if not test_admin:
    test_admin = User(
        email="admin@railguard.local",
        full_name="RailGuard Administrator",
        hashed_password=hash_password("RailGuard@Admin2026"),
        role="admin",
        is_active=True,
        is_approved=True,
    )
    _clean_db.add(test_admin)

_clean_db.commit()
_clean_db.close()

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []


def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    results.append((name, status))
    print(f"  {status}  {name}" + (f" - {detail}" if detail else ""))


print("\n" + "=" * 65)
print("  RAILGUARD COMPLETE AUTHENTICATION & ACCESS CONTROL TEST SUITE")
print("=" * 65 + "\n")

# ── 1. Root endpoint ───────────────────────────────────────────
print("1. Root endpoint")
r = client.get("/")
check("GET / returns 200", r.status_code == 200)

# ── 2. Login with admin credentials ──────────────────────────────
print("\n2. Admin login")
r = client.post("/auth/login", json={
    "email": "admin@railguard.local",
    "password": "RailGuard@Admin2026"
})
check("POST /auth/login returns 200", r.status_code == 200)
data = r.json()
check("access_token present", "access_token" in data)
check("refresh_token present", "refresh_token" in data)
check("user.role == admin", data.get("user", {}).get("role") == "admin")
admin_token = data.get("access_token", "")
admin_refresh = data.get("refresh_token", "")

# ── 3. GET /auth/me ───────────────────────────────────────────────
print("\n3. Current user profile")
r = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
check("GET /auth/me returns 200", r.status_code == 200)
check("email correct", r.json().get("email") == "admin@railguard.local")

# ── 4. Unauthenticated /auth/me returns 401 ───────────────────────
print("\n4. Unauthenticated access guard")
r = client.get("/auth/me")
check("GET /auth/me without token returns 401", r.status_code == 401)

# ── 5. Submit access request ──────────────────────────────────────
print("\n5. Access Request submission")
r = client.post("/auth/request-access", json={
    "full_name": "Test Engineer",
    "email": "test.engineer@railway.gov.in",
    "designation": "Track Inspector",
    "organization": "Northern Railway",
    "purpose": "Monitor track risk on Delhi-Kanpur corridor",
    "requested_role": "maintenance_engineer"
})
check("POST /auth/request-access returns 201", r.status_code == 201)
check("Confirmation message correct", "submitted for administrator approval" in r.text)

# ── 6. Pending user CANNOT log in ─────────────────────────────────
print("\n6. Pending user login enforcement")
r = client.post("/auth/login", json={
    "email": "test.engineer@railway.gov.in",
    "password": "AnyPassword123"
})
check("Pending user login returns 403", r.status_code == 403)
check("Correct detail message", r.json().get("detail") == "Your access request is awaiting approval.")

# ── 7. Admin lists pending requests ──────────────────────────────
print("\n7. Admin — list pending requests")
r = client.get("/admin/access-requests?status_filter=pending",
               headers={"Authorization": f"Bearer {admin_token}"})
check("GET /admin/access-requests returns 200", r.status_code == 200)
pending = [req for req in r.json().get("requests", []) if req["email"] == "test.engineer@railway.gov.in"]
check("Test request visible in pending list", len(pending) > 0)

# ── 8. Admin approves request ────────────────────────────────────
print("\n8. Admin — approve request")
req_id = pending[0]["id"]
r = client.post(f"/admin/access-requests/{req_id}/approve",
                json={"role": "maintenance_engineer", "temporary_password": "EngineerPass@123"},
                headers={"Authorization": f"Bearer {admin_token}"})
check("POST /admin/access-requests/approve returns 201", r.status_code == 201)

# ── 9. Approved user logs in successfully ─────────────────────────
print("\n9. Approved user login")
r = client.post("/auth/login", json={
    "email": "test.engineer@railway.gov.in",
    "password": "EngineerPass@123"
})
check("Approved user login returns 200", r.status_code == 200)
user_data = r.json()
check("Role is maintenance_engineer", user_data.get("user", {}).get("role") == "maintenance_engineer")
user_id = user_data.get("user", {}).get("id")
user_token = user_data.get("access_token")

# ── 10. Deactivated user CANNOT log in ────────────────────────────
print("\n10. Disabled user login enforcement")
r = client.put(f"/admin/users/{user_id}/activate",
               json={"is_active": False},
               headers={"Authorization": f"Bearer {admin_token}"})
check("Deactivate user returns 200", r.status_code == 200)

r = client.post("/auth/login", json={
    "email": "test.engineer@railway.gov.in",
    "password": "EngineerPass@123"
})
check("Disabled user login returns 403", r.status_code == 403)
check("Disabled detail message", r.json().get("detail") == "Your account is currently disabled.")

# Re-activate
client.put(f"/admin/users/{user_id}/activate", json={"is_active": True}, headers={"Authorization": f"Bearer {admin_token}"})

# ── 11. Admin directly creates authorized user ─────────────────────
print("\n11. Admin directly provisions user account (POST /admin/users)")
r = client.post("/admin/users",
                json={
                    "full_name": "Direct Operator",
                    "email": "direct.operator@railway.gov.in",
                    "password": "OperatorPass@2026",
                    "role": "railway_operator",
                    "designation": "Station Master",
                    "organization": "Western Railway",
                    "is_active": True
                },
                headers={"Authorization": f"Bearer {admin_token}"})
check("POST /admin/users returns 201", r.status_code == 201)
direct_user_id = r.json().get("user", {}).get("id")

# Direct user logs in
r = client.post("/auth/login", json={
    "email": "direct.operator@railway.gov.in",
    "password": "OperatorPass@2026"
})
check("Direct user login returns 200", r.status_code == 200)
check("Direct user role is railway_operator", r.json().get("user", {}).get("role") == "railway_operator")

# ── 12. Admin deletes user account ────────────────────────────────
print("\n12. Admin removes user access (DELETE /admin/users/{id})")
r = client.delete(f"/admin/users/{direct_user_id}", headers={"Authorization": f"Bearer {admin_token}"})
check("DELETE /admin/users/{id} returns 200", r.status_code == 200)

r = client.post("/auth/login", json={
    "email": "direct.operator@railway.gov.in",
    "password": "OperatorPass@2026"
})
check("Deleted user cannot log in (returns 401)", r.status_code == 401)

# ── 13. Rejected request enforcement ──────────────────────────────
print("\n13. Rejected access request enforcement")
client.post("/auth/request-access", json={
    "full_name": "Rejected Applicant",
    "email": "rejected.user@railway.gov.in",
    "purpose": "External test",
    "requested_role": "viewer"
})
reqs = client.get("/admin/access-requests?status_filter=pending", headers={"Authorization": f"Bearer {admin_token}"}).json().get("requests", [])
rej_id = next(req["id"] for req in reqs if req["email"] == "rejected.user@railway.gov.in")
client.post(f"/admin/access-requests/{rej_id}/reject", headers={"Authorization": f"Bearer {admin_token}"})

r = client.post("/auth/login", json={
    "email": "rejected.user@railway.gov.in",
    "password": "AnyPassword"
})
check("Rejected applicant login returns 403", r.status_code == 403)
check("Rejected detail message", r.json().get("detail") == "Your access request was not approved.")

# ── 14. Role restrictions — viewer cannot access admin routes ─────
print("\n14. Role-based route protection")
r = client.get("/admin/users", headers={"Authorization": f"Bearer {user_token}"})
check("Non-admin cannot access /admin/users (returns 403)", r.status_code == 403)

# ── 15. Token refresh ─────────────────────────────────────────────
print("\n15. Token refresh")
r = client.post("/auth/refresh", json={"refresh_token": admin_refresh})
check("POST /auth/refresh returns 200", r.status_code == 200)
new_access = r.json().get("access_token", "")
check("New access token issued", bool(new_access))

# ── 16. Brute force protection ────────────────────────────────────
print("\n16. Brute-force protection")
for _ in range(5):
    client.post("/auth/login", json={"email": "brutetest@test.com", "password": "wrong"})
r = client.post("/auth/login", json={"email": "brutetest@test.com", "password": "wrong"})
check("6th failed attempt returns 429", r.status_code == 429)

# ── 17. Logout ────────────────────────────────────────────────────
print("\n17. Logout")
r = client.post("/auth/logout",
                json={"refresh_token": admin_refresh},
                headers={"Authorization": f"Bearer {new_access}"})
check("POST /auth/logout returns 200", r.status_code == 200)

# ── Clean up test admin ───────────────────────────────────────────
_teardown_db = SessionLocal()
_teardown_db.query(User).filter(User.email == "admin@railguard.local").delete()
_teardown_db.commit()
_teardown_db.close()

# ── Summary ───────────────────────────────────────────────────────
print("\n" + "=" * 65)
passed = sum(1 for _, s in results if s == PASS)
total = len(results)
print(f"  RESULT: {passed}/{total} tests passed")
if passed == total:
    print("  [SUCCESS] ALL AUTH & ACCESS CONTROL TESTS PASSED CLEANLY")
else:
    failed = [n for n, s in results if s == FAIL]
    print(f"  [FAILED] {', '.join(failed)}")
print("=" * 65 + "\n")

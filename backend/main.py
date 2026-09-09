"""
RailGuard AI Backend — Main Application Entry Point
"""
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import engine, Base, get_db
from database.mysql_database import analysis_engine, AnalysisBase, test_mysql_connection
from auth.models import User, AccessRequest, AuditLog     # Register auth tables
from database.analysis_models import AnalysisResult        # Register MySQL table
from services.seed_data import seed_database
from auth.security import hash_password

# Import routers
from routes import tracks, analysis, risk, simulation, optimization, alerts, recommendation
from routes.auth import router as auth_router
from routes.admin import router as admin_router

def _check_admin_status(db):
    """
    Check if an active Administrator exists in the database.
    Does NOT seed default passwords or hardcode credentials.
    If no admin exists, logs a security notice to run setup_admin.py.
    """
    admin = db.query(User).filter(User.role == "admin", User.is_active == True, User.is_approved == True).first()
    if not admin:
        print("[RailGuard SECURITY NOTICE] No active Administrator account found.")
        print("[RailGuard SECURITY NOTICE] Run 'python backend/setup_admin.py' to securely set up the first Admin.")
    else:
        print(f"[RailGuard] Administrator account verified: {admin.email}")


# ── Create all database tables ────────────────────────────────────────────────
# SQLite: tracks, inspections, risk_records, users, access_requests, audit_log
Base.metadata.create_all(bind=engine)

# MySQL (or SQLite fallback): analysis_results
try:
    AnalysisBase.metadata.create_all(bind=analysis_engine)
except Exception as _e:
    print(f"[RailGuard] Analysis DB table creation skipped: {_e}")
    print("[RailGuard] Analysis DB: Running without MySQL - set MYSQL_URL in .env to enable.")

# Check admin account status
try:
    _init_db = next(get_db())
    _check_admin_status(_init_db)
except Exception as _e:
    print(f"[RailGuard] Admin status check notice: {_e}")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="RailGuard",
    description="AI-Powered Railway Asset Risk & Maintenance Planning System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Add FRONTEND_URL and ALLOWED_ORIGINS from environment if present
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for o in allowed_origins_env.split(","):
        clean_o = o.strip()
        if clean_o and clean_o not in origins:
            origins.append(clean_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    db = next(get_db())

    # Seed Indian Railways track data
    seed_database(db)

    # Verify admin account status
    _check_admin_status(db)

    # Test MySQL connectivity
    mysql_status = test_mysql_connection()
    if mysql_status.get("is_mysql"):
        print("[RailGuard] MySQL connection successful")
        print("[RailGuard] Analysis DB: MySQL")
    else:
        print(f"[RailGuard] Analysis DB: {mysql_status['engine']} ({mysql_status.get('url', '')})")


# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(tracks.router)
app.include_router(analysis.router)
app.include_router(risk.router)
app.include_router(simulation.router)
app.include_router(optimization.router)
app.include_router(alerts.router)
app.include_router(recommendation.router)
app.include_router(auth_router)
app.include_router(admin_router)


# ── Root endpoint ─────────────────────────────────────────────────────────────
@app.get("/", summary="System Status")
def read_root():
    return {
        "system": "RailGuard",
        "description": "AI-Powered Railway Asset Risk & Maintenance Planning",
        "status": "Operational",
        "version": "2.0.0",
        "docs": "/docs",
        "sih_problem_statement": "SIH26027",
    }


@app.get("/health", summary="Health Check")
def health_check():
    return {"status": "healthy", "system": "RailGuard"}
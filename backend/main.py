from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, get_db
from services.seed_data import seed_database

# Import Modular Routers
from routes import tracks, analysis, risk, simulation, optimization, alerts, recommendation

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Initialize FastAPI Application
app = FastAPI(
    title="RailGuard AI Backend",
    description="AI-Powered Railway Risk Assessment & Maintenance Block Planning System (SIH 2026 - SIH26027)",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend (Member 5 Integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Seeds initial Indian Railways tracks, trains, and blocks into SQLite DB on startup."""
    db = next(get_db())
    seed_database(db)


# Register Modular API Routers
app.include_router(tracks.router)
app.include_router(analysis.router)
app.include_router(risk.router)
app.include_router(simulation.router)
app.include_router(optimization.router)
app.include_router(alerts.router)
app.include_router(recommendation.router)


@app.get("/", summary="Root Status Endpoint")
def read_root():
    return {
        "system": "RailGuard AI Engine Backend",
        "status": "Operational",
        "role": "Member 2 — Backend + AI Integration",
        "sih_problem_statement": "SIH26027 - Automatic Maintenance Block Planning",
        "docs": "/docs"
    }
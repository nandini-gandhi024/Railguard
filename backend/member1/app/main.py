from fastapi import FastAPI
from app.routers import tracks, defects, weather, maintenance, risk, priority, details, maintenance_blocks
from app.database import engine, Base

app = FastAPI()

app.include_router(tracks.router)
app.include_router(defects.router)
app.include_router(weather.router)
app.include_router(maintenance.router)
app.include_router(risk.router)
app.include_router(priority.router)
app.include_router(details.router)
app.include_router(maintenance_blocks.router)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "RailGuard Backend is Running!"}


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            return {"database": "Connected successfully!"}
    except Exception as e:
        return {"database": "Connection failed", "error": str(e)}
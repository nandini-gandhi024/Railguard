from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Weather

router = APIRouter(prefix="/weather", tags=["Weather"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class WeatherCreate(BaseModel):
    track_id: int
    location: str
    temperature: float
    humidity: float
    rainfall: float
    flood_risk: str
    weather_condition: str


@router.post("/")
def create_weather(
    weather: WeatherCreate,
    db: Session = Depends(get_db)
):
    new_weather = Weather(
        track_id=weather.track_id,
        location=weather.location,
        temperature=weather.temperature,
        humidity=weather.humidity,
        rainfall=weather.rainfall,
        flood_risk=weather.flood_risk,
        weather_condition=weather.weather_condition
    )

    db.add(new_weather)
    db.commit()
    db.refresh(new_weather)

    return new_weather


@router.get("/")
def get_weather(db: Session = Depends(get_db)):
    return db.query(Weather).all()


@router.get("/{track_id}")
def get_track_weather(
    track_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Weather).filter(
        Weather.track_id == track_id
    ).all()
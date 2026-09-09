from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Maintenance

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MaintenanceCreate(BaseModel):
    track_id: int
    maintenance_date: str
    maintenance_type: str
    maintenance_duration: float
    maintenance_status: str
    previous_repairs: str
    days_since_maintenance: int
    crew: str
    cost: float = 0
    notes: str = ""


@router.post("/")
def create_maintenance(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    new_maintenance = Maintenance(
        track_id=maintenance.track_id,
        maintenance_date=maintenance.maintenance_date,
        maintenance_type=maintenance.maintenance_type,
        maintenance_duration=maintenance.maintenance_duration,
        maintenance_status=maintenance.maintenance_status,
        previous_repairs=maintenance.previous_repairs,
        days_since_maintenance=maintenance.days_since_maintenance,
        crew=maintenance.crew,
        cost=maintenance.cost,
        notes=maintenance.notes
    )

    db.add(new_maintenance)
    db.commit()
    db.refresh(new_maintenance)

    return new_maintenance


@router.get("/")
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(Maintenance).all()


@router.get("/{track_id}")
def get_track_maintenance(
    track_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Maintenance).filter(
        Maintenance.track_id == track_id
    ).all()
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MaintenancePriority

router = APIRouter(
    prefix="/priority",
    tags=["Priority"]
)


@router.post("")
def create_priority(priority: dict, db: Session = Depends(get_db)):
    new_priority = MaintenancePriority(**priority)

    db.add(new_priority)
    db.commit()
    db.refresh(new_priority)

    return new_priority


@router.get("/{track_id}")
def get_priority(track_id: int, db: Session = Depends(get_db)):
    return db.query(MaintenancePriority).filter(
        MaintenancePriority.track_id == track_id
    ).all()
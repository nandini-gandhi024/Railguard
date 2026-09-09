from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RiskAssessment

router = APIRouter(
    prefix="/risk",
    tags=["Risk"]
)


@router.post("")
def create_risk(risk: dict, db: Session = Depends(get_db)):
    new_risk = RiskAssessment(**risk)

    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    return new_risk


@router.get("/{track_id}")
def get_risk(track_id: int, db: Session = Depends(get_db)):
    return db.query(RiskAssessment).filter(
        RiskAssessment.track_id == track_id
    ).all()
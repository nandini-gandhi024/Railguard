from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Defect

router = APIRouter(
    prefix="/defects",
    tags=["Defects"]
)


@router.get("")
def get_defects(db: Session = Depends(get_db)):
    return db.query(Defect).all()


@router.post("")
def create_defect(defect: dict, db: Session = Depends(get_db)):
    new_defect = Defect(**defect)

    db.add(new_defect)
    db.commit()
    db.refresh(new_defect)

    return new_defect
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import MaintenanceBlock

router = APIRouter(prefix="/maintenance-blocks", tags=["Maintenance Blocks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MaintenanceBlockCreate(BaseModel):
    block_id: str
    track_id: int
    corridor_section: str
    block_type: str
    required_duration: float
    available_start: str
    available_end: str
    crew: str


@router.post("/")
def create_maintenance_block(
    block: MaintenanceBlockCreate,
    db: Session = Depends(get_db)
):
    new_block = MaintenanceBlock(
        block_id=block.block_id,
        track_id=block.track_id,
        corridor_section=block.corridor_section,
        block_type=block.block_type,
        required_duration=block.required_duration,
        available_start=block.available_start,
        available_end=block.available_end,
        crew=block.crew
    )

    db.add(new_block)
    db.commit()
    db.refresh(new_block)

    return new_block


@router.get("/")
def get_maintenance_blocks(db: Session = Depends(get_db)):
    return db.query(MaintenanceBlock).all()


@router.get("/{track_id}")
def get_track_maintenance_blocks(
    track_id: int,
    db: Session = Depends(get_db)
):
    return db.query(MaintenanceBlock).filter(
        MaintenanceBlock.track_id == track_id
    ).all()
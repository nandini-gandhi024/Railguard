from app.database import engine, Base
from app.models import (
    Track,
    Defect,
    Weather,
    Maintenance,
    RiskAssessment,
    MaintenancePriority,
    MaintenanceBlock
)

print("Dropping existing tables...")
Base.metadata.drop_all(bind=engine)

print("Creating updated tables...")
Base.metadata.create_all(bind=engine)

print("Database reset successfully!")
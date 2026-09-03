import sys
from database.database import engine, Base, SessionLocal
from database.models import Track, Inspection, RiskRecord, TrainSchedule, MaintenanceBlock
from services.seed_data import seed_database

print("==================================================")
print("  RAILGUARD SYNTHETIC DATA SEEDING SCRIPT         ")
print("==================================================")

# Ensure database tables exist
print("\n1. Ensuring database tables exist in SQLite...")
Base.metadata.create_all(bind=engine)

# Open session and run idempotent seed function
db = SessionLocal()
print("\n2. Seeding 30 synthetic track records into database...")
seed_database(db)

# Verify count of records inserted
track_count = db.query(Track).count()
insp_count = db.query(Inspection).count()
risk_count = db.query(RiskRecord).count()
train_count = db.query(TrainSchedule).count()
block_count = db.query(MaintenanceBlock).count()

print(f"\n3. Database Verification Results:")
print(f"   • Total Track Sections: {track_count}")
print(f"   • Inspection Records:   {insp_count}")
print(f"   • Risk Assessment Logs: {risk_count}")
print(f"   • Train Schedules:      {train_count}")
print(f"   • Maintenance Blocks:   {block_count}")

db.close()

print("\n==================================================")
print("  [SUCCESS] SYNTHETIC DATASET SEEDED SUCCESSFULLY! ")
print("==================================================")

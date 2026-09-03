import sys
from database.database import engine, Base, SessionLocal
from database.models import Track, Inspection, RiskRecord, TrainSchedule, MaintenanceBlock

print("==================================================")
print("  STEP 2: DATABASE LAYER CREATION & TABLE TEST    ")
print("==================================================")

# Create all tables in SQLite database
print("\n1. Creating database tables in SQLite (railguard.db)...")
Base.metadata.create_all(bind=engine)
print("   [SUCCESS] Tables created successfully!")

# Test inserting a track record
db = SessionLocal()
print("\n2. Testing database session & Track insert...")

# Check if T041 already exists
existing = db.query(Track).filter(Track.track_id == "T041").first()
if not existing:
    test_track = Track(
        track_id="T041",
        location="KM 142.5 Delhi-Kanpur Mainline",
        section="NDLS-CNB Mainline",
        division="Delhi Division",
        zone="Northern Railway (NR)",
        track_age=14,
        steel_grade="IU-60 1080 HH",
        traffic_per_day=58,
        speed_limit=130,
        curve_radius=1200.0,
        previous_repairs=4,
        last_tamping_days=210,
        network_importance=9,
        status="Operational"
    )
    db.add(test_track)
    db.commit()
    db.refresh(test_track)
    print(f"   [SUCCESS] Inserted test track: {test_track.track_id} - {test_track.location}")
else:
    print(f"   [SUCCESS] Found existing track in DB: {existing.track_id} - {existing.location}")

# Query tracks count
count = db.query(Track).count()
print(f"\n3. Querying Track table count: {count} track(s) found.")

db.close()
print("\n==================================================")
print("  ALL DATABASE TESTS PASSED CLEANLY ")
print("==================================================")

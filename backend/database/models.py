from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from .database import Base


class Track(Base):
    """
    Represents a railway track section managed by Indian Railways divisions.
    Stores static geometry, age, steel grade, and traffic load (GMT/day).
    """
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(String(50), unique=True, index=True)  # e.g., "T041" or "TRK-NR-101"
    location = Column(String(255))                           # e.g., "KM 142.5 Delhi-Kanpur Line"
    section = Column(String(100))                            # e.g., "NDLS-CNB Mainline"
    division = Column(String(100))                           # e.g., "Delhi Division"
    zone = Column(String(100))                               # e.g., "Northern Railway (NR)"
    track_age = Column(Integer)                         # Age in years
    steel_grade = Column(String(100))                        # e.g., "IU-60 1080 Head Hardened"
    traffic_per_day = Column(Integer)                   # Traffic density in GMT/day
    speed_limit = Column(Integer)                       # Normal speed limit in km/h
    curve_radius = Column(Float)                        # Curve radius in meters
    previous_repairs = Column(Integer)                  # Count of prior repairs
    last_tamping_days = Column(Integer)                 # Days since last tamping
    network_importance = Column(Integer)                # Rating 1 (Branch line) to 10 (Golden Quadrilateral)
    status = Column(String(50), default="Operational")       # Operational, Speed Restricted, Block Required


class Inspection(Base):
    """
    Represents a visual track fault inspection record generated from AI computer vision analysis.
    """
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(String(50), unique=True, index=True)
    track_id = Column(String(50), index=True)
    image_url = Column(String(255))
    defect_type = Column(String(100))                       # e.g., "crack", "head_check", "broken_sleeper"
    confidence = Column(Float)                         # Detection confidence (0.0 to 1.0)
    severity = Column(Float)                           # Severity score (0 to 100)
    bounding_box = Column(Text)                        # JSON string: {"ymin": 35, "xmin": 40, ...}
    detected_at = Column(DateTime(timezone=True), server_default=func.now())


class RiskRecord(Base):
    """
    Represents multi-factor risk assessment history calculated by the Risk Engine.
    """
    __tablename__ = "risk_records"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(String(50), index=True)
    composite_risk = Column(Float)                     # Risk score (0 to 100)
    category = Column(String(50))                          # "Critical", "High Risk", "Moderate", "Low"
    priority = Column(Integer)                         # Priority rank (1 = Highest)
    tsr_speed = Column(Integer)                        # Recommended TSR speed limit in km/h
    days_to_critical = Column(Integer)                 # Days until critical threshold
    predicted_risk_7_days = Column(Float)              # Projected 7-day risk score
    predicted_risk_14_days = Column(Float)             # Projected 14-day risk score
    xai_breakdown = Column(Text)                       # JSON string of feature contribution %
    urgency_action = Column(String(255))                    # Recommended action text
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())


class TrainSchedule(Base):
    """
    Represents passenger and freight train timetables on the corridor section.
    """
    __tablename__ = "train_schedules"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(50), index=True)          # e.g., "22436"
    train_name = Column(String(100))                        # e.g., "Vande Bharat Express"
    train_type = Column(String(50))                        # "Premium Superfast", "Freight", "Local"
    corridor_section = Column(String(100))
    direction = Column(String(20))                        # "UP" or "DOWN"
    departure_time = Column(String(20))                   # "06:00"
    arrival_time = Column(String(20))                     # "08:15"
    priority_level = Column(Integer)                   # 1 (Highest) to 5 (Lowest)


class MaintenanceBlock(Base):
    """
    Represents maintenance block planning requests and SIH26027 optimized schedules.
    """
    __tablename__ = "maintenance_blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(String(50), unique=True, index=True)  # e.g., "BLK-001"
    track_id = Column(String(50), index=True)
    corridor_section = Column(String(100))
    block_type = Column(String(100))                        # e.g., "Rail Replacement", "CSM Tamping"
    required_duration_hours = Column(Float)            # e.g., 2.0
    recommended_start = Column(String(20))                 # e.g., "01:00"
    recommended_end = Column(String(20))                   # e.g., "03:00"
    status = Column(String(50), default="Proposed")        # Proposed, AI Optimized, Approved
    priority_score = Column(Float)                     # Priority score matching risk
    crew_assigned = Column(String(100))
    train_delay_penalty = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RiskAlert(Base):
    """
    Stores historical and active critical/high-risk alerts generated for tracks.
    """
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True)  # e.g., "ALT-T041-001"
    track_id = Column(String(50), index=True)
    alert_type = Column(String(50))                         # "CURRENT_CRITICAL", "PREDICTED_CRITICAL", "HIGH_RISK"
    severity = Column(String(50))                           # "CRITICAL", "HIGH", "MODERATE", "LOW"
    risk_score = Column(Float)
    predicted_risk = Column(Float)
    days_to_critical = Column(Integer)
    message = Column(String(255))
    recommended_action = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
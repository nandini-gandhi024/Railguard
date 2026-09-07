from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String)
    section = Column(String, nullable=False)
    division = Column(String)
    zone = Column(String)
    track_age = Column(Integer)
    steel_grade = Column(String)
    traffic_per_day = Column(Integer)
    speed_limit = Column(Float)
    curve_radius = Column(Float)
    previous_repairs = Column(String)
    last_tamping_days = Column(Integer)
    network_importance = Column(String)
    status = Column(String, default="Active")

    latitude = Column(Float)
    longitude = Column(Float)


class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    defect_type = Column(String, nullable=False)
    severity = Column(String)
    confidence = Column(Float)
    image_path = Column(String)


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    location = Column(String)
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    flood_risk = Column(String)
    weather_condition = Column(String)


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    maintenance_date = Column(String)
    maintenance_type = Column(String)
    maintenance_duration = Column(Float)
    maintenance_status = Column(String)
    previous_repairs = Column(String)
    days_since_maintenance = Column(Integer)
    crew = Column(String)

    # Keeping these because your old backend already used them
    cost = Column(Float)
    notes = Column(String)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    risk_score = Column(Float)
    risk_level = Column(String)
    failure_probability = Column(Float)
    risk_velocity = Column(Float)


class MaintenancePriority(Base):
    __tablename__ = "maintenance_priorities"

    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    priority = Column(Integer)
    reason = Column(String)


class MaintenanceBlock(Base):
    __tablename__ = "maintenance_blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(String, unique=True, nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    corridor_section = Column(String)
    block_type = Column(String)
    required_duration = Column(Float)
    available_start = Column(String)
    available_end = Column(String)
    crew = Column(String)
"""
RailGuard Analysis Results MySQL Model
Table: analysis_results in railguard_analysis database

Stores the complete result of every /analyze-image pipeline execution
for audit, reporting, and trend analysis.
"""
import uuid
from sqlalchemy import (
    Column, BigInteger, String, Float, Integer,
    DateTime, Text, JSON
)
from sqlalchemy.sql import func
# pyrefly: ignore [missing-import]
from database.mysql_database import AnalysisBase


class AnalysisResult(AnalysisBase):
    """
    Complete record of one /analyze-image pipeline execution.
    The complete_result JSON column stores the full API response
    so it can be reconstructed exactly for audit purposes.
    """
    __tablename__ = "analysis_results"

    # Primary key (Integer for SQLite autoincrement compatibility, BigInteger on MySQL)
    id = Column(Integer().with_variant(BigInteger, "mysql"), primary_key=True, autoincrement=True, index=True)

    # Unique run identifier
    analysis_id = Column(String(36), unique=True, index=True,
                         default=lambda: str(uuid.uuid4()))

    # Track reference
    track_id = Column(String(50), index=True, nullable=False)

    # Who ran it (email if authenticated, 'anonymous' otherwise)
    analyzed_by = Column(String(150), nullable=False, default="anonymous")

    # When (server-side timestamp)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # ── Fault Detection results ────────────────────────────────────────────────
    defect_type = Column(String(100))            # crack, head_check, broken_sleeper, …
    confidence = Column(Float)                   # 0.0 – 1.0
    severity = Column(Float)                     # 0 – 100
    bounding_box = Column(JSON)                  # {"ymin": 35, "xmin": 40, ...}

    # ── Risk Assessment results ────────────────────────────────────────────────
    risk_score = Column(Float)                   # 0 – 100
    risk_category = Column(String(50))           # Critical / High Risk / Moderate / Low
    priority = Column(Integer)                   # 1 = highest
    tsr_speed_kmh = Column(Integer)              # Imposed speed restriction (km/h)

    # ── Prediction ─────────────────────────────────────────────────────────────
    risk_7_days = Column(Float)
    risk_14_days = Column(Float)
    days_to_critical = Column(Integer)

    # ── Recommendation ─────────────────────────────────────────────────────────
    recommendation_action = Column(Text)
    urgency = Column(String(50))

    # ── Explainability ─────────────────────────────────────────────────────────
    xai_breakdown = Column(JSON)                 # {"Defect Severity": 42.5, ...}

    # ── Context ────────────────────────────────────────────────────────────────
    weather_context = Column(JSON)               # Weather + satellite context dict

    # ── Full response blob (for exact reconstruction) ─────────────────────────
    complete_result = Column(JSON, nullable=False)  # Entire /analyze-image response

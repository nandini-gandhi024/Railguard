from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ---------- 1. Track Schemas ----------

class TrackBase(BaseModel):
    track_id: str = Field(..., example="T041", description="Unique Track ID identifier")
    location: str = Field(..., example="KM 142.5 Delhi-Kanpur Line")
    section: str = Field("NDLS-CNB Mainline", example="NDLS-CNB Mainline")
    division: str = Field("Delhi Division", example="Delhi Division")
    zone: str = Field("Northern Railway (NR)", example="Northern Railway (NR)")
    track_age: int = Field(12, example=14, description="Age of track in years")
    steel_grade: str = Field("IU-60 1080 Head Hardened", example="IU-60 1080 Head Hardened")
    traffic_per_day: int = Field(45, example=58, description="Traffic density in GMT per day")
    speed_limit: int = Field(130, example=130, description="Normal track speed limit in km/h")
    curve_radius: float = Field(1000.0, example=1200.0, description="Curve radius in meters")
    previous_repairs: int = Field(2, example=4)
    last_tamping_days: int = Field(180, example=210)
    network_importance: int = Field(8, example=9)


class TrackCreate(TrackBase):
    pass


class TrackResponse(TrackBase):
    id: int
    status: str
    composite_risk: Optional[float] = 50.0
    risk_category: Optional[str] = "Moderate"
    tsr_speed: Optional[int] = 130

    class Config:
        from_attributes = True


# ---------- 2. Fault Detection Schema (Member 3 Interface) ----------

class BoundingBox(BaseModel):
    ymin: float = 30.0
    xmin: float = 35.0
    ymax: float = 65.0
    xmax: float = 65.0


class FaultDetectionResponse(BaseModel):
    defect_type: str = Field("crack", example="crack")
    confidence: float = Field(0.94, example=0.94)
    severity: float = Field(85.0, example=85.0)
    bounding_box: Optional[BoundingBox] = None
    description: Optional[str] = "Transverse fatigue crack detected in rail head."
    recommended_action: Optional[str] = "Immediate TSR 30 km/h & Emergency Rail Replacement."


# ---------- 3. Risk Engine Schema (Member 4 Interface) ----------

class RiskMetrics(BaseModel):
    score: float = Field(92.0, example=92.0)
    category: str = Field("Critical", example="Critical")
    priority: int = Field(1, example=1)
    tsr_speed_kmh: int = Field(30, example=30)


class PredictionMetrics(BaseModel):
    risk_7_days: float = Field(97.0, example=97.0)
    risk_14_days: float = Field(99.0, example=99.0)
    days_to_critical: int = Field(2, example=2)


class Recommendation(BaseModel):
    action: str = Field("Immediate inspection & TSR 30 km/h", example="Immediate inspection")
    urgency: str = Field("Critical", example="Critical")


# ---------- 4. Master POST /analyze-image Schema ----------

class AnalyzeImageResponse(BaseModel):
    track_id: str = Field(..., example="T041")
    fault: FaultDetectionResponse
    risk: RiskMetrics
    prediction: PredictionMetrics
    recommendation: Recommendation
    xai_breakdown: Optional[Dict[str, float]] = None


# ---------- 5. What-If Simulation Schemas ----------

class SimulationRequest(BaseModel):
    track_id: str = Field(..., example="T041")
    delay_days: int = Field(7, example=7, description="Number of days maintenance is delayed")
    temperature_c: Optional[float] = Field(38.0, example=42.0)
    monsoon_alert: Optional[bool] = Field(False, example=True)
    traffic_increase_pct: Optional[float] = Field(0.0, example=25.0)


class SimulationResponse(BaseModel):
    track_id: str
    current_risk: float = Field(..., example=92.0)
    predicted_risk: float = Field(..., example=97.0)
    risk_change: float = Field(..., example=5.0)
    category: str = Field(..., example="Critical")
    tsr_speed: int = Field(..., example=30)
    days_to_critical: int = Field(..., example=2)


# ---------- 6. SIH26027 Maintenance Block Optimization Schemas ----------

class OptimizationRequest(BaseModel):
    corridor_section: str = Field("NDLS-CNB Mainline Corridor", example="NDLS-CNB Mainline Corridor")


class MaintenanceBlockSchedule(BaseModel):
    block_id: str
    track_id: str
    location: str
    block_type: str
    required_duration_hours: float
    scheduled_start: str
    scheduled_end: str
    window_type: str
    status: str
    priority_score: float
    train_delay_penalty: float
    crew_assigned: str


class OptimizationMetrics(BaseModel):
    unoptimized_asset_availability_pct: float
    optimized_asset_availability_pct: float
    asset_availability_gain_pct: float
    total_blocks_scheduled: int
    total_downtime_hours: float


class OptimizationResponse(BaseModel):
    corridor_section: str
    optimized_blocks: List[MaintenanceBlockSchedule]
    metrics: OptimizationMetrics
    reasoning: str = "Scheduled in 01:00-03:00 window due to lowest train traffic and zero passenger disruption."


# ---------- 7. Critical Risk Alerts Schemas (Feature 1) ----------

class AlertResponse(BaseModel):
    alert_id: str = Field(..., example="ALT-T041-001")
    track_id: str = Field(..., example="T041")
    alert_type: str = Field(..., example="CURRENT_CRITICAL")
    severity: str = Field(..., example="CRITICAL")
    risk_score: float = Field(..., example=74.4)
    predicted_risk: float = Field(..., example=79.4)
    days_to_critical: int = Field(..., example=4)
    message: str = Field(..., example="CRITICAL ALERT: Track T041 has reached critical risk.")
    recommended_action: str = Field(..., example="Immediate inspection & TSR 30 km/h.")
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    total_alerts: int
    critical_count: int
    high_count: int
    alerts: List[AlertResponse]


# ---------- 8. Alternative Route Recommendation Schemas (Feature 2) ----------

class RouteRecommendationRequest(BaseModel):
    track_id: str = Field(..., example="T041", description="Target track ID requiring alternative routing decision support")


class RouteRecommendationResponse(BaseModel):
    affected_track: str = Field(..., example="T041")
    affected_track_risk: float = Field(..., example=74.4)
    condition: str = Field(..., example="High Risk")
    recommended_route: Optional[str] = Field(..., example="TRK-NR-102")
    alternative_route_score: Optional[float] = Field(..., example=88.0)
    availability: Optional[str] = Field(..., example="Operational")
    estimated_delay_minutes: Optional[int] = Field(..., example=12)
    reason: List[str] = Field(...)
    warning: str = Field(
        "Decision support recommendation only. Final routing authority rests with Indian Railways Traffic Controller.",
        example="Decision support recommendation only. Final routing authority rests with Indian Railways Traffic Controller."
    )

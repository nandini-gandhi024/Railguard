"""
RailGuard Analysis Pipeline Route
POST /analyze-image

Pipeline:
1. Fault Detection (AI CV)
2. Track Data lookup (SQLite DB)
3. Weather/Context enrichment
4. Risk Prediction AI
5. Save to SQLite (Inspection + RiskRecord)
6. Save complete result to MySQL (AnalysisResult)
7. Return standardised JSON response
"""
import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Request, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.mysql_database import get_analysis_db
from database.models import Track, Inspection, RiskRecord
from database.analysis_models import AnalysisResult
from models.schemas import AnalyzeImageResponse
from services.fault_detection import detect_fault
from services.risk_engine import calculate_risk
from services.weather import get_weather_context
# pyrefly: ignore [missing-import]
from auth.deps import get_current_user_optional
# pyrefly: ignore [missing-import]
from auth.models import User, AuditLog

router = APIRouter(tags=["Analysis"])


def _audit(db: Session, user_email: Optional[str], action: str,
           target: Optional[str] = None, detail: Optional[dict] = None):
    db.add(AuditLog(
        user_email=user_email,
        action=action,
        target=target,
        detail=json.dumps(detail) if detail else None,
    ))
    db.commit()


@router.post("/analyze-image", response_model=AnalyzeImageResponse, summary="Analyze Track Image & Compute Risk")
async def analyze_image_pipeline(
    track_id: str = Form("T041", description="Track ID e.g. T041"),
    preset_key: Optional[str] = Form(None, description="Optional defect preset key"),
    file: Optional[UploadFile] = File(None, description="Inspection photo file upload"),
    db: Session = Depends(get_db),
    analysis_db: Session = Depends(get_analysis_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Main RailGuard Pipeline:
    1. Fault Detection AI
    2. Track data from database
    3. Weather/satellite context
    4. Risk Prediction AI
    5. Save Inspection + Risk records to SQLite
    6. Save complete result to MySQL analysis database
    7. Return JSON response
    """
    user_email = current_user.email if current_user else "anonymous"

    # Read image bytes if provided
    image_bytes = None
    if file:
        image_bytes = await file.read()

    # Step 1: Fault Detection AI
    fault_res = detect_fault(image_bytes)

    # Step 2: Track Data from SQLite DB
    track = db.query(Track).filter(Track.track_id == track_id).first()
    if not track:
        track = Track(
            track_id=track_id,
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
            status="Speed Restricted"
        )
        db.add(track)
        db.commit()
        db.refresh(track)

    track_dict = {
        "track_id": track.track_id,
        "track_age": track.track_age,
        "traffic_per_day": track.traffic_per_day,
        "speed_limit": track.speed_limit,
        "curve_radius": track.curve_radius,
        "previous_repairs": track.previous_repairs,
        "last_tamping_days": track.last_tamping_days
    }

    # Step 3: Weather/Satellite Context
    weather_res = get_weather_context(track.location)

    # Step 4: Risk Prediction AI
    risk_res = calculate_risk(
        track_data=track_dict,
        fault_data=fault_res,
        weather_data=weather_res,
        delay_days=0
    )

    # Step 5: Save to SQLite (Inspection + RiskRecord)
    unique_insp_id = f"INSP-{track_id}-{uuid.uuid4().hex[:6].upper()}"

    inspection_rec = Inspection(
        inspection_id=unique_insp_id,
        track_id=track_id,
        image_url=file.filename if file else "/presets/crack.jpg",
        defect_type=fault_res["defect_type"],
        confidence=fault_res["confidence"],
        severity=fault_res["severity"],
        bounding_box=json.dumps(fault_res.get("bounding_box", {}))
    )
    db.add(inspection_rec)

    risk_rec = RiskRecord(
        track_id=track_id,
        composite_risk=risk_res["risk_score"],
        category=risk_res["risk_category"],
        priority=risk_res["priority"],
        tsr_speed=risk_res["tsr_speed_kmh"],
        days_to_critical=risk_res["days_to_critical"],
        predicted_risk_7_days=risk_res["predicted_risk_7_days"],
        predicted_risk_14_days=risk_res["predicted_risk_14_days"],
        xai_breakdown=json.dumps(risk_res["xai_breakdown"]),
        urgency_action=risk_res["urgency_action"]
    )
    db.add(risk_rec)
    db.commit()

    # Build the complete result payload (matches API response schema)
    complete_result = {
        "track_id": track_id,
        "fault": {
            "defect_type": fault_res["defect_type"],
            "confidence": fault_res["confidence"],
            "severity": fault_res["severity"],
            "bounding_box": fault_res.get("bounding_box"),
            "description": fault_res.get("description"),
            "recommended_action": fault_res.get("recommended_action"),
        },
        "risk": {
            "score": risk_res["risk_score"],
            "category": risk_res["risk_category"],
            "priority": risk_res["priority"],
            "tsr_speed_kmh": risk_res["tsr_speed_kmh"],
        },
        "prediction": {
            "risk_7_days": risk_res["predicted_risk_7_days"],
            "risk_14_days": risk_res["predicted_risk_14_days"],
            "days_to_critical": risk_res["days_to_critical"],
        },
        "recommendation": {
            "action": risk_res["urgency_action"],
            "urgency": risk_res["risk_category"],
        },
        "xai_breakdown": risk_res["xai_breakdown"],
        "weather_context": weather_res,
    }

    # Step 6: Save to MySQL analysis database
    try:
        analysis_record = AnalysisResult(
            analysis_id=str(uuid.uuid4()),
            track_id=track_id,
            analyzed_by=user_email,
            defect_type=fault_res["defect_type"],
            confidence=fault_res["confidence"],
            severity=fault_res["severity"],
            bounding_box=fault_res.get("bounding_box"),
            risk_score=risk_res["risk_score"],
            risk_category=risk_res["risk_category"],
            priority=risk_res["priority"],
            tsr_speed_kmh=risk_res["tsr_speed_kmh"],
            risk_7_days=risk_res["predicted_risk_7_days"],
            risk_14_days=risk_res["predicted_risk_14_days"],
            days_to_critical=risk_res["days_to_critical"],
            recommendation_action=risk_res["urgency_action"],
            urgency=risk_res["risk_category"],
            xai_breakdown=risk_res["xai_breakdown"],
            weather_context=weather_res,
            complete_result=complete_result,
        )
        analysis_db.add(analysis_record)
        analysis_db.commit()
    except Exception as e:
        # Analysis DB failure should not break the main API response
        analysis_db.rollback()
        print(f"[WARNING] Failed to save analysis to MySQL: {e}")

    # Write audit entry to SQLite
    _audit(db, user_email, "RUN_ANALYSIS", target=track_id,
           detail={"defect": fault_res["defect_type"], "risk": risk_res["risk_score"]})

    # Step 7: Return response
    return {
        "track_id": track_id,
        "fault": {
            "defect_type": fault_res["defect_type"],
            "confidence": fault_res["confidence"],
            "severity": fault_res["severity"],
            "bounding_box": fault_res.get("bounding_box"),
            "description": fault_res.get("description"),
            "recommended_action": fault_res.get("recommended_action"),
        },
        "risk": {
            "score": risk_res["risk_score"],
            "category": risk_res["risk_category"],
            "priority": risk_res["priority"],
            "tsr_speed_kmh": risk_res["tsr_speed_kmh"],
        },
        "prediction": {
            "risk_7_days": risk_res["predicted_risk_7_days"],
            "risk_14_days": risk_res["predicted_risk_14_days"],
            "days_to_critical": risk_res["days_to_critical"],
        },
        "recommendation": {
            "action": risk_res["urgency_action"],
            "urgency": risk_res["risk_category"],
        },
        "xai_breakdown": risk_res["xai_breakdown"],
    }


@router.get("/analysis-history", summary="Recent analysis results from MySQL")
def get_analysis_history(
    track_id: Optional[str] = None,
    limit: int = 50,
    analysis_db: Session = Depends(get_analysis_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Return recent analysis results from the MySQL database."""
    query = analysis_db.query(AnalysisResult).order_by(AnalysisResult.analyzed_at.desc())
    if track_id:
        query = query.filter(AnalysisResult.track_id == track_id)
    results = query.limit(limit).all()

    return {
        "total": len(results),
        "results": [
            {
                "analysis_id": r.analysis_id,
                "track_id": r.track_id,
                "analyzed_by": r.analyzed_by,
                "analyzed_at": r.analyzed_at.isoformat() if r.analyzed_at else None,
                "defect_type": r.defect_type,
                "confidence": r.confidence,
                "severity": r.severity,
                "risk_score": r.risk_score,
                "risk_category": r.risk_category,
                "tsr_speed_kmh": r.tsr_speed_kmh,
                "days_to_critical": r.days_to_critical,
            }
            for r in results
        ],
    }

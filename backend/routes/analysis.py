import json
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Track, Inspection, RiskRecord
from models.schemas import AnalyzeImageResponse
from services.fault_detection import detect_fault
from services.risk_engine import calculate_risk
from services.weather import get_weather_context

router = APIRouter(tags=["Analysis"])


@router.post("/analyze-image", response_model=AnalyzeImageResponse, summary="Analyze Track Image & Compute Risk")
async def analyze_image_pipeline(
    track_id: str = Form("T041", description="Track ID e.g. T041"),
    preset_key: Optional[str] = Form(None, description="Optional defect preset key"),
    file: Optional[UploadFile] = File(None, description="Inspection photo file upload"),
    db: Session = Depends(get_db)
):
    """
    Main RailGuard Pipeline Endpoint:
    1. Receives track ID + track photo
    2. Runs Fault Detection AI (Member 3 Mock/Real CV)
    3. Retrieves Track static & traffic data from DB (Member 1 Database)
    4. Retrieves Weather & Satellite context (Member 6 Service)
    5. Calls Risk Prediction AI Engine (Member 4 Risk Model)
    6. Computes 7-day & 14-day future risk projections
    7. Saves Inspection & Risk records to Database
    8. Returns exact JSON response matching team contracts
    """
    # Read image bytes if provided
    image_bytes = None
    if file:
        image_bytes = await file.read()

    # Step 1: Run Fault Detection AI (Member 3 Mock/Real CV)
    fault_res = detect_fault(image_bytes)

    # Step 2: Retrieve Track Data from DB (Member 1 DB)
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

    # Step 3: Get Weather Context (Member 6 Service)
    weather_res = get_weather_context(track.location)

    # Step 4: Calculate Risk & Future Predictions (Member 4 Risk AI)
    risk_res = calculate_risk(
        track_data=track_dict,
        fault_data=fault_res,
        weather_data=weather_res,
        delay_days=0
    )

    # Step 5: Save Unique Inspection & Risk Record to Database
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

    # Step 6: Return Exact JSON Schema Payload
    return {
        "track_id": track_id,
        "fault": {
            "defect_type": fault_res["defect_type"],
            "confidence": fault_res["confidence"],
            "severity": fault_res["severity"],
            "bounding_box": fault_res.get("bounding_box"),
            "description": fault_res.get("description"),
            "recommended_action": fault_res.get("recommended_action")
        },
        "risk": {
            "score": risk_res["risk_score"],
            "category": risk_res["risk_category"],
            "priority": risk_res["priority"],
            "tsr_speed_kmh": risk_res["tsr_speed_kmh"]
        },
        "prediction": {
            "risk_7_days": risk_res["predicted_risk_7_days"],
            "risk_14_days": risk_res["predicted_risk_14_days"],
            "days_to_critical": risk_res["days_to_critical"]
        },
        "recommendation": {
            "action": risk_res["urgency_action"],
            "urgency": risk_res["risk_category"]
        },
        "xai_breakdown": risk_res["xai_breakdown"]
    }

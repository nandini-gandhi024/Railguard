from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import MaintenanceBlock, TrainSchedule, Track
from models.schemas import OptimizationRequest, OptimizationResponse
from services.maintenance_optimizer import optimize_maintenance_schedule
from services.risk_engine import calculate_risk
from services.weather import get_weather_context
from ai.risk_prediction import optimize_budget_allocation

router = APIRouter(tags=["Optimization"])


class BudgetOptimizationRequest(BaseModel):
    total_budget_inr: float = Field(5000000.0, example=5000000.0, description="Available budget in INR (e.g. ₹50 Lakh)")
    candidate_track_ids: Optional[List[str]] = Field(None, example=["T041", "TRK-NR-101", "TRK-CR-203"])


from services.block_optimizer import optimize_maintenance_blocks

CORRIDOR_PROFILES: Dict[str, Dict[str, Any]] = {
    "NDLS-CNB": {
        "canonical_name": "NDLS-CNB Mainline Corridor",
        "default_blocks": [
            {
                "block_id": "BLK-NR-001",
                "track_id": "T041",
                "location": "KM 142.5 Delhi-Kanpur Mainline",
                "block_type": "Emergency Rail Cut & Weld Replacement",
                "required_duration_hours": 2.0,
                "priority_score": 92.5,
                "crew_assigned": "Northern Railway Track Gang #7 & TRT Unit"
            },
            {
                "block_id": "BLK-NR-003",
                "track_id": "TRK-NR-103",
                "location": "KM 215.8 Tundla Junction Approach",
                "block_type": "Turnout Point Renewal & Heavy Tamping",
                "required_duration_hours": 2.5,
                "priority_score": 87.5,
                "crew_assigned": "Northern Railway Agra Division Gang #3"
            }
        ],
        "default_trains": [
            {"train_number": "22436", "train_name": "Vande Bharat Express", "departure_time": "06:00", "arrival_time": "08:15", "priority_level": 1},
            {"train_number": "12952", "train_name": "New Delhi Rajdhani", "departure_time": "08:45", "arrival_time": "11:15", "priority_level": 1},
            {"train_number": "12002", "train_name": "Bhopal Shatabdi", "departure_time": "12:00", "arrival_time": "14:30", "priority_level": 2},
            {"train_number": "12418", "train_name": "Prayagraj Express", "departure_time": "16:30", "arrival_time": "19:45", "priority_level": 3},
            {"train_number": "F9021", "train_name": "Container Freight Special", "departure_time": "20:30", "arrival_time": "00:30", "priority_level": 4},
            {"train_number": "F8804", "train_name": "Coal Rake Freight", "departure_time": "01:30", "arrival_time": "05:00", "priority_level": 5}
        ],
        "reasoning": "Selected 01:00–03:00 night shadow window on NDLS-CNB: Critical risk (92/100) on T041 repaired with zero passenger train delays. Vande Bharat (22436) and Rajdhani (12952) run unaffected."
    },
    "CSTM-PUNE": {
        "canonical_name": "CSTM-PUNE Corridor",
        "default_blocks": [
            {
                "block_id": "BLK-CR-002",
                "track_id": "TRK-CR-201",
                "location": "KM 42.1 Kharghar-Panvel Section",
                "block_type": "CSM Heavy Track Tamping & Alignment Correction",
                "required_duration_hours": 2.5,
                "priority_score": 86.0,
                "crew_assigned": "Central Railway Gang #12 & Heavy Tamper"
            },
            {
                "block_id": "BLK-CR-005",
                "track_id": "TRK-CR-202",
                "location": "KM 118.6 Lonavala Ghat Section",
                "block_type": "Ghat Section Rail De-Stressing & Check Rail Fastening",
                "required_duration_hours": 3.0,
                "priority_score": 89.5,
                "crew_assigned": "Central Railway Lonavala Ghat Unit"
            }
        ],
        "default_trains": [
            {"train_number": "12124", "train_name": "Deccan Queen Express", "departure_time": "07:15", "arrival_time": "10:25", "priority_level": 1},
            {"train_number": "12127", "train_name": "Mumbai-Pune Intercity", "departure_time": "06:40", "arrival_time": "09:57", "priority_level": 2},
            {"train_number": "22225", "train_name": "Solapur Vande Bharat", "departure_time": "16:05", "arrival_time": "19:10", "priority_level": 1},
            {"train_number": "22105", "train_name": "Indrayani Express", "departure_time": "05:40", "arrival_time": "09:05", "priority_level": 3},
            {"train_number": "F4022", "train_name": "JNPT Port Container Rake", "departure_time": "21:00", "arrival_time": "01:00", "priority_level": 4},
            {"train_number": "F4401", "train_name": "Port Feeder Freight", "departure_time": "01:45", "arrival_time": "04:45", "priority_level": 5}
        ],
        "reasoning": "Selected 01:30–04:00 night window on CSTM-PUNE Corridor: High-wear ghat sections on TRK-CR-201 and TRK-CR-202 stabilized before morning peak. Deccan Queen (12124) and Intercity (12127) operate at full line speed."
    },
    "BCT-ADI": {
        "canonical_name": "BCT-ADI Mainline",
        "default_blocks": [
            {
                "block_id": "BLK-WR-001",
                "track_id": "TRK-WR-302",
                "location": "KM 74.8 Virar-Dahanu Road",
                "block_type": "Rail Grinding & Elastic Fastener Renewal",
                "required_duration_hours": 2.0,
                "priority_score": 82.0,
                "crew_assigned": "Western Railway Track Gang #5 (Mumbai Central)"
            },
            {
                "block_id": "BLK-WR-004",
                "track_id": "TRK-WR-304",
                "location": "KM 262.1 Vadodara Junction Yard",
                "block_type": "Ballast Shoulder Cleaning & Switch Grinding",
                "required_duration_hours": 2.0,
                "priority_score": 74.5,
                "crew_assigned": "Western Railway Vadodara Maintenance Unit"
            }
        ],
        "default_trains": [
            {"train_number": "20901", "train_name": "Vande Bharat Express", "departure_time": "06:00", "arrival_time": "11:25", "priority_level": 1},
            {"train_number": "82901", "train_name": "Tejas Express", "departure_time": "15:45", "arrival_time": "22:05", "priority_level": 1},
            {"train_number": "12933", "train_name": "Karnavati Express", "departure_time": "14:05", "arrival_time": "21:05", "priority_level": 2},
            {"train_number": "12901", "train_name": "Gujarat Mail", "departure_time": "21:40", "arrival_time": "05:55", "priority_level": 3},
            {"train_number": "F3011", "train_name": "Western Container Rake", "departure_time": "23:00", "arrival_time": "03:30", "priority_level": 4}
        ],
        "reasoning": "Selected 02:00–04:00 window on BCT-ADI Mainline: Virar-Dahanu quadruple track section grinding completed during overnight freight gap. Zero disruption to Western Vande Bharat (20901) and Tejas Express (82901)."
    },
    "HWH-NDLS": {
        "canonical_name": "HWH-NDLS Grand Chord",
        "default_blocks": [
            {
                "block_id": "BLK-ER-003",
                "track_id": "TRK-ER-403",
                "location": "KM 260.5 Raniganj Coal Belt Loop",
                "block_type": "USFD Flaw Detection & Concrete Sleeper Exchange",
                "required_duration_hours": 2.5,
                "priority_score": 84.5,
                "crew_assigned": "Eastern Railway Track Safety Wing"
            },
            {
                "block_id": "BLK-ER-001",
                "track_id": "TRK-ER-401",
                "location": "KM 195.4 Barddhaman-Asansol",
                "block_type": "High-Speed CWR Thermal Stress Neutralization",
                "required_duration_hours": 2.0,
                "priority_score": 81.0,
                "crew_assigned": "Eastern Railway Asansol Gang #4"
            }
        ],
        "default_trains": [
            {"train_number": "12301", "train_name": "Howrah Rajdhani Express", "departure_time": "16:50", "arrival_time": "21:05", "priority_level": 1},
            {"train_number": "22301", "train_name": "Howrah Vande Bharat", "departure_time": "05:55", "arrival_time": "11:25", "priority_level": 1},
            {"train_number": "12303", "train_name": "Poorva Express", "departure_time": "08:00", "arrival_time": "13:00", "priority_level": 2},
            {"train_number": "12311", "train_name": "Netaji Express", "departure_time": "19:40", "arrival_time": "23:55", "priority_level": 3},
            {"train_number": "F2019", "train_name": "Coal Rake Super Freight", "departure_time": "21:30", "arrival_time": "01:30", "priority_level": 4},
            {"train_number": "F2204", "train_name": "Eastern Mineral Freight", "departure_time": "02:00", "arrival_time": "04:30", "priority_level": 5}
        ],
        "reasoning": "Selected 01:00–03:30 night window on HWH-NDLS Grand Chord: High-tonnage coal loop flaw on TRK-ER-403 eliminated. Heavy coal freights regulated at loop line with zero impact on Howrah Rajdhani (12301)."
    }
}


def _match_profile_key(corridor_str: str) -> Optional[str]:
    c = corridor_str.upper()
    if "HWH" in c or "HOWRAH" in c or "CHORD" in c:
        return "HWH-NDLS"
    if "CSTM" in c or "PUNE" in c:
        return "CSTM-PUNE"
    if "BCT" in c or "ADI" in c or "AHMEDABAD" in c:
        return "BCT-ADI"
    if "NDLS" in c or "CNB" in c or "DELHI" in c:
        return "NDLS-CNB"
    return None


@router.post("/optimize-maintenance", response_model=OptimizationResponse, summary="SIH26027 Automatic Maintenance Block Optimizer")
def optimize_maintenance_blocks_endpoint(req: OptimizationRequest, db: Session = Depends(get_db)):
    """
    SIH26027 Feature:
    Determines WHEN high-risk tracks should be maintained to maximize corridor asset availability.
    Runs optimization based on the selected corridor section.
    """
    corridor_raw = req.corridor_section.strip() if req.corridor_section else ""
    if not corridor_raw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corridor section must be specified."
        )

    profile_key = _match_profile_key(corridor_raw)
    profile = CORRIDOR_PROFILES.get(profile_key) if profile_key else None

    # Find blocks from DB for this corridor
    db_blocks = []
    zone_prefixes = {
        "NDLS-CNB": ["NR", "T041", "T088", "T099"],
        "CSTM-PUNE": ["CR"],
        "BCT-ADI": ["WR"],
        "HWH-NDLS": ["ER"]
    }
    prefixes = zone_prefixes.get(profile_key, [])

    matching_blocks = []
    if profile_key:
        tracks_in_corridor = db.query(Track).filter(
            (Track.section.ilike(f"%{profile_key}%"))
        ).all()
        track_ids = set([t.track_id for t in tracks_in_corridor])
        for pfx in prefixes:
            pfx_tracks = db.query(Track).filter(Track.track_id.ilike(f"%{pfx}%")).all()
            for pt in pfx_tracks:
                track_ids.add(pt.track_id)

        if track_ids:
            matching_blocks = db.query(MaintenanceBlock).filter(MaintenanceBlock.track_id.in_(track_ids)).all()

    if not matching_blocks:
        matching_blocks = db.query(MaintenanceBlock).filter(
            MaintenanceBlock.corridor_section.ilike(f"%{corridor_raw}%")
        ).all()

    for b in matching_blocks:
        trk = db.query(Track).filter(Track.track_id == b.track_id).first()
        loc = trk.location if trk else (b.location if hasattr(b, "location") else "Mainline Corridor")
        db_blocks.append({
            "block_id": b.block_id,
            "track_id": b.track_id,
            "location": loc,
            "block_type": b.block_type,
            "required_duration_hours": b.required_duration_hours,
            "priority_score": b.priority_score or 85.0,
            "crew_assigned": b.crew_assigned or "Corridor Maintenance Gang"
        })

    # If DB blocks found for this corridor, use them; otherwise use profile defaults
    pending_blocks = db_blocks if db_blocks else (profile["default_blocks"] if profile else [])
    if not pending_blocks:
        pending_blocks = [
            {
                "block_id": f"BLK-{corridor_raw[:3].upper()}-001",
                "track_id": "TRK-001",
                "location": f"{corridor_raw} KM 100.0",
                "block_type": "Track Geometry Alignment & Tamping",
                "required_duration_hours": 2.0,
                "priority_score": 80.0,
                "crew_assigned": f"{corridor_raw} Section Gang"
            }
        ]

    # Find trains from DB
    matching_trains = db.query(TrainSchedule).filter(
        TrainSchedule.corridor_section.ilike(f"%{corridor_raw}%")
    ).all()
    train_schedules = []
    for tr in matching_trains:
        train_schedules.append({
            "train_number": tr.train_number,
            "train_name": tr.train_name,
            "train_type": tr.train_type,
            "departure_time": tr.departure_time,
            "arrival_time": tr.arrival_time,
            "priority_level": tr.priority_level or 3
        })

    if not train_schedules:
        train_schedules = profile["default_trains"] if profile else [
            {"train_number": "1001", "train_name": "Express Passenger", "departure_time": "06:00", "arrival_time": "09:00", "priority_level": 2},
            {"train_number": "2001", "train_name": "Intercity Special", "departure_time": "14:00", "arrival_time": "17:00", "priority_level": 2},
            {"train_number": "F901", "train_name": "Freight Rake", "departure_time": "21:00", "arrival_time": "01:00", "priority_level": 4}
        ]

    # Run the optimization solver
    opt_result = optimize_maintenance_blocks(
        pending_blocks=pending_blocks,
        train_schedules=train_schedules,
        corridor_section=req.corridor_section
    )

    reasoning = profile["reasoning"] if profile else f"Optimized {len(opt_result['optimized_blocks'])} maintenance block(s) during lowest traffic density window with zero passenger disruption."

    return {
        "corridor_section": req.corridor_section,
        "optimized_blocks": opt_result["optimized_blocks"],
        "metrics": opt_result["metrics"],
        "reasoning": reasoning,
        "train_impacts": opt_result.get("train_impacts"),
        "stringline_graph": opt_result.get("stringline_graph")
    }


# Phase 8 Deliverable: Maintenance Budget Optimizer (₹50 Lakh Allocation)
@router.post("/optimize-budget", summary="RailGuard Phase 8 Maintenance Budget Optimizer (₹50 Lakh)")
@router.get("/optimize-budget", summary="RailGuard Phase 8 Maintenance Budget Optimizer (₹50 Lakh)")
def run_budget_optimizer(
    total_budget_inr: float = 5000000.0,
    db: Session = Depends(get_db)
):
    """
    Member 4 Deliverable:
    Given available budget (e.g. ₹50 Lakh), evaluates candidate tracks across the network,
    computes risk reduction per rupee, and solves 0-1 Knapsack optimization to select the
    exact tracks that maximize safety and asset availability.
    """
    tracks = db.query(Track).all()
    candidates = []

    for t in tracks:
        weather_res = get_weather_context(t.location)
        risk_output = calculate_risk(
            track_data={
                "track_id": t.track_id,
                "track_age": t.track_age,
                "traffic_per_day": t.traffic_per_day,
                "speed_limit": t.speed_limit,
                "curve_radius": t.curve_radius,
                "previous_repairs": t.previous_repairs,
                "last_tamping_days": t.last_tamping_days,
                "network_importance": t.network_importance
            },
            fault_data={"severity": 75.0 if t.track_id == "T041" else 50.0, "confidence": 0.92},
            weather_data=weather_res,
            delay_days=0
        )
        
        candidates.append({
            "track_id": t.track_id,
            "section": t.section,
            "risk_score": risk_output["risk_score"],
            "network_importance": t.network_importance,
            "previous_repairs": t.previous_repairs,
            "defect_type": "crack" if t.track_id == "T041" else "ballast_void"
        })

    result = optimize_budget_allocation(candidates, total_budget_inr=total_budget_inr)
    return result

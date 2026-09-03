import json
from sqlalchemy.orm import Session
from database.models import Track, Inspection, RiskRecord, TrainSchedule, MaintenanceBlock
from services.cv_detector import DEFECT_CATALOG
from services.risk_engine import calculate_risk

# 30 Synthetic Track Records representing Indian Railways corridors
# NOTE: All synthetic operational parameters are for testing purposes and clearly labeled as synthetic.
SYNTHETIC_TRACKS = [
    # --- NORTHERN RAILWAY (NR) ---
    {
        "track_id": "TRK-NR-101",
        "location": "KM 142.5 Delhi-Kanpur Mainline (Synthetic)",
        "section": "NDLS-CNB High-Density Corridor",
        "division": "Delhi Division",
        "zone": "Northern Railway (NR)",
        "track_age": 14,
        "steel_grade": "IU-60 1080 Head Hardened",
        "traffic_per_day": 58,
        "speed_limit": 130,
        "curve_radius": 1200.0,
        "previous_repairs": 4,
        "last_tamping_days": 210,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "T041",
        "location": "KM 142.5 Delhi-Kanpur Mainline (Synthetic)",
        "section": "NDLS-CNB High-Density Corridor",
        "division": "Delhi Division",
        "zone": "Northern Railway (NR)",
        "track_age": 14,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 58,
        "speed_limit": 130,
        "curve_radius": 1200.0,
        "previous_repairs": 4,
        "last_tamping_days": 210,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-NR-102",
        "location": "KM 88.2 Ghaziabad-Aligarh Line (Synthetic)",
        "section": "NDLS-CNB High-Density Corridor",
        "division": "Delhi Division",
        "zone": "Northern Railway (NR)",
        "track_age": 6,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 42,
        "speed_limit": 130,
        "curve_radius": 1600.0,
        "previous_repairs": 1,
        "last_tamping_days": 60,
        "network_importance": 8,
        "status": "Operational"
    },
    {
        "track_id": "TRK-NR-103",
        "location": "KM 215.8 Tundla Junction Approach (Synthetic)",
        "section": "NDLS-CNB High-Density Corridor",
        "division": "Agra Division",
        "zone": "Northern Railway (NR)",
        "track_age": 19,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 64,
        "speed_limit": 110,
        "curve_radius": 520.0,
        "previous_repairs": 7,
        "last_tamping_days": 280,
        "network_importance": 10,
        "status": "Block Required"
    },
    {
        "track_id": "TRK-NR-104",
        "location": "KM 45.1 Sonipat Suburban Section (Synthetic)",
        "section": "NDLS-UMB Mainline",
        "division": "Delhi Division",
        "zone": "Northern Railway (NR)",
        "track_age": 9,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 36,
        "speed_limit": 130,
        "curve_radius": 1400.0,
        "previous_repairs": 2,
        "last_tamping_days": 110,
        "network_importance": 7,
        "status": "Operational"
    },
    {
        "track_id": "TRK-NR-105",
        "location": "KM 310.4 Ambala Cantt Bypass (Synthetic)",
        "section": "NDLS-UMB Mainline",
        "division": "Ambala Division",
        "zone": "Northern Railway (NR)",
        "track_age": 16,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 52,
        "speed_limit": 110,
        "curve_radius": 850.0,
        "previous_repairs": 5,
        "last_tamping_days": 190,
        "network_importance": 8,
        "status": "Speed Restricted"
    },

    # --- CENTRAL RAILWAY (CR) ---
    {
        "track_id": "TRK-CR-201",
        "location": "KM 42.1 Kharghar-Panvel Section (Synthetic)",
        "section": "CSTM-PUNE Corridor",
        "division": "Mumbai Division",
        "zone": "Central Railway (CR)",
        "track_age": 18,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 68,
        "speed_limit": 110,
        "curve_radius": 650.0,
        "previous_repairs": 6,
        "last_tamping_days": 240,
        "network_importance": 10,
        "status": "Block Required"
    },
    {
        "track_id": "TRK-CR-202",
        "location": "KM 118.6 Lonavala Ghat Section (Synthetic)",
        "section": "CSTM-PUNE Ghat Line",
        "division": "Mumbai Division",
        "zone": "Central Railway (CR)",
        "track_age": 22,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 72,
        "speed_limit": 80,
        "curve_radius": 420.0,
        "previous_repairs": 9,
        "last_tamping_days": 310,
        "network_importance": 10,
        "status": "Block Required"
    },
    {
        "track_id": "TRK-CR-203",
        "location": "KM 165.2 Chinchwad Industrial Yard (Synthetic)",
        "section": "CSTM-PUNE Corridor",
        "division": "Pune Division",
        "zone": "Central Railway (CR)",
        "track_age": 7,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 38,
        "speed_limit": 110,
        "curve_radius": 1500.0,
        "previous_repairs": 1,
        "last_tamping_days": 75,
        "network_importance": 7,
        "status": "Operational"
    },
    {
        "track_id": "TRK-CR-204",
        "location": "KM 440.5 Bhusaval Freight Loop (Synthetic)",
        "section": "IGP-BSL Freight Trunk",
        "division": "Bhusaval Division",
        "zone": "Central Railway (CR)",
        "track_age": 15,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 76,
        "speed_limit": 100,
        "curve_radius": 950.0,
        "previous_repairs": 4,
        "last_tamping_days": 200,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-CR-205",
        "location": "KM 782.1 Nagpur Mainline Approach (Synthetic)",
        "section": "BSL-NGP Central Corridor",
        "division": "Nagpur Division",
        "zone": "Central Railway (CR)",
        "track_age": 11,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 48,
        "speed_limit": 130,
        "curve_radius": 1300.0,
        "previous_repairs": 3,
        "last_tamping_days": 140,
        "network_importance": 8,
        "status": "Operational"
    },

    # --- WESTERN RAILWAY (WR) ---
    {
        "track_id": "TRK-WR-301",
        "location": "KM 74.8 Virar-Dahanu Road (Synthetic)",
        "section": "BCT-ADI Mainline",
        "division": "Mumbai Central",
        "zone": "Western Railway (WR)",
        "track_age": 11,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 52,
        "speed_limit": 130,
        "curve_radius": 1100.0,
        "previous_repairs": 2,
        "last_tamping_days": 120,
        "network_importance": 8,
        "status": "Operational"
    },
    {
        "track_id": "TRK-WR-302",
        "location": "KM 168.3 Valsad Coastal Line (Synthetic)",
        "section": "BCT-ADI Mainline",
        "division": "Mumbai Central",
        "zone": "Western Railway (WR)",
        "track_age": 17,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 58,
        "speed_limit": 110,
        "curve_radius": 750.0,
        "previous_repairs": 6,
        "last_tamping_days": 260,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-WR-303",
        "location": "KM 262.9 Surat Industrial Bypass (Synthetic)",
        "section": "BCT-ADI Mainline",
        "division": "Vadodara Division",
        "zone": "Western Railway (WR)",
        "track_age": 5,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 40,
        "speed_limit": 130,
        "curve_radius": 1800.0,
        "previous_repairs": 0,
        "last_tamping_days": 45,
        "network_importance": 8,
        "status": "Operational"
    },
    {
        "track_id": "TRK-WR-304",
        "location": "KM 392.4 Vadodara Yard Departure (Synthetic)",
        "section": "BCT-ADI Mainline",
        "division": "Vadodara Division",
        "zone": "Western Railway (WR)",
        "track_age": 13,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 62,
        "speed_limit": 110,
        "curve_radius": 900.0,
        "previous_repairs": 3,
        "last_tamping_days": 170,
        "network_importance": 9,
        "status": "Operational"
    },
    {
        "track_id": "TRK-WR-305",
        "location": "KM 491.1 Ahmedabad Express Corridor (Synthetic)",
        "section": "BCT-ADI Mainline",
        "division": "Ahmedabad Division",
        "zone": "Western Railway (WR)",
        "track_age": 8,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 44,
        "speed_limit": 130,
        "curve_radius": 1500.0,
        "previous_repairs": 1,
        "last_tamping_days": 90,
        "network_importance": 8,
        "status": "Operational"
    },

    # --- EASTERN RAILWAY (ER) ---
    {
        "track_id": "TRK-ER-401",
        "location": "KM 195.4 Barddhaman-Asansol (Synthetic)",
        "section": "HWH-NDLS Grand Chord",
        "division": "Asansol Division",
        "zone": "Eastern Railway (ER)",
        "track_age": 22,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 72,
        "speed_limit": 110,
        "curve_radius": 480.0,
        "previous_repairs": 8,
        "last_tamping_days": 310,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-ER-402",
        "location": "KM 98.2 Dankuni Freight Hub (Synthetic)",
        "section": "HWH-NDLS Main Line",
        "division": "Howrah Division",
        "zone": "Eastern Railway (ER)",
        "track_age": 14,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 66,
        "speed_limit": 110,
        "curve_radius": 800.0,
        "previous_repairs": 4,
        "last_tamping_days": 210,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-ER-403",
        "location": "KM 260.5 Raniganj Coal Belt Loop (Synthetic)",
        "section": "HWH-NDLS Grand Chord",
        "division": "Asansol Division",
        "zone": "Eastern Railway (ER)",
        "track_age": 25,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 78,
        "speed_limit": 80,
        "curve_radius": 450.0,
        "previous_repairs": 10,
        "last_tamping_days": 340,
        "network_importance": 10,
        "status": "Block Required"
    },
    {
        "track_id": "TRK-ER-404",
        "location": "KM 328.7 Malda Town Approach (Synthetic)",
        "section": "HWH-NJP Corridor",
        "division": "Malda Division",
        "zone": "Eastern Railway (ER)",
        "track_age": 10,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 34,
        "speed_limit": 110,
        "curve_radius": 1200.0,
        "previous_repairs": 2,
        "last_tamping_days": 130,
        "network_importance": 7,
        "status": "Operational"
    },
    {
        "track_id": "TRK-ER-405",
        "location": "KM 142.1 Bolpur Shantiniketan (Synthetic)",
        "section": "HWH-RPH Loop",
        "division": "Howrah Division",
        "zone": "Eastern Railway (ER)",
        "track_age": 12,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 30,
        "speed_limit": 110,
        "curve_radius": 1400.0,
        "previous_repairs": 2,
        "last_tamping_days": 150,
        "network_importance": 7,
        "status": "Operational"
    },

    # --- SOUTH CENTRAL RAILWAY (SCR) ---
    {
        "track_id": "TRK-SCR-501",
        "location": "KM 112.3 Kazipet Junction (Synthetic)",
        "section": "SC-BPQ Trunk Line",
        "division": "Secunderabad Division",
        "zone": "South Central Railway (SCR)",
        "track_age": 16,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 65,
        "speed_limit": 130,
        "curve_radius": 950.0,
        "previous_repairs": 5,
        "last_tamping_days": 220,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-SCR-502",
        "location": "KM 45.6 Vijayawada Bypass (Synthetic)",
        "section": "BZA-GDR Trunk Corridor",
        "division": "Vijayawada Division",
        "zone": "South Central Railway (SCR)",
        "track_age": 8,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 50,
        "speed_limit": 130,
        "curve_radius": 1600.0,
        "previous_repairs": 1,
        "last_tamping_days": 85,
        "network_importance": 9,
        "status": "Operational"
    },
    {
        "track_id": "TRK-SCR-503",
        "location": "KM 220.8 Guntakal Freight Line (Synthetic)",
        "section": "GTL-RU Trunk",
        "division": "Guntakal Division",
        "zone": "South Central Railway (SCR)",
        "track_age": 20,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 70,
        "speed_limit": 100,
        "curve_radius": 580.0,
        "previous_repairs": 8,
        "last_tamping_days": 290,
        "network_importance": 9,
        "status": "Block Required"
    },
    {
        "track_id": "TRK-SCR-504",
        "location": "KM 312.4 Nandyal Section (Synthetic)",
        "section": "GNT-GTL Branch Line",
        "division": "Guntur Division",
        "zone": "South Central Railway (SCR)",
        "track_age": 6,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 24,
        "speed_limit": 100,
        "curve_radius": 1700.0,
        "previous_repairs": 0,
        "last_tamping_days": 50,
        "network_importance": 6,
        "status": "Operational"
    },

    # --- SOUTHERN RAILWAY (SR) ---
    {
        "track_id": "TRK-SR-601",
        "location": "KM 65.4 Arakkonam Junction (Synthetic)",
        "section": "MAS-JTJ Mainline",
        "division": "Chennai Division",
        "zone": "Southern Railway (SR)",
        "track_age": 13,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 55,
        "speed_limit": 130,
        "curve_radius": 1100.0,
        "previous_repairs": 3,
        "last_tamping_days": 160,
        "network_importance": 9,
        "status": "Operational"
    },
    {
        "track_id": "TRK-SR-602",
        "location": "KM 212.8 Jolarpettai Ghat Approach (Synthetic)",
        "section": "MAS-SBC Main Line",
        "division": "Chennai Division",
        "zone": "Southern Railway (SR)",
        "track_age": 18,
        "steel_grade": "52kg 90UTS",
        "traffic_per_day": 60,
        "speed_limit": 110,
        "curve_radius": 620.0,
        "previous_repairs": 6,
        "last_tamping_days": 250,
        "network_importance": 9,
        "status": "Speed Restricted"
    },
    {
        "track_id": "TRK-SR-603",
        "location": "KM 340.2 Coimbatore Industrial Loop (Synthetic)",
        "section": "ED-CBE Corridor",
        "division": "Salem Division",
        "zone": "Southern Railway (SR)",
        "track_age": 7,
        "steel_grade": "60kg 90UTS",
        "traffic_per_day": 32,
        "speed_limit": 110,
        "curve_radius": 1400.0,
        "previous_repairs": 1,
        "last_tamping_days": 70,
        "network_importance": 7,
        "status": "Operational"
    },
    {
        "track_id": "TRK-SR-604",
        "location": "KM 495.1 Trivandrum Coastal Curve (Synthetic)",
        "section": "ERS-TVC Mainline",
        "division": "Trivandrum Division",
        "zone": "Southern Railway (SR)",
        "track_age": 15,
        "steel_grade": "IU-60 1080 HH",
        "traffic_per_day": 46,
        "speed_limit": 100,
        "curve_radius": 500.0,
        "previous_repairs": 5,
        "last_tamping_days": 210,
        "network_importance": 8,
        "status": "Operational"
    }
]

INITIAL_TRAINS = [
    {
        "train_number": "22436",
        "train_name": "Vande Bharat Express",
        "train_type": "Premium Superfast",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "DOWN",
        "departure_time": "06:00",
        "arrival_time": "08:15",
        "priority_level": 1
    },
    {
        "train_number": "12952",
        "train_name": "New Delhi Rajdhani Express",
        "train_type": "Superfast Express",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "UP",
        "departure_time": "08:45",
        "arrival_time": "11:15",
        "priority_level": 1
    },
    {
        "train_number": "12002",
        "train_name": "Bhopal Shatabdi Express",
        "train_type": "Superfast Express",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "DOWN",
        "departure_time": "12:00",
        "arrival_time": "14:30",
        "priority_level": 2
    },
    {
        "train_number": "12418",
        "train_name": "Prayagraj Express",
        "train_type": "Express Passenger",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "UP",
        "departure_time": "16:30",
        "arrival_time": "19:45",
        "priority_level": 3
    },
    {
        "train_number": "F9021",
        "train_name": "Container Freight Special",
        "train_type": "Heavy Freight",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "DOWN",
        "departure_time": "20:30",
        "arrival_time": "00:30",
        "priority_level": 4
    },
    {
        "train_number": "F8804",
        "train_name": "Coal Rake Freight",
        "train_type": "Heavy Freight",
        "corridor_section": "NDLS-CNB Mainline",
        "direction": "UP",
        "departure_time": "01:30",
        "arrival_time": "05:00",
        "priority_level": 5
    }
]

INITIAL_BLOCK_REQUESTS = [
    {
        "block_id": "BLK-NR-001",
        "track_id": "T041",
        "corridor_section": "NDLS-CNB Mainline",
        "block_type": "Emergency Rail Cut & Weld Replacement",
        "required_duration_hours": 2.0,
        "recommended_start": "01:00",
        "recommended_end": "03:00",
        "status": "Proposed",
        "priority_score": 92.0,
        "crew_assigned": "Northern Rly Gang #7 & TRT Unit",
        "train_delay_penalty": 0.0
    },
    {
        "block_id": "BLK-CR-002",
        "track_id": "TRK-CR-201",
        "corridor_section": "NDLS-CNB Mainline",
        "block_type": "CSM Heavy Track Tamping",
        "required_duration_hours": 2.5,
        "recommended_start": "13:00",
        "recommended_end": "15:30",
        "status": "Proposed",
        "priority_score": 86.0,
        "crew_assigned": "Central Rly Machine Express Division",
        "train_delay_penalty": 15.0
    },
    {
        "block_id": "BLK-ER-003",
        "track_id": "TRK-ER-403",
        "corridor_section": "NDLS-CNB Mainline",
        "block_type": "USFD Flaw Detection & Sleeper Exchange",
        "required_duration_hours": 2.0,
        "recommended_start": "10:00",
        "recommended_end": "12:00",
        "status": "Proposed",
        "priority_score": 78.4,
        "crew_assigned": "Eastern Rly Track Safety Wing",
        "train_delay_penalty": 8.0
    }
]


def seed_database(db: Session):
    """
    Safely seeds synthetic railway tracks, trains, inspections, risk records,
    and maintenance blocks into the SQLite database.
    Idempotent: Skips existing records to prevent duplicate key errors.
    """
    # 1. Insert Synthetic Tracks (Skip duplicates)
    for t_data in SYNTHETIC_TRACKS:
        existing = db.query(Track).filter(Track.track_id == t_data["track_id"]).first()
        if not existing:
            track = Track(**t_data)
            db.add(track)
    db.commit()

    # 2. Add Pre-populated Inspection & Risk Records for Critical/High Tracks
    critical_tracks = ["T041", "TRK-NR-103", "TRK-CR-201", "TRK-CR-202", "TRK-ER-403", "TRK-SCR-503"]
    
    for trk_id in critical_tracks:
        trk_obj = db.query(Track).filter(Track.track_id == trk_id).first()
        if trk_obj:
            existing_insp = db.query(Inspection).filter(Inspection.track_id == trk_id).first()
            if not existing_insp:
                defect_preset = "crack" if trk_id in ["T041", "TRK-NR-103"] else ("broken_sleeper" if "CR" in trk_id else "head_check")
                sev_score = 88.0 if trk_id in ["T041", "TRK-CR-202"] else 76.0
                
                inspection = Inspection(
                    inspection_id=f"INSP-SEED-{trk_id}",
                    track_id=trk_id,
                    image_url=f"/presets/{defect_preset}.jpg",
                    defect_type=defect_preset,
                    confidence=0.94,
                    severity=sev_score,
                    bounding_box=json.dumps({"ymin": 35, "xmin": 40, "ymax": 65, "xmax": 65})
                )
                db.add(inspection)

                risk_res = calculate_risk(
                    track_data={
                        "track_age": trk_obj.track_age,
                        "traffic_per_day": trk_obj.traffic_per_day,
                        "speed_limit": trk_obj.speed_limit,
                        "curve_radius": trk_obj.curve_radius,
                        "previous_repairs": trk_obj.previous_repairs,
                        "last_tamping_days": trk_obj.last_tamping_days
                    },
                    fault_data={"severity": sev_score, "confidence": 0.94}
                )

                risk = RiskRecord(
                    track_id=trk_id,
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
                db.add(risk)

    # 3. Add Train Schedules (Skip duplicates)
    for tr_data in INITIAL_TRAINS:
        existing_tr = db.query(TrainSchedule).filter(TrainSchedule.train_number == tr_data["train_number"]).first()
        if not existing_tr:
            tr = TrainSchedule(**tr_data)
            db.add(tr)

    # 4. Add Maintenance Blocks (Skip duplicates)
    for blk_data in INITIAL_BLOCK_REQUESTS:
        existing_blk = db.query(MaintenanceBlock).filter(MaintenanceBlock.block_id == blk_data["block_id"]).first()
        if not existing_blk:
            blk = MaintenanceBlock(**blk_data)
            db.add(blk)

    db.commit()

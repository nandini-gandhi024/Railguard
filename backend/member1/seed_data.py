from app.database import SessionLocal
from app.models import (
    Track,
    Defect,
    Weather,
    Maintenance,
    RiskAssessment,
    MaintenancePriority,
    MaintenanceBlock
)

db = SessionLocal()

try:
    # -------------------------------------------------
    # TRACKS
    # -------------------------------------------------

    tracks = [
        Track(
            location="Ahmedabad",
            section="Ahmedabad - Vadodara",
            division="Ahmedabad",
            zone="Western Railway",
            track_age=18,
            steel_grade="60E1",
            traffic_per_day=85,
            speed_limit=130,
            curve_radius=1200,
            previous_repairs="Rail grinding, sleeper replacement",
            last_tamping_days=45,
            network_importance="High",
            status="Active",
            latitude=23.0225,
            longitude=72.5714
        ),

        Track(
            location="Vadodara",
            section="Vadodara - Surat",
            division="Vadodara",
            zone="Western Railway",
            track_age=12,
            steel_grade="60E1",
            traffic_per_day=110,
            speed_limit=130,
            curve_radius=1500,
            previous_repairs="Ballast renewal",
            last_tamping_days=72,
            network_importance="Critical",
            status="Active",
            latitude=22.3072,
            longitude=73.1812
        ),

        Track(
            location="Surat",
            section="Surat - Mumbai",
            division="Mumbai Central",
            zone="Western Railway",
            track_age=22,
            steel_grade="52kg",
            traffic_per_day=125,
            speed_limit=110,
            curve_radius=900,
            previous_repairs="Rail replacement, welding",
            last_tamping_days=110,
            network_importance="Critical",
            status="Active",
            latitude=21.1702,
            longitude=72.8311
        ),

        Track(
            location="Jaipur",
            section="Delhi - Jaipur",
            division="Jaipur",
            zone="North Western Railway",
            track_age=15,
            steel_grade="60E1",
            traffic_per_day=70,
            speed_limit=110,
            curve_radius=1400,
            previous_repairs="Sleeper replacement",
            last_tamping_days=35,
            network_importance="Medium",
            status="Active",
            latitude=26.9124,
            longitude=75.7873
        ),

        Track(
            location="Pune",
            section="Mumbai - Pune",
            division="Pune",
            zone="Central Railway",
            track_age=25,
            steel_grade="52kg",
            traffic_per_day=95,
            speed_limit=100,
            curve_radius=750,
            previous_repairs="Track renewal, drainage repair",
            last_tamping_days=145,
            network_importance="High",
            status="Active",
            latitude=18.5204,
            longitude=73.8567
        )
    ]

    db.add_all(tracks)
    db.commit()

    # -------------------------------------------------
    # DEFECTS
    # -------------------------------------------------

    defects = [
        Defect(
            track_id=1,
            defect_type="Crack",
            severity="High",
            confidence=0.94,
            image_path="sample_crack_01.jpg"
        ),
        Defect(
            track_id=1,
            defect_type="Surface Wear",
            severity="Medium",
            confidence=0.88,
            image_path="sample_wear_01.jpg"
        ),
        Defect(
            track_id=2,
            defect_type="Crack",
            severity="Critical",
            confidence=0.97,
            image_path="sample_crack_02.jpg"
        ),
        Defect(
            track_id=2,
            defect_type="Alignment Issue",
            severity="High",
            confidence=0.91,
            image_path="sample_alignment_01.jpg"
        ),
        Defect(
            track_id=3,
            defect_type="Rail Wear",
            severity="High",
            confidence=0.89,
            image_path="sample_wear_02.jpg"
        ),
        Defect(
            track_id=3,
            defect_type="Crack",
            severity="Medium",
            confidence=0.86,
            image_path="sample_crack_03.jpg"
        ),
        Defect(
            track_id=4,
            defect_type="Surface Wear",
            severity="Low",
            confidence=0.82,
            image_path="sample_wear_03.jpg"
        ),
        Defect(
            track_id=5,
            defect_type="Crack",
            severity="High",
            confidence=0.93,
            image_path="sample_crack_04.jpg"
        )
    ]

    db.add_all(defects)
    db.commit()

    # -------------------------------------------------
    # WEATHER
    # -------------------------------------------------

    weather = [
        Weather(
            track_id=1,
            location="Ahmedabad",
            temperature=32,
            humidity=72,
            rainfall=18,
            flood_risk="Low",
            weather_condition="Partly Cloudy"
        ),
        Weather(
            track_id=2,
            location="Vadodara",
            temperature=29,
            humidity=84,
            rainfall=52,
            flood_risk="Medium",
            weather_condition="Heavy Rain"
        ),
        Weather(
            track_id=3,
            location="Surat",
            temperature=28,
            humidity=88,
            rainfall=76,
            flood_risk="High",
            weather_condition="Heavy Rain"
        ),
        Weather(
            track_id=4,
            location="Jaipur",
            temperature=34,
            humidity=55,
            rainfall=5,
            flood_risk="Low",
            weather_condition="Clear"
        ),
        Weather(
            track_id=5,
            location="Pune",
            temperature=26,
            humidity=82,
            rainfall=64,
            flood_risk="Medium",
            weather_condition="Rain"
        )
    ]

    db.add_all(weather)
    db.commit()

    # -------------------------------------------------
    # MAINTENANCE HISTORY
    # -------------------------------------------------

    maintenance = [
        Maintenance(
            track_id=1,
            maintenance_date="2026-07-15",
            maintenance_type="Rail Grinding",
            maintenance_duration=6,
            maintenance_status="Completed",
            previous_repairs="Sleeper replacement",
            days_since_maintenance=45,
            crew="Crew A",
            cost=25000,
            notes="Routine rail grinding"
        ),
        Maintenance(
            track_id=2,
            maintenance_date="2026-06-25",
            maintenance_type="Track Tamping",
            maintenance_duration=8,
            maintenance_status="Completed",
            previous_repairs="Ballast renewal",
            days_since_maintenance=72,
            crew="Crew B",
            cost=32000,
            notes="Machine tamping completed"
        ),
        Maintenance(
            track_id=3,
            maintenance_date="2026-05-10",
            maintenance_type="Rail Replacement",
            maintenance_duration=10,
            maintenance_status="Completed",
            previous_repairs="Welding",
            days_since_maintenance=110,
            crew="Crew C",
            cost=85000,
            notes="Damaged rail section replaced"
        ),
        Maintenance(
            track_id=4,
            maintenance_date="2026-07-25",
            maintenance_type="Track Inspection",
            maintenance_duration=4,
            maintenance_status="Completed",
            previous_repairs="Sleeper replacement",
            days_since_maintenance=35,
            crew="Crew D",
            cost=15000,
            notes="Routine inspection"
        ),
        Maintenance(
            track_id=5,
            maintenance_date="2026-04-01",
            maintenance_type="Track Renewal",
            maintenance_duration=12,
            maintenance_status="Completed",
            previous_repairs="Drainage repair",
            days_since_maintenance=145,
            crew="Crew E",
            cost=110000,
            notes="Partial track renewal"
        )
    ]

    db.add_all(maintenance)
    db.commit()

    # -------------------------------------------------
    # RISK ASSESSMENTS
    # -------------------------------------------------

    risks = [
        RiskAssessment(
            track_id=1,
            risk_score=68,
            risk_level="High",
            failure_probability=0.52,
            risk_velocity=2.8
        ),
        RiskAssessment(
            track_id=2,
            risk_score=91,
            risk_level="Critical",
            failure_probability=0.87,
            risk_velocity=5.1
        ),
        RiskAssessment(
            track_id=3,
            risk_score=84,
            risk_level="Critical",
            failure_probability=0.76,
            risk_velocity=4.4
        ),
        RiskAssessment(
            track_id=4,
            risk_score=32,
            risk_level="Low",
            failure_probability=0.18,
            risk_velocity=1.1
        ),
        RiskAssessment(
            track_id=5,
            risk_score=79,
            risk_level="High",
            failure_probability=0.69,
            risk_velocity=3.9
        )
    ]

    db.add_all(risks)
    db.commit()

    # -------------------------------------------------
    # MAINTENANCE PRIORITY
    # -------------------------------------------------

    priorities = [
        MaintenancePriority(
            track_id=2,
            priority=1,
            reason="Critical crack, heavy rainfall and high traffic"
        ),
        MaintenancePriority(
            track_id=3,
            priority=2,
            reason="High rail wear, flood risk and overdue maintenance"
        ),
        MaintenancePriority(
            track_id=5,
            priority=3,
            reason="High risk and long period since maintenance"
        ),
        MaintenancePriority(
            track_id=1,
            priority=4,
            reason="High severity defect detected"
        ),
        MaintenancePriority(
            track_id=4,
            priority=5,
            reason="Low current risk"
        )
    ]

    db.add_all(priorities)
    db.commit()

    # -------------------------------------------------
    # MAINTENANCE BLOCKS
    # -------------------------------------------------

    blocks = [
        MaintenanceBlock(
            block_id="BLK-001",
            track_id=2,
            corridor_section="Vadodara - Surat",
            block_type="Emergency",
            required_duration=8,
            available_start="2026-09-08 00:00",
            available_end="2026-09-08 08:00",
            crew="Crew B"
        ),
        MaintenanceBlock(
            block_id="BLK-002",
            track_id=3,
            corridor_section="Surat - Mumbai",
            block_type="Planned",
            required_duration=10,
            available_start="2026-09-10 22:00",
            available_end="2026-09-11 08:00",
            crew="Crew C"
        ),
        MaintenanceBlock(
            block_id="BLK-003",
            track_id=5,
            corridor_section="Mumbai - Pune",
            block_type="Planned",
            required_duration=12,
            available_start="2026-09-12 22:00",
            available_end="2026-09-13 10:00",
            crew="Crew E"
        ),
        MaintenanceBlock(
            block_id="BLK-004",
            track_id=1,
            corridor_section="Ahmedabad - Vadodara",
            block_type="Routine",
            required_duration=6,
            available_start="2026-09-15 01:00",
            available_end="2026-09-15 07:00",
            crew="Crew A"
        ),
        MaintenanceBlock(
            block_id="BLK-005",
            track_id=4,
            corridor_section="Delhi - Jaipur",
            block_type="Routine",
            required_duration=4,
            available_start="2026-09-18 02:00",
            available_end="2026-09-18 06:00",
            crew="Crew D"
        )
    ]

    db.add_all(blocks)
    db.commit()

    print("====================================")
    print("RailGuard prototype data inserted!")
    print("Tracks: 5")
    print("Defects: 8")
    print("Weather records: 5")
    print("Maintenance records: 5")
    print("Risk assessments: 5")
    print("Priorities: 5")
    print("Maintenance blocks: 5")
    print("====================================")

finally:
    db.close()
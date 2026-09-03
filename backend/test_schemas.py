import json
from models.schemas import (
    TrackCreate, 
    FaultDetectionResponse, 
    RiskMetrics, 
    PredictionMetrics, 
    Recommendation, 
    AnalyzeImageResponse
)

print("==================================================")
print("  STEP 3: PYDANTIC SCHEMA VALIDATION TEST         ")
print("==================================================")

# Test 1: Validate TrackCreate schema
print("\n1. Testing TrackCreate payload validation...")
track_data = {
    "track_id": "T041",
    "location": "KM 142.5 Delhi-Kanpur Line",
    "section": "NDLS-CNB Mainline",
    "division": "Delhi Division",
    "zone": "Northern Railway (NR)",
    "track_age": 14,
    "steel_grade": "IU-60 1080 Head Hardened",
    "traffic_per_day": 58,
    "speed_limit": 130,
    "curve_radius": 1200.0,
    "previous_repairs": 4,
    "last_tamping_days": 210,
    "network_importance": 9
}
track_schema = TrackCreate(**track_data)
print(f"   [SUCCESS] Track schema validated: {track_schema.track_id} ({track_schema.location})")

# Test 2: Validate Master AnalyzeImageResponse schema
print("\n2. Testing Master AnalyzeImageResponse JSON schema...")
analysis_data = {
    "track_id": "T041",
    "fault": {
        "defect_type": "crack",
        "confidence": 0.94,
        "severity": 85.0
    },
    "risk": {
        "score": 92.0,
        "category": "Critical",
        "priority": 1,
        "tsr_speed_kmh": 30
    },
    "prediction": {
        "risk_7_days": 97.0,
        "risk_14_days": 99.0,
        "days_to_critical": 2
    },
    "recommendation": {
        "action": "Immediate inspection & TSR 30 km/h",
        "urgency": "Critical"
    },
    "xai_breakdown": {
        "Defect Severity": 40.0,
        "Traffic GMT": 25.0,
        "Thermal Stress": 15.0,
        "Track Age": 10.0,
        "Maintenance Delay": 10.0
    }
}
analysis_schema = AnalyzeImageResponse(**analysis_data)
print("   [SUCCESS] AnalyzeImageResponse JSON serialization clean:")
print(json.dumps(analysis_schema.model_dump(), indent=2))

print("\n==================================================")
print("  ALL PYDANTIC SCHEMA TESTS PASSED CLEANLY ")
print("==================================================")

import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from main import app

def test_api_with_images():
    print("==================================================================")
    print("  TESTING RAILGUARD POST /analyze-image WITH REAL DEFECT IMAGES   ")
    print("==================================================================")
    client = TestClient(app)

    val_dir = BASE_DIR / "railguard_dataset" / "images" / "val"
    crack_samples = list(val_dir.glob("cracks_*.*"))
    surface_samples = list(val_dir.glob("flakings_*.*")) + list(val_dir.glob("squats_*.*"))

    if not crack_samples or not surface_samples:
        print("[!] Validation images not found.")
        return

    test_cases = [
        ("Crack Image Inspection", crack_samples[0], "crack"),
        ("Surface Defect Image Inspection", surface_samples[0], "surface_defect")
    ]

    for title, img_path, expected_class in test_cases:
        print(f"\n--- {title} ---")
        print(f"File: {img_path.name}")
        
        with open(img_path, "rb") as f:
            files = {"file": (img_path.name, f.read(), "image/jpeg")}
            data = {"track_id": "T041"}
            res = client.post("/analyze-image", data=data, files=files)

        print(f"HTTP Status: {res.status_code}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"

        payload = res.json()
        print("API Response:")
        print(json.dumps(payload, indent=2))

        fault = payload.get("fault", {})
        print(f"\n[Validation]:")
        print(f"  Track ID:           {payload.get('track_id')}")
        print(f"  Defect Type:        {fault.get('defect_type')} (Expected: {expected_class})")
        print(f"  Confidence:         {fault.get('confidence')}")
        print(f"  Severity:           {fault.get('severity')}")
        print(f"  Bounding Box:       {fault.get('bounding_box')}")
        print(f"  Recommended Action: {fault.get('recommended_action')}")
        print(f"  Risk Score:         {payload.get('risk', {}).get('score')}")
        print(f"  TSR Speed:          {payload.get('risk', {}).get('tsr_speed_kmh')} km/h")

        assert fault.get("defect_type") == expected_class, f"Defect mismatch: {fault.get('defect_type')} != {expected_class}"
        assert fault.get("confidence", 0) > 0.5, "Confidence too low"
        assert fault.get("severity", 0) > 0, "Severity should be > 0"
        assert fault.get("bounding_box") is not None, "Bounding box missing"
        assert fault.get("recommended_action") is not None, "Action missing"
        print(f"  -> [PASSED] {title} verified successfully!")

    print("\n==================================================================")
    print("  ALL API FAULT DETECTION TESTS WITH REAL IMAGES PASSED CLEANLY!  ")
    print("==================================================================")

if __name__ == "__main__":
    test_api_with_images()

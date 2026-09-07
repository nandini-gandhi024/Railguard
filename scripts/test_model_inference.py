import sys
from pathlib import Path

# Add backend to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from ai.yolo_detector import get_detector

def test_inference():
    print("==================================================")
    print("  TESTING TRAINED YOLO MODEL ON VALIDATION IMAGES ")
    print("==================================================")
    detector = get_detector()
    status = detector.get_status()
    print(f"[*] Detector Status: Loaded={status['loaded']}, Weights={status['weights_path']}")
    print(f"[*] Model Classes:   {status['classes']}")

    val_dir = BASE_DIR / "railguard_dataset" / "images" / "val"
    if not val_dir.exists():
        print(f"[!] Validation directory not found: {val_dir}")
        return

    # Find sample images
    all_val = list(val_dir.glob("*.*"))
    crack_samples = [p for p in all_val if p.name.startswith("cracks_")][:3]
    flaking_samples = [p for p in all_val if p.name.startswith("flakings_")][:2]
    squat_samples = [p for p in all_val if p.name.startswith("squats_")][:2]
    spalling_samples = [p for p in all_val if p.name.startswith("spallings_")][:1]

    test_batch = crack_samples + flaking_samples + squat_samples + spalling_samples
    print(f"[*] Selected {len(test_batch)} validation images for inference testing.\n")

    for idx, img_path in enumerate(test_batch, 1):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        
        result = detector.detect(image_bytes=img_bytes)
        
        print(f"[{idx}] Image: {img_path.name}")
        print(f"     -> Defect Type:        {result.get('defect_type')}")
        print(f"     -> Defect Code:        {result.get('defect_code')}")
        print(f"     -> Confidence:         {result.get('confidence')}")
        print(f"     -> Severity:           {result.get('severity')}")
        print(f"     -> Bounding Box:       {result.get('bounding_box')}")
        print(f"     -> Recommended Action: {result.get('recommended_action')}")
        print("-" * 60)

if __name__ == "__main__":
    test_inference()

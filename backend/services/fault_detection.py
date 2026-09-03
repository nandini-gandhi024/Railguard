import random
from typing import Optional

def detect_fault(image_bytes: Optional[bytes] = None) -> dict:
    """
    Interface for Member 3's Computer Vision Model.
    Analyzes track image bytes and returns defect classification, confidence, and severity.
    
    Expected contract:
    {
      "defect_type": "crack",
      "confidence": 0.94,
      "severity": 85.0
    }
    """
    # MOCK IMPLEMENTATION: Will be replaced by Member 3's real CV model (YOLO/PyTorch)
    defect_types = ["crack", "head_check", "broken_sleeper", "missing_clip", "ballast_void"]
    
    # Return structured defect payload matching Member 3 spec
    return {
        "defect_type": "crack",
        "confidence": 0.94,
        "severity": 85.0,
        "bounding_box": {
            "ymin": 35.0,
            "xmin": 40.0,
            "ymax": 65.0,
            "xmax": 65.0
        },
        "description": "Transverse fatigue crack detected in rail head. High risk of rail fracture under heavy axle loading.",
        "recommended_action": "Immediate inspection & TSR 30 km/h."
    }

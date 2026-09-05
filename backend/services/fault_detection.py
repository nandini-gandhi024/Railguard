from typing import Optional, Dict, Any

try:
    from ai.yolo_detector import get_detector
except ImportError:
    from backend.ai.yolo_detector import get_detector


def detect_fault(image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
    """
    Interface for Member 3's Computer Vision Fault Detection Model.
    Routes image bytes to the YOLO detector engine in backend/ai/yolo_detector.py.
    
    If trained YOLO weights (.pt) are present in backend/ai/weights/, runs live model inference.
    If weights are not yet present, gracefully falls back to domain heuristic analysis.
    
    Expected return contract:
    {
      "defect_type": "crack",
      "confidence": 0.94,
      "severity": 85.0,
      "bounding_box": {"ymin": 35.0, "xmin": 40.0, "ymax": 65.0, "xmax": 65.0},
      "description": "...",
      "recommended_action": "..."
    }
    """
    detector = get_detector()
    return detector.detect(image_bytes)


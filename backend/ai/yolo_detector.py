import io
import os
import glob
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from PIL import Image

try:
    from services.cv_detector import DEFECT_CATALOG, analyze_rail_image
except ImportError:
    from backend.services.cv_detector import DEFECT_CATALOG, analyze_rail_image

logger = logging.getLogger("railguard.ai.yolo")

# Weights directory path relative to this file
WEIGHTS_DIR = Path(__file__).resolve().parent / "weights"


class YOLODetector:
    """
    YOLO Computer Vision Fault Detector for RailGuard (Member 3 Interface).
    
    Responsibilities:
    1. Discovers and loads trained YOLO PyTorch weights (.pt or .onnx) from backend/ai/weights/.
    2. Ingests raw image bytes from HTTP uploads and runs inference.
    3. Converts YOLO normalized outputs [0.0, 1.0] to percentage coordinates [0.0, 100.0]
       matching {ymin, xmin, ymax, xmax} expected by the React frontend canvas.
    4. Maps detected defect classes to Indian Railways domain engineering metadata (severity, TSR, actions).
    5. Provides seamless fallback if weights are not yet present.
    """

    def __init__(self, weights_path: Optional[str] = None):
        self.model = None
        self.model_path = None
        self.classes = {}
        self.init_error = None
        
        # Discover or load weights
        target_weights = weights_path or self._find_weights_file()
        if target_weights:
            self.load_model(target_weights)
        else:
            logger.info(
                f"[YOLODetector] No trained weights found in {WEIGHTS_DIR}. "
                f"Operating in heuristic fallback mode until trained weights are placed."
            )

    def _find_weights_file(self) -> Optional[str]:
        """Scans backend/ai/weights/ for candidate model weights."""
        if not WEIGHTS_DIR.exists():
            return None

        # Preference 1: best.pt
        best_pt = WEIGHTS_DIR / "best.pt"
        if best_pt.exists():
            return str(best_pt)

        # Preference 2: railguard_yolo.pt
        named_pt = WEIGHTS_DIR / "railguard_yolo.pt"
        if named_pt.exists():
            return str(named_pt)

        # Preference 3: Any .pt or .onnx file
        pt_files = list(WEIGHTS_DIR.glob("*.pt")) + list(WEIGHTS_DIR.glob("*.onnx"))
        if pt_files:
            return str(pt_files[0])

        return None

    def load_model(self, weights_path: str) -> bool:
        """Loads YOLO model into memory using Ultralytics."""
        try:
            from ultralytics import YOLO  # Lazy import so server runs without ultralytics installed
            self.model = YOLO(weights_path)
            self.model_path = weights_path
            self.classes = self.model.names if hasattr(self.model, "names") else {}
            self.init_error = None
            logger.info(f"[YOLODetector] Successfully loaded YOLO weights: {weights_path}")
            return True
        except ImportError:
            self.init_error = "ultralytics package not installed. Run: pip install ultralytics"
            logger.warning(f"[YOLODetector] {self.init_error}. Operating in fallback mode.")
            return False
        except Exception as e:
            self.init_error = f"Error loading model from {weights_path}: {str(e)}"
            logger.error(f"[YOLODetector] {self.init_error}")
            return False

    @property
    def is_loaded(self) -> bool:
        """Returns True if a real YOLO model is loaded into memory."""
        return self.model is not None

    def get_status(self) -> Dict[str, Any]:
        """Diagnostic helper reporting current AI model status."""
        return {
            "loaded": self.is_loaded,
            "weights_path": self.model_path,
            "weights_dir": str(WEIGHTS_DIR),
            "classes": self.classes,
            "error": self.init_error
        }

    def detect(self, image_bytes: Optional[bytes] = None, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Main defect detection method.
        
        If a trained YOLO model is loaded, performs live inference on the image.
        If no weights are present, gracefully falls back to domain heuristic analysis.
        """
        # If no image provided, return default baseline crack inspection
        if not image_bytes:
            return self._default_mock_payload()

        # -------------------------------------------------------------
        # Path A: Real Trained YOLO Model Inference
        # -------------------------------------------------------------
        if self.is_loaded:
            try:
                # 1. Convert image bytes to PIL Image
                image = Image.open(io.BytesIO(image_bytes))
                
                # 2. Run YOLO inference
                results = self.model.predict(source=image, conf=conf_threshold, verbose=False)
                
                if results and len(results) > 0 and len(results[0].boxes) > 0:
                    boxes = results[0].boxes
                    
                    # Pick highest confidence detection
                    best_idx = int(boxes.conf.argmax())
                    cls_id = int(boxes.cls[best_idx].item())
                    conf_val = round(float(boxes.conf[best_idx].item()), 3)
                    
                    # Resolve class name
                    raw_cls_name = self.classes.get(cls_id, f"class_{cls_id}").lower()
                    defect_key = self._normalize_class_name(raw_cls_name)
                    
                    # Convert normalized xyxyn [0.0, 1.0] -> percentage coordinates [0.0, 100.0]
                    # Format: xmin, ymin, xmax, ymax
                    xyxyn = boxes.xyxyn[best_idx].tolist()
                    bbox = {
                        "ymin": round(xyxyn[1] * 100.0, 1),
                        "xmin": round(xyxyn[0] * 100.0, 1),
                        "ymax": round(xyxyn[3] * 100.0, 1),
                        "xmax": round(xyxyn[2] * 100.0, 1)
                    }
                    
                    # Retrieve engineering parameters from domain catalog
                    catalog_entry = DEFECT_CATALOG.get(defect_key, {})
                    defect_name = catalog_entry.get("name", defect_key.replace("_", " ").title())
                    sev_range = catalog_entry.get("severity_range", (70, 95))
                    severity = round(sev_range[0] + (conf_val * (sev_range[1] - sev_range[0])), 1)
                    
                    description = catalog_entry.get(
                        "description", 
                        f"Detected {defect_name} with confidence {int(conf_val * 100)}%."
                    )
                    recommended_action = catalog_entry.get(
                        "action", 
                        "Schedule engineering track inspection and monitor degradation."
                    )
                    
                    return {
                        "defect_type": defect_name,
                        "defect_code": defect_key,
                        "confidence": conf_val,
                        "severity": severity,
                        "bounding_box": bbox,
                        "description": description,
                        "recommended_action": recommended_action
                    }
                else:
                    # No defect detected above confidence threshold -> Healthy Rail
                    return {
                        "defect_type": "No Flaw Detected",
                        "defect_code": "healthy",
                        "confidence": 0.98,
                        "severity": 0.0,
                        "bounding_box": None,
                        "description": "Visual track inspection shows no immediate surface cracking, sleeper fractures, or fastener displacements.",
                        "recommended_action": "Normal operations. Routine scheduled patrol inspection."
                    }
            except Exception as e:
                logger.error(f"[YOLODetector] Inference failed: {e}. Falling back to heuristic analyzer.")

        # -------------------------------------------------------------
        # Path B: Graceful Heuristic Fallback (When weights are not yet trained)
        # -------------------------------------------------------------
        fallback_res = analyze_rail_image(image_bytes=image_bytes)
        return {
            "defect_type": fallback_res["defect_type"],
            "defect_code": fallback_res.get("defect_code", "crack"),
            "confidence": fallback_res["confidence"],
            "severity": fallback_res["severity"],
            "bounding_box": fallback_res["bounding_box"],
            "description": fallback_res["description"],
            "recommended_action": fallback_res["recommended_action"]
        }

    def _normalize_class_name(self, name: str) -> str:
        """Maps diverse user model class names to standard defect catalog keys."""
        cleaned = name.lower().replace("-", "_").replace(" ", "_")
        if "crack" in cleaned:
            return "crack"
        if "sleeper" in cleaned:
            return "broken_sleeper"
        if "clip" in cleaned or "erc" in cleaned or "fastener" in cleaned:
            return "missing_clip"
        if "head" in cleaned or "spall" in cleaned or "rcf" in cleaned:
            return "head_check"
        if "ballast" in cleaned or "void" in cleaned:
            return "ballast_void"
        if "buckl" in cleaned or "thermal" in cleaned:
            return "track_buckling"
        return cleaned

    def _default_mock_payload(self) -> Dict[str, Any]:
        """Provides baseline crack inspection when no image is uploaded."""
        return {
            "defect_type": "crack",
            "defect_code": "crack",
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


# Global Singleton Instance
_detector_instance: Optional[YOLODetector] = None

def get_detector() -> YOLODetector:
    """Provides a singleton instance of YOLODetector, caching loaded model in memory."""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = YOLODetector()
    return _detector_instance

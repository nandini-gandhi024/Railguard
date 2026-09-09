"""
RailGuard - Member 4: AI/ML Risk & Prediction
Risk Model Inference Engine
Loads trained model from backend/ai/weights/risk_model.joblib
Provides predict_risk() with calibrated fallback if weights are not yet trained.
"""

from typing import Dict, Any, Optional
from pathlib import Path
# pyrefly: ignore [missing-import]
import numpy as np

try:
    # pyrefly: ignore [missing-import]
    import joblib
except ImportError:
    try:
        from sklearn.utils import _joblib as joblib
    except ImportError:
        joblib = None

from .feature_extractor import extract_features, feature_dict_to_vector


CURRENT_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = CURRENT_DIR.parent / "weights" / "risk_model.joblib"


class RiskModel:
    """Predicts composite risk score (0-100) using trained ML model or physics fallback."""

    def __init__(self, weights_path: Optional[str] = None):
        self.model = None
        self.model_path = Path(weights_path) if weights_path else WEIGHTS_PATH
        self._load_model()

    def _load_model(self):
        if joblib is not None and self.model_path.exists():
            try:
                self.model = joblib.load(str(self.model_path))
            except Exception as e:
                self.model = None

    def predict(
        self,
        features: Dict[str, float]
    ) -> float:
        """Predicts continuous risk score [0.0 - 100.0]."""
        if self.model is not None:
            vec = np.array([feature_dict_to_vector(features)])
            pred = float(self.model.predict(vec)[0])
            return round(min(100.0, max(0.0, pred)), 1)
        
        # Fallback calibrated multi-factor formula matching IR engineering standards
        d_score = features.get("defect_score", 0.70) * 100.0
        t_score = features.get("traffic_norm", 0.50) * 100.0
        th_score = features.get("thermal_stress", 0.40) * 100.0
        rain_score = features.get("rain_stress", 0.30) * 100.0
        env_score = features.get("env_risk_norm", 0.40) * 100.0
        age_score = features.get("age_norm", 0.40) * 100.0
        rep_score = features.get("repair_fatigue", 0.30) * 100.0
        delay_score = features.get("delay_impact", 0.0) * 100.0

        weather_composite = (th_score * 0.5) + (rain_score * 0.3) + (env_score * 0.2)

        raw = (
            (0.38 * d_score) +
            (0.24 * t_score) +
            (0.14 * weather_composite) +
            (0.10 * age_score) +
            (0.06 * rep_score) +
            (0.08 * delay_score)
        )
        return round(min(100.0, max(0.0, raw)), 1)


# Global singleton instance
_GLOBAL_MODEL = None

def get_risk_model() -> RiskModel:
    global _GLOBAL_MODEL
    if _GLOBAL_MODEL is None:
        _GLOBAL_MODEL = RiskModel()
    return _GLOBAL_MODEL

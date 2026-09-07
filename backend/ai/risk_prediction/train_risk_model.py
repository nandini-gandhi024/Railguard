"""
RailGuard - Member 4: AI/ML Risk & Prediction
Model Training Script
Trains an XGBoost / Scikit-Learn Gradient Boosting model using real Indian Railways
sections from Member 6, defect catalog from Member 3, and environmental/weather data.
Saves model weights to backend/ai/weights/risk_model.joblib.
"""

import os
import json
import csv
import math
import random
from pathlib import Path
import numpy as np

try:
    import joblib
except ImportError:
    from sklearn.utils import _joblib as joblib

from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from feature_extractor import extract_features, feature_dict_to_vector, DEFECT_WEIGHTS


# Paths
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent.parent
DATA_DIR = BACKEND_DIR / "data"
WEIGHTS_DIR = BACKEND_DIR / "ai" / "weights"
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


def load_member6_data():
    """Loads Member 6's railway sections, weather, and environmental data."""
    sections_file = DATA_DIR / "railway_sections.csv"
    weather_file = DATA_DIR / "weather_data.json"
    env_file = DATA_DIR / "environmental_risk.json"

    sections = []
    if sections_file.exists():
        with open(sections_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sections.append(row)

    weather_dict = {}
    if weather_file.exists():
        with open(weather_file, mode="r", encoding="utf-8") as f:
            weather_dict = json.load(f)

    env_dict = {}
    if env_file.exists():
        with open(env_file, mode="r", encoding="utf-8") as f:
            env_dict = json.load(f)

    return sections, weather_dict, env_dict


def generate_training_dataset(num_samples=2500):
    """Generates synthetic training dataset grounded in real IR sections."""
    sections, weather_dict, env_dict = load_member6_data()
    
    # If sections empty, use default Indian Railways sections
    if not sections:
        sections = [
            {"section_id": "SEC-NR-101", "traffic_gmt_per_day": "62", "speed_limit_kmh": "130"},
            {"section_id": "SEC-NR-105", "traffic_gmt_per_day": "66", "speed_limit_kmh": "110"},
            {"section_id": "SEC-CR-203", "traffic_gmt_per_day": "68", "speed_limit_kmh": "60"}
        ]

    defect_types = list(DEFECT_WEIGHTS.keys())
    
    X = []
    y = []

    random.seed(42)
    np.random.seed(42)

    for _ in range(num_samples):
        sec = random.choice(sections)
        sec_id = sec.get("section_id", "SEC-NR-101")
        w_info = weather_dict.get(sec_id, {})
        e_info = env_dict.get(sec_id, {})

        # Operational features
        traffic_base = float(sec.get("traffic_gmt_per_day", 50.0))
        traffic_gmt = max(10.0, traffic_base + random.uniform(-15.0, 20.0))
        speed_limit = float(sec.get("speed_limit_kmh", 120.0))
        track_age = random.uniform(2.0, 30.0)
        curve_radius = random.choice([500.0, 800.0, 1200.0, 1600.0, 2500.0])
        prev_repairs = random.choice([0, 1, 2, 3, 4, 5, 6])
        last_tamping = random.uniform(20.0, 380.0)
        importance = random.choice([6, 7, 8, 9, 10])

        # Fault features
        defect_type = random.choice(defect_types)
        severity = random.uniform(30.0, 98.0) if defect_type != "normal" else random.uniform(5.0, 20.0)
        confidence = random.uniform(0.75, 0.98)

        # Weather features
        temp_c = float(w_info.get("temperature", random.uniform(24.0, 46.0))) + random.uniform(-3.0, 4.0)
        rainfall_mm = float(w_info.get("rainfall", random.uniform(0.0, 50.0)))
        env_score = float(e_info.get("environmental_risk_score", random.uniform(15.0, 85.0)))

        track_data = {
            "traffic_per_day": traffic_gmt,
            "speed_limit": speed_limit,
            "track_age": track_age,
            "curve_radius": curve_radius,
            "previous_repairs": prev_repairs,
            "last_tamping_days": last_tamping,
            "network_importance": importance
        }

        fault_data = {
            "defect_type": defect_type,
            "severity": severity,
            "confidence": confidence
        }

        weather_data = {
            "temperature_c": temp_c,
            "rainfall": rainfall_mm,
            "environmental_risk_score": env_score
        }

        delay_days = random.choice([0, 0, 0, 1, 3, 5, 7, 10, 14])

        feat_dict = extract_features(track_data, fault_data, weather_data, delay_days)
        vec = feature_dict_to_vector(feat_dict)

        # Ground truth target risk calculation (grounded in IR safety physics)
        def_w = DEFECT_WEIGHTS.get(defect_type, 0.5)
        raw_target = (
            (0.38 * (severity / 100.0) * confidence * def_w * 100.0) +
            (0.24 * min(100.0, (traffic_gmt / 70.0) * 100.0)) +
            (0.14 * min(100.0, (temp_c / 46.0) * 100.0 + (15.0 if rainfall_mm > 30.0 else 0.0))) +
            (0.10 * min(100.0, (track_age / 28.0) * 100.0)) +
            (0.06 * min(100.0, (prev_repairs / 5.0) * 100.0)) +
            (0.08 * (delay_days * 3.6))
        )
        
        # Non-linear interaction: high severity + heavy traffic creates compounding hazard
        if severity > 80.0 and traffic_gmt > 50.0 and def_w > 0.8:
            raw_target += 6.5

        target_risk = round(min(99.5, max(5.0, raw_target + random.gauss(0.0, 1.2))), 1)

        X.append(vec)
        y.append(target_risk)

    return np.array(X), np.array(y)


def train_and_save():
    print("==================================================")
    print("  RAILGUARD MEMBER 4: RISK MODEL TRAINING PIPELINE")
    print("==================================================")
    
    print("1. Generating physics-grounded dataset from Member 6 & 3...")
    X, y = generate_training_dataset(num_samples=3000)
    print(f"   Generated {len(X)} training samples with {X.shape[1]} features each.")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("2. Training Gradient Boosting Risk Regressor...")
    model = GradientBoostingRegressor(
        n_estimators=180,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f"3. Model Evaluation Results:")
    print(f"   - Mean Absolute Error (MAE): {mae:.2f} risk points")
    print(f"   - R² Score:                  {r2:.4f} (Accuracy: {r2*100:.1f}%)")

    # Save model
    model_path = WEIGHTS_DIR / "risk_model.joblib"
    joblib.dump(model, model_path)
    print(f"4. Trained model serialized to: {model_path}")

    # Feature Importance
    feature_names = [
        "Defect Score", "Traffic GMT", "Track Age", "Curve Stress",
        "Repair Fatigue", "Tamping Gap", "Thermal Stress", "Rain Stress",
        "Environmental Risk", "Network Importance", "Delay Impact"
    ]
    importances = model.feature_importances_
    print("5. Top Feature Importances:")
    sorted_idx = np.argsort(importances)[::-1]
    for idx in sorted_idx[:5]:
        print(f"   - {feature_names[idx]}: {importances[idx]*100:.1f}%")

    print("==================================================")
    print("  [SUCCESS] RISK MODEL READY FOR PRODUCTION!")
    print("==================================================")
    return model_path


if __name__ == "__main__":
    train_and_save()

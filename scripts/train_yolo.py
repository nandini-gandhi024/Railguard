import os
import shutil
from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_YAML = BASE_DIR / "railguard_dataset" / "data_balanced.yaml"
# Fallback to full data.yaml if balanced not found
if not DATA_YAML.exists():
    DATA_YAML = BASE_DIR / "railguard_dataset" / "data.yaml"

OUTPUT_WEIGHTS_DIR = BASE_DIR / "backend" / "ai" / "weights"
OUTPUT_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
TARGET_BEST_PT = OUTPUT_WEIGHTS_DIR / "best.pt"

def train():
    print("==================================================")
    print("  RAILGUARD YOLO PROTOTYPE TRAINING (MEMBER 3)    ")
    print("==================================================")
    print(f"[*] Loading pretrained base model: yolov8n.pt")
    model = YOLO("yolov8n.pt")

    epochs = 20
    imgsz = 320
    batch = 16
    device = "cpu"

    print(f"[*] Training config:")
    print(f"    Data YAML: {DATA_YAML}")
    print(f"    Epochs:    {epochs}")
    print(f"    Image Size:{imgsz}")
    print(f"    Batch Size:{batch}")
    print(f"    Device:    {device}")

    # Run YOLO training
    results = model.train(
        data=str(DATA_YAML),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        project=str(BASE_DIR / "runs"),
        name="railguard_prototype",
        exist_ok=True,
        workers=2,
        plots=True,
        verbose=True
    )

    # Locate best.pt
    run_best_pt = Path(results.save_dir) / "weights" / "best.pt"
    if not run_best_pt.exists():
        run_best_pt = Path(results.save_dir) / "weights" / "last.pt"

    if run_best_pt.exists():
        shutil.copy2(run_best_pt, TARGET_BEST_PT)
        print("\n==================================================")
        print(f"[SUCCESS] Best weights copied to: {TARGET_BEST_PT}")
        print(f"Size: {TARGET_BEST_PT.stat().st_size / (1024*1024):.2f} MB")
        print("==================================================")
    else:
        raise FileNotFoundError(f"Could not find trained weights at {run_best_pt}")

    # Evaluate validation metrics
    print("\n[*] Running post-training validation...")
    val_metrics = model.val(data=str(DATA_YAML), imgsz=imgsz, device=device)
    print("\n--- Validation Metrics ---")
    print(f"mAP50-95: {val_metrics.box.map:.4f}")
    print(f"mAP50:    {val_metrics.box.map50:.4f}")
    print(f"Precision:{val_metrics.box.mp:.4f}")
    print(f"Recall:   {val_metrics.box.mr:.4f}")

    return val_metrics

if __name__ == "__main__":
    train()

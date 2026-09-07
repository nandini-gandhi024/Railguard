import os
import shutil
import random
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_CANDIDATES = [
    BASE_DIR / "railway_dataset",
    BASE_DIR / "faultrailway_dataset"
]
TARGET_DIR = BASE_DIR / "railguard_dataset"

# Category to Class ID mapping
# 0: crack
# 1: surface_defect
CATEGORY_MAPPING = {
    "Cracks": 0,
    "Flakings": 1,
    "Grooves": 1,
    "Joints": 1,
    "Shellings": 1,
    "Spallings": 1,
    "Squats": 1
}

CLASS_NAMES = {
    0: "crack",
    1: "surface_defect"
}

def find_source_dataset() -> Path:
    for path in DATASET_CANDIDATES:
        if path.exists() and path.is_dir():
            return path
    raise FileNotFoundError(f"Neither railway_dataset nor faultrailway_dataset found in {BASE_DIR}")

def prepare_yolo_dataset():
    src_dir = find_source_dataset()
    print(f"[*] Found source railway dataset at: {src_dir}")
    
    # Also if railway_dataset does not exist, create a junction or directory link if possible
    alias_path = BASE_DIR / "railway_dataset"
    if not alias_path.exists():
        try:
            import subprocess
            subprocess.run(f'cmd /c mklink /J "{alias_path}" "{src_dir}"', shell=True, capture_output=True)
            print(f"[*] Created junction alias: {alias_path} -> {src_dir}")
        except Exception:
            pass

    # Destination directories
    img_train_dir = TARGET_DIR / "images" / "train"
    img_val_dir = TARGET_DIR / "images" / "val"
    lbl_train_dir = TARGET_DIR / "labels" / "train"
    lbl_val_dir = TARGET_DIR / "labels" / "val"

    for d in [img_train_dir, img_val_dir, lbl_train_dir, lbl_val_dir]:
        d.mkdir(parents=True, exist_ok=True)

    valid_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    random.seed(42)

    folder_stats = {}
    total_train = 0
    total_val = 0
    class_train_counts = {0: 0, 1: 0}
    class_val_counts = {0: 0, 1: 0}

    print("\n--- Scanning Folders & Preparing YOLO Dataset ---")
    for folder_name, class_id in CATEGORY_MAPPING.items():
        sub_folder = src_dir / folder_name
        if not sub_folder.exists():
            print(f"[!] Warning: Folder {folder_name} not found in {src_dir}")
            continue

        images = [f for f in sub_folder.iterdir() if f.is_file() and f.suffix.lower() in valid_exts]
        random.shuffle(images)
        total_imgs = len(images)
        split_idx = int(0.8 * total_imgs)

        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]

        folder_stats[folder_name] = {
            "total": total_imgs,
            "train": len(train_imgs),
            "val": len(val_imgs),
            "class_id": class_id,
            "class_name": CLASS_NAMES[class_id]
        }

        print(f"  Folder: {folder_name:<10} | Total: {total_imgs:>4} | Train (80%): {len(train_imgs):>4} | Val (20%): {len(val_imgs):>4} | Class: {CLASS_NAMES[class_id]} ({class_id})")

        # Copy train images and create label
        for img_path in train_imgs:
            unique_name = f"{folder_name.lower()}_{img_path.name}"
            dst_img = img_train_dir / unique_name
            shutil.copy2(img_path, dst_img)

            # YOLO bounding box label: class x_center y_center width height
            # Fast prototype full-image bounding box
            lbl_name = dst_img.stem + ".txt"
            dst_lbl = lbl_train_dir / lbl_name
            with open(dst_lbl, "w", encoding="utf-8") as lf:
                lf.write(f"{class_id} 0.5 0.5 1.0 1.0\n")

            total_train += 1
            class_train_counts[class_id] += 1

        # Copy val images and create label
        for img_path in val_imgs:
            unique_name = f"{folder_name.lower()}_{img_path.name}"
            dst_img = img_val_dir / unique_name
            shutil.copy2(img_path, dst_img)

            lbl_name = dst_img.stem + ".txt"
            dst_lbl = lbl_val_dir / lbl_name
            with open(dst_lbl, "w", encoding="utf-8") as lf:
                lf.write(f"{class_id} 0.5 0.5 1.0 1.0\n")

            total_val += 1
            class_val_counts[class_id] += 1

    # Create data.yaml
    yaml_content = f"""# RailGuard Railway Defect YOLO Dataset
# Prototype Full-Image Bounding Box Dataset
path: {TARGET_DIR.as_posix()}
train: images/train
val: images/val

names:
  0: crack
  1: surface_defect
"""
    yaml_path = TARGET_DIR / "data.yaml"
    with open(yaml_path, "w", encoding="utf-8") as yf:
        yf.write(yaml_content)

    print("\n--- Dataset Preparation Complete ---")
    print(f"Destination: {TARGET_DIR}")
    print(f"Total Images: {total_train + total_val}")
    print(f"Train Set: {total_train} images (Crack: {class_train_counts[0]}, Surface Defect: {class_train_counts[1]})")
    print(f"Val Set:   {total_val} images (Crack: {class_val_counts[0]}, Surface Defect: {class_val_counts[1]})")
    print(f"YAML config created at: {yaml_path}")

    # Also prepare a balanced manifest for laptop CPU prototype training
    balanced_yaml_content = f"""# RailGuard Railway Defect YOLO Dataset (Balanced Prototype for Laptop CPU)
path: {TARGET_DIR.as_posix()}
train: train_balanced.txt
val: val_balanced.txt

names:
  0: crack
  1: surface_defect
"""
    train_balanced_txt = TARGET_DIR / "train_balanced.txt"
    val_balanced_txt = TARGET_DIR / "val_balanced.txt"

    all_train_imgs = list(img_train_dir.glob("*.*"))
    crack_train = [p for p in all_train_imgs if p.name.startswith("cracks_")]
    surface_train = [p for p in all_train_imgs if not p.name.startswith("cracks_")]
    random.seed(42)
    sample_surface_train = random.sample(surface_train, min(len(surface_train), 160))

    all_val_imgs = list(img_val_dir.glob("*.*"))
    crack_val = [p for p in all_val_imgs if p.name.startswith("cracks_")]
    surface_val = [p for p in all_val_imgs if not p.name.startswith("cracks_")]
    sample_surface_val = random.sample(surface_val, min(len(surface_val), 40))

    balanced_train_list = crack_train + sample_surface_train
    balanced_val_list = crack_val + sample_surface_val
    random.shuffle(balanced_train_list)
    random.shuffle(balanced_val_list)

    with open(train_balanced_txt, "w", encoding="utf-8") as f:
        for p in balanced_train_list:
            f.write(p.as_posix() + "\n")

    with open(val_balanced_txt, "w", encoding="utf-8") as f:
        for p in balanced_val_list:
            f.write(p.as_posix() + "\n")

    balanced_yaml_path = TARGET_DIR / "data_balanced.yaml"
    with open(balanced_yaml_path, "w", encoding="utf-8") as yf:
        yf.write(balanced_yaml_content)

    print(f"Balanced Prototype YAML created at: {balanced_yaml_path} ({len(balanced_train_list)} train, {len(balanced_val_list)} val)")

if __name__ == "__main__":
    prepare_yolo_dataset()

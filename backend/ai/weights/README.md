# RailGuard AI Model Weights Directory

This directory stores trained computer vision checkpoints for railway defect detection.

## Recommended Usage

1. Copy your trained YOLO PyTorch weights (`.pt` or `.onnx`) into this directory.
2. Standard filenames supported automatically:
   - `best.pt` (Default primary checkpoint)
   - `railguard_yolo.pt`
   - `last.pt`
3. When any `.pt` file is present and `ultralytics` is installed, the `YOLODetector` in `backend/ai/yolo_detector.py` will automatically load and use it for live defect detection.
4. If no `.pt` file is found, the system operates in fallback mode without crashing.

> **Note**: `.pt` and `.onnx` binary weight files are ignored by git to keep repository size lean.

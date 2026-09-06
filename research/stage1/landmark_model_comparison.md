# Track A — Facial Landmark & Front-End Model Comparison

## Overview
Track A evaluates candidate monocular RGB facial landmark and dense mesh extraction approaches for MocapLens AI. The front-end model extracts spatial features from front-camera frames to feed downstream expression regression and head pose estimation pipelines.

---

## 1. Candidate Model Matrix

| Feature / Metric | Candidate 1: MediaPipe FaceLandmarker (468 3D Mesh) | Candidate 2: PFLD (Practical Facial Landmark Detector) | Candidate 3: MobileFaceNet 68 Keypoint Network | Candidate 4: dlib 68-Point HOG/Ensemble Trees |
|---|---|---|---|---|
| **Output Representation** | 468 3D Landmarks + 52 Blendshapes `[PAPER-REPORTED]` | 98 2D Landmarks + 3-DoF Pose `[PAPER-REPORTED]` | 68 3D Landmarks `[PAPER-REPORTED]` | 68 2D Landmarks `[PAPER-REPORTED]` |
| **Input Resolution** | $192 \times 192$ / $256 \times 256$ RGB | $112 \times 112$ RGB | $112 \times 112$ RGB | Variable Full Image |
| **Model Size** | $\sim 12.4 \text{ MB}$ | $\sim 2.1 \text{ MB}$ | $\sim 4.5 \text{ MB}$ | $\sim 99.7 \text{ MB}$ |
| **FLOPs / Complexity** | $\sim 0.6 \text{ GFLOPs}$ | $\sim 0.04 \text{ GFLOPs}$ | $\sim 0.12 \text{ GFLOPs}$ | CPU Classical ML |
| **Paper-Reported NME Accuracy** | 2.3% (Inter-Ocular) `[PAPER-REPORTED]` | 3.8% `[PAPER-REPORTED]` | 3.1% `[PAPER-REPORTED]` | 4.9% `[PAPER-REPORTED]` |
| **Paper-Reported FPS (Mobile)** | $100-200 \text{ FPS}$ (Mobile GPU) `[PAPER-REPORTED]` | $200+ \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` | $150+ \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` | $15-30 \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` |
| **Head Rotation Robustness** | High ($\pm 60^\circ$ Yaw) `[PAPER-REPORTED]` | Moderate ($\pm 45^\circ$ Yaw) `[PAPER-REPORTED]` | Moderate ($\pm 45^\circ$ Yaw) `[PAPER-REPORTED]` | Low ($<30^\circ$ Yaw) `[PAPER-REPORTED]` |
| **Android Deployment Feasibility** | Excellent (Native LiteRT / TFLite) `[DESIGN PROPOSAL]` | Good (Requires ONNX / TFLite export) | Good (Requires TFLite export) | Poor (Native C++ wrapper) |
| **Licensing** | Apache 2.0 (Open Source) | MIT License | MIT License | Boost Software License |

---

## 2. Technical Evaluation & Tradeoff Analysis

### Candidate 1: MediaPipe FaceLandmarker (468 3D Mesh)
- **Strengths**: Dense 3D surface topology provides high spatial granularity across lips, eyes, and brows; native LiteRT NPU/GPU delegate execution on Android.
- **Weaknesses**: $12.4\text{ MB}$ memory size.
- **Engineering Assessment**: Primary landmark candidate for MocapLens AI `[DESIGN PROPOSAL]`.

---

## 3. Track A Recommendation
**Recommended Candidate**: MediaPipe FaceLandmarker (468 3D Mesh) `[DESIGN PROPOSAL]`.

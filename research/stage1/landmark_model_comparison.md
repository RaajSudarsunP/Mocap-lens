# Track A — Facial Landmark & Front-End Model Comparison

## Overview
Track A evaluates candidate monocular RGB facial landmark and dense mesh extraction approaches for MocapLens AI. The front-end model must extract reliable spatial features from front-camera frames to feed downstream expression regression and head pose estimation pipelines.

---

## 1. Candidate Model Matrix

| Feature / Metric | Candidate 1: MediaPipe FaceLandmarker (468/478 3D Mesh) | Candidate 2: PFLD (Practical Facial Landmark Detector) | Candidate 3: MobileFaceNet 68 2D/3D Keypoint Network | Candidate 4: dlib 68-Point HOG/Ensemble Trees |
|---|---|---|---|---|
| **Output Representation** | 468 3D Landmarks + 52 Blendshapes `[PAPER-REPORTED]` | 98 2D Landmarks + 3-DoF Pose `[PAPER-REPORTED]` | 68 3D Landmarks `[PAPER-REPORTED]` | 68 2D Landmarks `[PAPER-REPORTED]` |
| **Input Resolution** | $192 \times 192$ / $256 \times 256$ RGB | $112 \times 112$ RGB | $112 \times 112$ RGB | Variable Full Image |
| **Model Size** | $\sim 12.4 \text{ MB}$ | $\sim 2.1 \text{ MB}$ | $\sim 4.5 \text{ MB}$ | $\sim 99.7 \text{ MB}$ |
| **FLOPs / Complexity** | $\sim 0.6 \text{ GFLOPs}$ | $\sim 0.04 \text{ GFLOPs}$ | $\sim 0.12 \text{ GFLOPs}$ | CPU Classical Machine Learning |
| **Paper-Reported NME Accuracy** | 2.3% (Inter-Ocular) `[PAPER-REPORTED]` | 3.8% `[PAPER-REPORTED]` | 3.1% `[PAPER-REPORTED]` | 4.9% `[PAPER-REPORTED]` |
| **Paper-Reported FPS (Mobile)** | $100-200 \text{ FPS}$ (Mobile GPU) `[PAPER-REPORTED]` | $200+ \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` | $150+ \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` | $15-30 \text{ FPS}$ (Mobile CPU) `[PAPER-REPORTED]` |
| **Head Rotation Robustness** | High ($\pm 60^\circ$ Yaw) `[PAPER-REPORTED]` | Moderate ($\pm 45^\circ$ Yaw) `[PAPER-REPORTED]` | Moderate ($\pm 45^\circ$ Yaw) `[PAPER-REPORTED]` | Low ($<30^\circ$ Yaw) `[PAPER-REPORTED]` |
| **Lighting Robustness** | High (Multi-condition pre-training) | Moderate | Moderate | Poor (Fails in shadow) |
| **Android Deployment Feasibility** | Excellent (Native LiteRT / TFLite Delegate) `[DESIGN PROPOSAL]` | Good (Requires ONNX / TFLite export) | Good (Requires TFLite export) | Poor (Native C++ dlib wrapper required) |
| **Licensing** | Apache 2.0 (Open Source) | MIT License | MIT License | Boost Software License |

---

## 2. Technical Evaluation & Tradeoff Analysis

### Candidate 1: MediaPipe FaceLandmarker (468/478 3D Mesh)
- **Strengths**: Dense 3D surface topology provides high spatial granularity across lips, eyes, and brows; integrated 52 blendshape output capability; native LiteRT NPU/GPU delegate execution on Android.
- **Weaknesses**: Slightly higher memory footprint ($12.4\text{ MB}$) compared to 68-point sparse detectors.
- **Engineering Assessment**: Primary candidate for MocapLens AI. Provides both 3D spatial points for PnP pose and direct expression features.

### Candidate 2: PFLD (Practical Facial Landmark Detector)
- **Strengths**: Ultra-lightweight ($2.1\text{ MB}$, $0.04\text{ GFLOPs}$); extremely fast CPU execution.
- **Weaknesses**: Outputs only 98 2D points; lacks 3D depth $Z$-coordinates required for metric head pose solving; requires training a separate downstream blendshape regressor.
- **Engineering Assessment**: Viable fallback if NPU/GPU hardware acceleration is unavailable.

### Candidate 3: MobileFaceNet 68 3D Keypoint Network
- **Strengths**: Low complexity ($0.12\text{ GFLOPs}$); robust 68-point 3D representation.
- **Weaknesses**: 68 points lack sufficient vertex density around lips and cheeks to capture fine micro-expressions (e.g., lip stretch, cheek squint).
- **Engineering Assessment**: Rejected due to insufficient expression resolution.

### Candidate 4: dlib 68-Point HOG/Ensemble Trees
- **Strengths**: Classic benchmark reference model.
- **Weaknesses**: High memory size ($99.7\text{ MB}$); slow CPU inference; poor lighting and rotation tolerance.
- **Engineering Assessment**: Fully rejected.

---

## 3. Track A Recommendation
**Recommended Candidate**: MediaPipe FaceLandmarker (468 3D Mesh) `[DESIGN PROPOSAL]`.
- Highest spatial density and tracking stability among mobile-ready models.
- Native Android LiteRT hardware delegate support simplifies NPU/GPU integration.

# Track A — Facial Landmark & Front-End Model Comparison

## Overview
Track A evaluates candidate monocular RGB facial landmark and dense mesh extraction approaches for MocapLens AI. The front-end model extracts spatial features from front-camera frames to feed downstream expression regression and head pose estimation pipelines.

---

## 1. Candidate Model Matrix (Audited Capabilities)

| Feature / Metric | Candidate 1: MediaPipe FaceLandmarker (468 3D Mesh) | Candidate 2: PFLD (Practical Facial Landmark Detector) | Candidate 3: MobileFaceNet 68 Keypoint Network | Candidate 4: dlib 68-Point HOG/Ensemble Trees |
|---|---|---|---|---|
| **Output Representation** | 468 3D Landmarks + 52 Blendshape Scores + 6-DoF Matrix `[OFFICIAL DOCS]` | 98 2D Landmarks + 3-DoF Pose `[PAPER-REPORTED]` | 68 3D Landmarks `[PAPER-REPORTED]` | 68 2D Landmarks `[PAPER-REPORTED]` |
| **Input Resolution** | $192 \times 192$ / $256 \times 256$ RGB Crop | $112 \times 112$ RGB Crop | $112 \times 112$ RGB Crop | Variable Full Image |
| **Official Execution Modes** | Live Stream (`RUNNING_MODE_LIVE_STREAM`), Video, Image `[OFFICIAL DOCS]` | Single-frame forward pass | Single-frame forward pass | CPU frame scan |
| **Hardware Acceleration** | LiteRT GPU / NPU Delegate Support `[OFFICIAL DOCS]` | ONNX / TFLite export | TFLite export | Native C++ CPU |
| **Android Integration** | Native Android SDK (`com.google.mediapipe:tasks-vision`) `[OFFICIAL DOCS]` | Custom JNI / ONNX runtime | Custom JNI / TFLite runtime | Custom JNI wrapper |
| **Licensing** | Apache 2.0 (Open Source) | MIT License | MIT License | Boost Software License |
| **Performance Status** | **Candidate Target (E01/E02 Validation Required)** | Candidate Target | Candidate Target | Rejected |

---

## 2. Technical Evaluation & Tradeoff Analysis

### Candidate 1: MediaPipe FaceLandmarker (468 3D Mesh)
- **Official Features (Google Tasks Vision SDK)**: Provides 468 3D landmark metric coordinates, 52 ARKit-compatible blendshape scores, 6-DoF facial transformation matrix, and native non-blocking live-stream execution mode (`RUNNING_MODE_LIVE_STREAM`).
- **Acceleration**: Qualcomm NPU / AI Engine Direct is the preferred acceleration target; actual delegate availability, operator compatibility, and latency require E02 validation on the selected iQOO device.
- **Engineering Assessment**: Primary landmark candidate for MocapLens AI `[DESIGN PROPOSAL]`.

---

## 3. Track A Recommendation
**Recommended Candidate**: MediaPipe FaceLandmarker (468 3D Mesh) `[DESIGN PROPOSAL]`.
- Designated as front-end landmark candidate; actual FPS and execution latency require E01/E02 empirical validation.

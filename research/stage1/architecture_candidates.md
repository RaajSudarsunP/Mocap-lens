# Complete Pipeline Architecture Comparison

## Overview
This document evaluates candidate end-to-end system architectures for MocapLens AI, comparing full data-flow pipelines from front camera frame acquisition to laptop 3D avatar rendering.

---

## 1. Candidate Architecture Descriptions

### Architecture A (Pure Deterministic Pipeline)
```text
RGB Camera
  ↓
Dense Landmarks (468 3D Points)
  ↓
Deterministic Geometric Distance Ratios
  ↓
Raw Expression Coefficients
  ↓
One Euro Filter
  ↓
EPnP Head Pose (Quaternion)
  ↓
3D Avatar Morph Targets
```
- **Strengths**: Zero neural model training required; extremely fast.
- **Weaknesses**: Cannot capture complex non-linear facial expressions (e.g. cheek puff, lip stretch).

---

### Architecture B (Landmark-Neural Regressor Pipeline)
```text
RGB Camera
  ↓
Dense Landmarks (468 3D Points)
  ↓
Lightweight Landmark-to-Blendshape MLP Regressor
  ↓
52 ARKit Blendshapes
  ↓
One Euro Filter
  ↓
EPnP Head Pose (Quaternion)
  ↓
3D Avatar Morph Targets
```
- **Strengths**: Captures complex non-linear facial muscle expressions; fast MLP execution ($<0.5\text{ ms}$).
- **Weaknesses**: Requires normalized 3D landmark preprocessing.

---

### Architecture C (Direct Image-to-Expression Pipeline)
```text
RGB Camera
  ↓
Direct CNN/ViT Expression Model
  ↓
52 ARKit Blendshapes + Head Rotation
  ↓
One Euro Filter
  ↓
3D Avatar Morph Targets
```
- **Strengths**: Single unified neural network.
- **Weaknesses**: Heavy compute footprint ($>15\text{ ms}$ on mobile); sensitive to lighting and skin tone; lacks explicit 3D mesh features for debugging.

---

### Architecture D (Hybrid Geometry + Neural Regressor Pipeline) — RECOMMENDED
```text
RGB Camera (CameraX 60 FPS Stream)
  ↓
Dense 3D Mesh & Blendshape Regressor (MediaPipe / LiteRT NPU Delegate)
  ↓
Neutral Pose Baseline Calibration & Deadband Noise Clamping
  ↓
Channel-Specific One Euro Adaptive Filter
  ↓
Rigid Keypoint EPnP 6-DoF Head Pose Solver (Quaternion)
  ↓
Binary Array Packet Serialization (59 Float32 Array)
  ↓
Office Kit Local Socket Bridge Transport
  ↓
Three.js WebGL 3D Avatar Retargeting & Render
```
- **Strengths**: Highest expression fidelity; robust 6-DoF head pose decoupling; zero-copy camera memory pipeline; low latency; zero internet dependency.
- **Weaknesses**: Requires one-time neutral calibration routine.

---

## 2. Architecture Comparison Matrix

| Architectural Criteria | Architecture A | Architecture B | Architecture C | Architecture D (Recommended) |
|---|---|---|---|---|
| **Expression Fidelity** | Moderate | High | High | **Highest** |
| **Temporal Stability** | Moderate | High | Low | **Highest** |
| **Estimated Pipeline Latency** | $\sim 10.0\text{ ms}$ `[TARGET]` | $\sim 11.0\text{ ms}$ `[TARGET]` | $\sim 24.0\text{ ms}$ `[TARGET]` | **$\sim 12.0\text{ ms}$ `[TARGET]`** |
| **FPS Capability** | Target 60 FPS | Target 60 FPS | 30 FPS max | **Target 60 FPS** |
| **Mobile Compute Feasibility** | Excellent | Excellent | Poor | **Excellent** |
| **Lighting & Pose Robustness** | Moderate | High | Moderate | **Highest** |
| **30-Hour Hackathon Feasibility** | High | High | Low | **Highest** |

---

## 3. Recommended Architecture Selection
**Architecture D** is selected as the optimal end-to-end design for MocapLens AI `[DESIGN PROPOSAL]`.

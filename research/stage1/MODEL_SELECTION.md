# Stage 1 — Model Selection & Weighted Decision Matrix

## Overview
This document applies the transparent 8-criterion weighted scoring framework to rank candidate facial tracking models and pipeline combinations for MocapLens AI.

---

## 1. Weighted Scoring Framework Specification

| Criterion | Weight | Evaluation Focus |
|---|---|---|
| **Facial Motion Accuracy** | 25% | Expression fidelity across micro-expressions (blinks, smiles, brows). |
| **Temporal Stability** | 15% | Freedom from static jitter and micro-shaking. |
| **Latency** | 15% | End-to-end processing delay ($<16.67\text{ ms}$ target). |
| **FPS Potential** | 15% | Ability to sustain target 60 FPS output on mobile edge. |
| **Mobile Compute Feasibility** | 10% | Low FLOPs, small weight memory size, low battery/thermal impact. |
| **Lighting / Head-Pose Robustness** | 10% | Stability under shadows and head yaw/pitch rotations ($\pm 60^\circ$). |
| **Android Deployment Feasibility** | 5% | Native LiteRT/TFLite/ONNX delegate compatibility without custom JNI wrappers. |
| **Open-Source / Licensing** | 5% | Permissive open-source license (Apache 2.0 / MIT / BSD). |

*Scoring Scale*: 1 (Poor / Unusable) to 10 (Outstanding). Unknown metrics are scored **UNKNOWN (0)**.

---

## 2. Model Candidate Scoring Matrix

### Candidate M1: MediaPipe FaceLandmarker (468 3D Mesh + 52 Blendshapes)
- **Facial Motion Accuracy (25%)**: 9.0/10 (High fidelity across 52 ARKit blendshapes) $\implies 2.25$
- **Temporal Stability (15%)**: 8.5/10 (High mesh tracking consistency) $\implies 1.275$
- **Latency (15%)**: 9.0/10 ($100-200\text{ FPS}$ paper-reported capability $\implies \sim 5-8\text{ ms}$ target) $\implies 1.35$
- **FPS Potential (15%)**: 9.5/10 (Target 60 FPS fully viable on mobile GPU/NPU) $\implies 1.425$
- **Mobile Compute Feasibility (10%)**: 9.0/10 ($12.4\text{ MB}$, $0.6\text{ GFLOPs}$) $\implies 0.90$
- **Lighting / Head-Pose Robustness (10%)**: 8.5/10 (Pre-trained on diverse datasets) $\implies 0.85$
- **Android Deployment Feasibility (5%)**: 10.0/10 (Native Google Android SDK) $\implies 0.50$
- **Open-Source / Licensing (5%)**: 10.0/10 (Apache 2.0) $\implies 0.50$
- **TOTAL WEIGHTED SCORE**: **9.05 / 10.0** `[DESIGN PROPOSAL]`

---

### Candidate M2: PFLD Landmark Detector + Custom MLP Blendshape Regressor
- **Facial Motion Accuracy (25%)**: 7.5/10 (98 2D landmarks limit fine lip details) $\implies 1.875$
- **Temporal Stability (15%)**: 7.5/10 (2D landmarks exhibit slight depth noise) $\implies 1.125$
- **Latency (15%)**: 9.5/10 (Ultra-fast $2-4\text{ ms}$ execution) $\implies 1.425$
- **FPS Potential (15%)**: 9.5/10 ($200+\text{ FPS}$ potential) $\implies 1.425$
- **Mobile Compute Feasibility (10%)**: 9.5/10 ($2.1\text{ MB}$, $0.04\text{ GFLOPs}$) $\implies 0.95$
- **Lighting / Head-Pose Robustness (10%)**: 7.0/10 (Degrades at $>45^\circ$ yaw) $\implies 0.70$
- **Android Deployment Feasibility (5%)**: 8.0/10 (Requires manual TFLite export) $\implies 0.40$
- **Open-Source / Licensing (5%)**: 10.0/10 (MIT License) $\implies 0.50$
- **TOTAL WEIGHTED SCORE**: **8.42 / 10.0**

---

### Candidate M3: Direct Image-to-Blendshape ResNet-50 Regressor
- **Facial Motion Accuracy (25%)**: 8.5/10 (Direct texture feature extraction) $\implies 2.125$
- **Temporal Stability (15%)**: 6.0/10 (High frame-to-frame pixel noise variation) $\implies 0.90$
- **Latency (15%)**: 4.0/10 ($18-25\text{ ms}$ on mobile GPU) $\implies 0.60$
- **FPS Potential (15%)**: 4.0/10 (Cannot sustain 60 FPS on mobile edge) $\implies 0.60$
- **Mobile Compute Feasibility (10%)**: 4.0/10 ($98\text{ MB}$, $8.2\text{ GFLOPs}$) $\implies 0.40$
- **Lighting / Head-Pose Robustness (10%)**: 6.5/10 (Sensitive to direct lighting changes) $\implies 0.65$
- **Android Deployment Feasibility (5%)**: 7.0/10 (Large ONNX asset size) $\implies 0.35$
- **Open-Source / Licensing (5%)**: 10.0/10 (MIT License) $\implies 0.50$
- **TOTAL WEIGHTED SCORE**: **6.125 / 10.0**

---

### Candidate M4: dlib HOG 68-Point + Deterministic Geometric Mapping
- **Facial Motion Accuracy (25%)**: 5.0/10 (68 points lack morph granularity) $\implies 1.25$
- **Temporal Stability (15%)**: 5.0/10 (High static jitter) $\implies 0.75$
- **Latency (15%)**: 4.0/10 (Slow CPU execution $\sim 30\text{ ms}$) $\implies 0.60$
- **FPS Potential (15%)**: 3.0/10 (15-30 FPS max) $\implies 0.45$
- **Mobile Compute Feasibility (10%)**: 3.0/10 ($99.7\text{ MB}$) $\implies 0.30$
- **Lighting / Head-Pose Robustness (10%)**: 4.0/10 (Fails in dark scenes and rotation) $\implies 0.40$
- **Android Deployment Feasibility (5%)**: 3.0/10 (Requires heavy native C++ build) $\implies 0.15$
- **Open-Source / Licensing (5%)**: 8.0/10 (Boost License) $\implies 0.40$
- **TOTAL WEIGHTED SCORE**: **4.30 / 10.0**

---

## 3. Final Model Ranking & Selection

1. **Rank 1**: **Candidate M1 (MediaPipe FaceLandmarker 468 3D Mesh + 52 Blendshapes)** — **Score: 9.05 / 10.0** `[SELECTED]`
2. **Rank 2**: **Candidate M2 (PFLD + Custom MLP Regressor)** — **Score: 8.42 / 10.0** `[BACKUP CANDIDATE]`
3. **Rank 3**: **Candidate M3 (Direct Image ResNet-50)** — **Score: 6.125 / 10.0** `[REJECTED]`
4. **Rank 4**: **Candidate M4 (dlib 68-Point)** — **Score: 4.30 / 10.0** `[REJECTED]`

# Stage 1 — Architecture Selection Matrix & Design Scoring

## Overview
This document applies an engineering design-selection framework to rank candidate facial tracking models and avatar generation architectures for MocapLens AI.

**Important Methodology Note**: Scores presented in this matrix are **Architecture Selection Scores** reflecting theoretical suitability, model parameters, and published paper features. They do NOT represent measured prototype performance. All performance metrics remain targets to be validated in Stage 2.

---

## 1. Track G Avatar Generation Architecture Ranking

| Avatar Candidate | Personalization Type | Setup / Gen Time | 30-Hour Hackathon Feasibility | WebGL Performance | Architecture Selection Score (out of 10.0) | Status |
|---|---|---|---|---|---|---|
| **Candidate A3: Template Avatar + Geometry Deformation** | Personalized Semi-Realistic Proportions | $<0.5\text{s}$ Target | **Highest** | **60 FPS Target (Native GLTF)** | **9.0 / 10.0** | **PROVISIONALLY SELECTED** `[DESIGN PROPOSAL]` |
| Candidate A1: Parametric / Procedural Avatar | Facial Proportions | $<1.0\text{s}$ Target | High | 60 FPS Target | 8.5 / 10.0 | Backup Candidate |
| Candidate A2: 3DMM (FLAME / BFM) Reconstruction | 3D Mesh Contour | $2.0 - 5.0\text{s}$ `[PAPER]` | Moderate | Moderate (Dynamic Vertices) | 7.5 / 10.0 | Rejected |
| Candidate A4: Deep AI Generation (DECA / EG3D) | Photo Identity Texture | $10 - 30\text{s}$ `[PAPER]` | Poor (Requires Cloud GPU) | Low | 5.0 / 10.0 | Rejected |

---

## 2. Motion Tracking Model Candidate Ranking (Tracks A–F)

### Candidate M1: MediaPipe FaceLandmarker + Option B 109.9K Res-MLP Regressor `[DESIGN PROPOSAL]`
- **Facial Motion Accuracy (25%)**: Score **8.5/10** | Evidence: Kartynnik et al. (2019/2023) | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Temporal Stability (15%)**: Score **8.0/10** | Evidence: 3D mesh surface continuity | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Latency (15%)**: Score **8.5/10** (Target $<8\text{ ms}$ `[TARGET]`) | Evidence: Literature | Type: `[INFERRED]` | Confidence: Medium.
- **FPS Potential (15%)**: Score **8.5/10** (Target 60 FPS candidate) | Evidence: FLOPs count ($0.6\text{ GFLOPs}$) | Type: `[INFERRED]` | Confidence: Medium.
- **Mobile Compute Feasibility (10%)**: Score **9.0/10** ($109.9\text{K}$ params, $0.22\text{ MFLOPs}$) | Evidence: Architecture params | Type: `[FACT]` | Confidence: High.
- **Lighting / Head-Pose Robustness (10%)**: Score **8.0/10** (Pre-trained multi-condition dataset) | Evidence: Kartynnik et al. | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Android Deployment Feasibility (5%)**: Score **10.0/10** (Native Google Android SDK) | Evidence: AOSP / Tasks Vision SDK | Type: `[FACT]` | Confidence: High.
- **Open-Source / Licensing (5%)**: Score **10.0/10** (Apache 2.0) | Evidence: License header | Type: `[FACT]` | Confidence: High.
- **ARCHITECTURE SELECTION SCORE**: **8.5 / 10.0** `[DESIGN PROPOSAL]`

---

### Candidate M4: AtG-ContextNet Temporal Attention (Springer 2026)
- **Facial Motion Accuracy (25%)**: Score **9.0/10** (**Requires domain-specific fine-tuning `[PAPER-REPORTED]`**) | Evidence: Chen et al. (2026) | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Temporal Stability (15%)**: Score **8.5/10** (Temporal attention window) | Evidence: Chen et al. | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Latency (15%)**: Score **3.0/10** ($200\text{ ms}$ sliding window buffer lag) | Evidence: 12-frame sequence window | Type: `[FACT]` | Confidence: High.
- **FPS Potential (15%)**: Score **5.0/10** | Evidence: Model params | Type: `[INFERRED]` | Confidence: Medium.
- **Mobile Compute Feasibility (10%)**: Score **5.0/10** | Evidence: Architecture params | Type: `[FACT]` | Confidence: High.
- **Lighting / Head-Pose Robustness (10%)**: Score **7.5/10** (Multi-frame context) | Evidence: Chen et al. | Type: `[PAPER-REPORTED]` | Confidence: High.
- **Android Deployment Feasibility (5%)**: Score **5.0/10** (Requires custom GRU/Attention export) | Evidence: Integration analysis | Type: `[DESIGN PROPOSAL]` | Confidence: Medium.
- **Open-Source / Licensing (5%)**: Score **8.0/10** (Academic License) | Evidence: Paper details | Type: `[PAPER-REPORTED]` | Confidence: High.
- **ARCHITECTURE SELECTION SCORE**: **6.4 / 10.0** (Rejected due to $200\text{ ms}$ buffer lag and fine-tuning requirement)

---

## 3. Final Combined Architecture Specification

1. **Avatar Personalization Module**: Candidate A3 (Template Avatar + Facial Geometry Deformation). Deforms base semi-realistic GLTF avatar proportions (eye scale, jaw width, cheekbone placement, nose bridge) to match user 3D face mesh metrics `[DESIGN PROPOSAL]`.
2. **Motion Extraction Module**: MediaPipe 468 3D Mesh + Option B Mathematically Verified Res-MLP Regressor (`109.9K` parameters, `0.22` MFLOPs) `[DESIGN PROPOSAL]`.
3. **Post-Processing & Pose Solver**: Neutral Baseline Subtraction + One Euro Adaptive Filter ($1\text{\euro Filter}$) + EPnP Rigid Keypoint Head Pose Solver (`[DESIGN PROPOSAL]`).
4. **Transport**: 260-Byte Proposed Application Payload / 288-Byte UDP Example (`[PROPOSED PROTOCOL SPECIFICATION]`).
5. **Render Engine**: Three.js WebGL rendering personalized GLTF avatar mesh driven by 52 morph target influences and bone rotation quaternions `[DESIGN PROPOSAL]`.

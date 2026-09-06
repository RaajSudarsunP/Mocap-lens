# Stage 1 — Model & Avatar Pipeline Selection (Audited Decision Matrix)

## Overview
This document applies an audited weighted scoring framework to select both the **Personalized Semi-Realistic Avatar Generation Architecture** (Track G) and the **Real-Time Facial Motion Tracking Pipeline** (Tracks A–F) for MocapLens AI.

---

## 1. Track G Avatar Generation Architecture Ranking

| Avatar Generation Architecture Candidate | Personalization Quality | Setup / Gen Time | 30-Hour Hackathon Feasibility | WebGL Performance | Audited Score (out of 10.0) | Status |
|---|---|---|---|---|---|---|
| **Candidate A3: Template Avatar + Geometry Deformation** | High (Semi-Realistic) | $<0.5\text{s}$ (Instant) | **Highest** | **60 FPS Native GLTF** | **9.25 / 10.0** | **SELECTED** `[DESIGN PROPOSAL]` |
| Candidate A1: Parametric / Procedural Avatar | Moderate-High | $<1.0\text{s}$ | High | 60 FPS | 8.50 / 10.0 | Backup Candidate |
| Candidate A2: 3DMM (FLAME / BFM) Reconstruction | High | $2.0 - 5.0\text{s}$ | Moderate | Moderate (Dynamic Vertices) | 7.40 / 10.0 | Rejected |
| Candidate A4: Deep AI Generation (DECA / EG3D) | Very High (Photorealistic) | $10 - 30\text{s}$ | Poor (Requires Cloud GPU) | Low | 5.10 / 10.0 | Rejected |

---

## 2. Motion Tracking Model Candidate Ranking (Tracks A–F)

| Model Candidate | Audited Weighted Score (out of 10.0) | Evidence Quality | Status |
|---|---|---|---|
| **MediaPipe FaceLandmarker (468 3D Mesh + Option B Res-MLP Regressor)** | **8.50 / 10.0** | High (`[PAPER-REPORTED]` / `[FACT]`) | **SELECTED (Rank 1)** `[DESIGN PROPOSAL]` |
| PFLD 98-Point + Option B Res-MLP Regressor | 7.925 / 10.0 | High (`[PAPER-REPORTED]` / `[INFERRED]`) | Backup Candidate (Rank 2) |
| AtG-ContextNet Temporal Attention (Springer 2026) | 6.375 / 10.0 | High (`[PAPER-REPORTED]`) | Rejected (Rank 3 - $83\text{ ms}$ Buffer Lag) |
| Direct Image ResNet-50 Regressor | 5.80 / 10.0 | Medium (`[PAPER-REPORTED]` / `[INFERRED]`) | Rejected (Rank 4 - Heavy Compute) |

---

## 3. Final Combined Architecture Specification

1. **Avatar Personalization Module**: Candidate A3 (Template Avatar + Facial Geometry Deformation). Deforms base semi-realistic GLTF avatar proportions (eye scale, jaw width, cheekbone placement, nose bridge) to match user 3D face mesh metrics `[DESIGN PROPOSAL]`.
2. **Motion Extraction Module**: MediaPipe 468 3D Mesh + Option B Res-MLP Blendshape Regressor (`120K` parameters) `[DESIGN PROPOSAL]`.
3. **Post-Processing & Pose Solver**: Neutral Baseline Subtraction + One Euro Adaptive Filter ($1\text{\euro Filter}$) + EPnP Rigid Keypoint Head Pose Solver (`[DESIGN PROPOSAL]`).
4. **Transport**: 260-Byte Binary Application Payload / 288-Byte Transmitted UDP Packet (`[AUTHORITATIVE SPEC]`).
5. **Render Engine**: Three.js WebGL rendering personalized GLTF avatar mesh driven by 52 morph target influences and bone rotation quaternions `[DESIGN PROPOSAL]`.

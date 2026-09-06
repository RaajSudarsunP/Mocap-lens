# Complete Pipeline Architecture Comparison (Updated with Personalized Avatars)

## Overview
This document evaluates candidate end-to-end system architectures for MocapLens AI, incorporating both personalized semi-realistic 3D avatar generation and real-time facial motion retargeting.

---

## 1. Disentangled Data-Flow Pipeline Architecture

```text
                                RGB CAMERA (CameraX 60 FPS Stream)
                                                │
                                                ▼
                              468-POINT 3D DENSE LANDMARK MESH
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        IDENTITY / PERSONALIZATION PIPELINE                MOTION / EXPRESSION PIPELINE
       • Extract facial feature ratios                    • Option B Res-MLP Blendshape Regressor
         (IPD, jaw width, nose/eye scale)                 • Neutral Baseline Calibration Subtraction
       • Candidate A3: Deform Template GLTF Mesh          • Channel-Specific One Euro Adaptive Filter
         (Skeleton bone scales & proportion offsets)      • Rigid Keypoint EPnP 6-DoF Head Pose Solver
                       │                                                 │
                       │ Personalized 3D Avatar Rig                      │ 260-Byte Binary Stream
                       └────────────────────────┬────────────────────────┘
                                                ▼
                              OFFICE KIT LOCAL SOCKET BRIDGE
                                                │
                                                ▼
                         THREE.JS / WEBGL PERSONALIZED 3D AVATAR RENDER
```

---

## 2. Candidate Architecture Comparisons

### Architecture Candidate 1: Generic Avatar + Deterministic Motion
- Avatar Generation: Static generic GLTF avatar (No personalization).
- Motion Pipeline: Deterministic landmark ratio calculations.
- Pros: Simple. Cons: No personalized avatar, low expression quality.

---

### Architecture Candidate 2: Deep AI Avatar Generation + Image Regression (A4 + Arch C)
- Avatar Generation: Candidate A4 Deep NeRF/DECA Photo-to-3D.
- Motion Pipeline: Direct Image ResNet-50 Regressor.
- Pros: Photorealistic offline rendering potential `[PAPER-REPORTED]`.
- Cons: Heavy compute footprint ($>18\text{ ms}$ motion lag, $>10\text{ sec}$ avatar generation), requires cloud GPUs, unviable for Airplane Mode live demo.

---

### Architecture Candidate 3: Personalized Template Avatar + Hybrid Motion Pipeline (A3 + Arch D) — RECOMMENDED
- Avatar Generation: Candidate A3 (Template Avatar + Facial Geometry Deformation). Deforms base semi-realistic GLTF avatar proportions to match user inter-pupillary distance, cheek width, jaw contour, and nose scale.
- Motion Pipeline: Option B Lightweight Res-MLP Regressor + One Euro Adaptive Filter + EPnP Head Pose.
- Transport: 260-Byte Binary Packet over Office Kit Local Socket Bridge.
- Render: Three.js WebGL rendering with real-time morph target influences and bone rotations.
- Pros: **High personalization quality + zero-latency generation + sustained 60 FPS animation + 100% offline Airplane Mode reliability + 30-hour hackathon feasibility.**

---

## 3. Evaluation & Recommendation Summary

| Pipeline Component | Selection | Justification |
|---|---|---|
| **Avatar Personalization** | Candidate A3 (Template + Geometry Deformation) `[DESIGN PROPOSAL]` | Instant generation ($<0.5\text{s}$), preserves pre-bound 52 morph target rigs, 100% offline. |
| **Landmark Front End** | MediaPipe FaceLandmarker (468 3D Mesh) `[DESIGN PROPOSAL]` | Dense 3D surface topology, native LiteRT Android SDK support. |
| **Expression Regressor** | Option B Res-MLP Regressor (`120K` params) `[DESIGN PROPOSAL]` | Zero sliding-window lag, lightweight, high expression fidelity. |
| **Temporal Processing** | One Euro Adaptive Filter ($1\text{\euro Filter}$) `[DESIGN PROPOSAL]` | Dynamic cutoff frequency eliminates static jitter without phase lag (*E03 validation required*). |
| **Head Pose Solver** | Rigid Keypoint EPnP Solver `[DESIGN PROPOSAL]` | Decouples 6-DoF rotation/translation quaternions from non-rigid muscle expressions. |
| **Network Transport** | 260-Byte Binary Payload / 288-Byte UDP Packet `[AUTHORITATIVE SPEC]` | Consumes $<18\text{ KB/s}$ bandwidth at 60 Hz; zero video compression lag. |

**Selected Architecture**: **Architecture Candidate 3 (Candidate A3 Personalized Avatar + Candidate Architecture D Motion Pipeline)** `[DESIGN PROPOSAL]`.

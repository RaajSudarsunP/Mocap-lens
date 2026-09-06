# Complete Pipeline Architecture Comparison (Updated with Audited Metrics)

## Overview
This document evaluates candidate end-to-end system architectures for MocapLens AI, incorporating both personalized semi-realistic 3D avatar generation and real-time facial motion retargeting.

---

## 1. Disentangled Data-Flow Pipeline Architecture

```text
                                RGB CAMERA (CameraX Stream Target 60 FPS)
                                                │
                                                ▼
                              468-POINT 3D DENSE LANDMARK MESH
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        IDENTITY / PERSONALIZATION PIPELINE                MOTION / EXPRESSION PIPELINE
       • Extract facial feature ratios                    • Option B 109.9K Res-MLP Regressor
         (IPD, jaw width, nose/eye scale)                 • Neutral Baseline Calibration Subtraction
       • Candidate A3: Deform Template GLTF Mesh          • Channel-Specific One Euro Adaptive Filter (E03)
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

| Pipeline Component | Selection | Justification |
|---|---|---|
| **Avatar Personalization** | Candidate A3 (Template Avatar + Geometry Deformation) `[DESIGN PROPOSAL]` | Instant generation ($<0.5\text{s}$ target), produces personalized semi-realistic facial proportions, preserves 52 morph target rigs, 100% offline. |
| **Landmark Front End** | MediaPipe FaceLandmarker (468 3D Mesh) `[DESIGN PROPOSAL]` | Dense 3D surface topology, native LiteRT Android SDK support. |
| **Expression Regressor** | Option B Res-MLP Regressor (`109.9K` params, `0.22` MFLOPs) `[DESIGN PROPOSAL]` | Zero sliding-window lag, mathematically verified lightweight parameter size. |
| **Temporal Processing** | One Euro Adaptive Filter ($1\text{\euro Filter}$) `[DESIGN PROPOSAL]` | Dynamic cutoff frequency candidate (*E03 validation required*). |
| **Head Pose Solver** | Rigid Keypoint EPnP Solver `[DESIGN PROPOSAL]` | Decouples 6-DoF rotation/translation quaternions from non-rigid muscle expressions. |
| **Network Transport** | 260-Byte Application Payload / 288-Byte Transmitted UDP Packet `[AUTHORITATIVE SPEC]` | Consumes $<18\text{ KB/s}$ bandwidth at target 60 Hz. |

**Selected Architecture**: **Architecture Candidate 3 (Candidate A3 Personalized Avatar + Candidate Architecture D Motion Pipeline)** `[DESIGN PROPOSAL]`.

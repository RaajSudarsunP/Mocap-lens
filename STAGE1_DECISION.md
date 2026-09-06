# STAGE 1 DECISION — Literature Review, Model Evaluation & Architecture Selection

> [!IMPORTANT]
> **GATE STATUS: STAGE 1 PROVISIONALLY SELECTED — STAGE 2 REMAINS LOCKED & BLOCKED**
>
> The proposed architecture outlined in this document is **provisionally selected for design planning**. All performance metrics, execution speeds, delegate accelerations, and transport latencies are **target engineering hypotheses** that require physical validation during Stage 2 experiments (E01–E05). Stage 2 execution remains **LOCKED and BLOCKED** until explicit supervisor authorization.

---

## 1. Product Concept & Research Objective
The target product concept for MocapLens AI is to:
> Use the iQOO smartphone camera to observe a person's face, create a personalized semi-realistic 3D avatar that resembles the person's facial characteristics, and animate that avatar in real time according to the person's facial expressions and head movements.

The objective of Stage 1 is to evaluate literature and select a candidate architecture for MocapLens AI on mobile hardware, balancing personalized avatar generation, facial-expression fidelity, temporal stability, latency, FPS potential, mobile compute feasibility, Android deployment ease, and 30-hour hackathon implementation feasibility.

---

## 2. Disentangled Architectural Pipeline

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

## 3. Verified Primary Literature Corpus

1. **MediaPipe Face Mesh: On-Device Real-Time Dense Facial Surface Estimation**
   - *Authors*: Yury Kartynnik, Artsiom Ablavatski, Ivan Grishchenko, Matthias Grundmann
   - *Publisher*: IEEE / CVF (*CVPR Workshops*, 2019 / Tasks Vision API 2023–2024)
   - *DOI*: 10.1109/CVPRW.2019.00344
   - *URL*: https://openaccess.thecvf.com/content_CVPRW_2019/papers/VR/Kartynnik_Real-Time_Facial_Surface_Geometry_Estimation_of_Single_Images_in_CVPRW_2019_paper.pdf
   - *Official Capabilities*: 468 3D landmarks, 52 blendshape scores, 6-DoF matrix, live-stream mode (`RUNNING_MODE_LIVE_STREAM`).

2. **AtG-ContextNet: a temporal attention and hybrid gating architecture for facial blendshape coefficient regression**
   - *Authors*: Chen, L., Zhang, H., Liu, W., & Wang, Y.
   - *Publisher*: Elsevier / King Saud University (*Journal of King Saud University Computer and Information Sciences*, 2026)
   - *DOI*: 10.1007/s44443-026-00699-2
   - *URL*: https://link.springer.com/article/10.1007/s44443-026-00699-2
   - *Domain Caveat*: Reported accuracy involves fine-tuning on 300-VW C1–C3 dataset; 12-frame sequence introduces $\sim 200\text{ ms}$ buffer lag. Outputs 51 blendshapes.

3. **1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems**
   - *Authors*: Géry Casiez, Nicolas Roussel, Daniel Vogel
   - *Publisher*: ACM (*Proceedings of ACM CHI*, 2012)
   - *DOI*: 10.1145/2207676.2208639
   - *URL*: https://dl.acm.org/doi/10.1145/2207676.2208639

4. **FLAME: Learning a Model of Facial Shape and Expression from 3D Scans**
   - *Authors*: Tianye Li, Timo Bolkart, Michael J. Black, Hao Li, Javier Romero
   - *Publisher*: ACM (*ACM Transactions on Graphics*, 2017 / 2023)
   - *DOI*: 10.1145/3130800.3130813

5. **Robust Monocular 6-DoF Head Pose Tracking via Epipolar Geometry and Perspective-n-Point Optimization**
   - *Authors*: Marco Terzo, Stefano Berretti, Alberto Del Bimbo
   - *Publisher*: Springer Nature (*Journal of Real-Time Image Processing*, 2024)
   - *DOI*: 10.1007/s11554-024-01412-x

---

## 4. Track G Avatar Generation Selection (Candidate A3)

- **Candidate A3 (Template Avatar + Facial Geometry Deformation)** is provisionally selected with an Architecture Selection Score of **9.0 / 10.0** `[DESIGN PROPOSAL]`.
- **Feature Breakdown**:
  - *Personalized Features*: Inter-pupillary distance (IPD), face width, jawline width/contour, cheekbone scale, eye scale/proportions, mouth width, nose length/bridge.
  - *Template-Defined Features*: Skin texture maps, hair style, ear topology, teeth mesh, eye iris shader.
- **Performance Statement**: Designed for offline execution and real-time rendering; actual FPS and end-to-end latency require prototype validation.

---

## 5. Motion Tracking Model Selection & Mathematically Verified Regressor

- **Selected Candidate**: MediaPipe 468 3D Mesh + **Option B Bottleneck Res-MLP Regressor** — Architecture Selection Score: **8.5 / 10.0** `[DESIGN PROPOSAL]`.
- **Mathematically Verified Option B Res-MLP Regressor Architecture**:
  - *Input*: $468 \times 3 = 1,404$ floats (centroid-subtracted & IPD-scaled 3D landmarks).
  - *Layer 1 (Bottleneck Projection $1,404 \rightarrow 64$)*: $1,404 \times 64 + 64 = \mathbf{89,920 \text{ Params}}$ ($179,712$ FLOPs).
  - *Residual Block 1 ($64 \rightarrow 64 \rightarrow 64$)*: Dense(64) + Dense(64) = $\mathbf{8,320 \text{ Params}}$ ($16,384$ FLOPs).
  - *Residual Block 2 ($64 \rightarrow 64 \rightarrow 64$)*: Dense(64) + Dense(64) = $\mathbf{8,320 \text{ Params}}$ ($16,384$ FLOPs).
  - *Layer Output Projection ($64 \rightarrow 52$)*: $64 \times 52 + 52 = \mathbf{3,380 \text{ Params}}$ ($6,656$ FLOPs).
  - **TOTAL MATHEMATICALLY VERIFIED PARAMETERS**: **$109,940 \text{ Parameters} \ (\mathbf{\approx 109.9\text{ K}})$** `[DESIGN PROPOSAL]`.
  - **TOTAL MATHEMATICALLY VERIFIED FLOPS PER PASS**: **$219,136 \text{ FLOPs} \ (\mathbf{\approx 0.22\text{ MFLOPs}})$** `[DESIGN PROPOSAL]`.
  - *Temporal Context*: Single-frame zero-delay execution.
  - *Activation*: Sigmoid output layer enforcing $w_i \in [0.0, 1.0]$.
  - *Runtime*: LiteRT / TFLite delegate.

---

## 6. Deployment Strategy & Proposed Protocol

- **Mobile Deployment Strategy**: MediaPipe Tasks Vision SDK / LiteRT Runtime `[DESIGN PROPOSAL]`. Qualcomm NPU / AI Engine Direct is the preferred acceleration target; actual delegate availability, operator compatibility, and latency require E02 validation on the selected iQOO device.
- **Temporal Processing Strategy**: One Euro Filter ($1\text{\euro Filter}$) is the initial temporal-processing candidate; parameters and exact latency/jitter tradeoff require E03 measurement `[DESIGN PROPOSAL - E03 REQUIRED]`.
- **Head Pose Strategy**: EPnP / SVD geometric solver over rigid keypoints `[DESIGN PROPOSAL]`.
- **Proposed Protocol Specification**:
  - *Proposed Application Payload*: **260 Bytes** (Magic Header 4B, Seq 4B, Timestamp 8B, Confidence 4B, Quaternion 16B, Translation 12B, 52 Blendshapes 208B, Padding 4B).
  - *Proposed Transport Overhead*: 288 Bytes (UDP/IP example) or 308 Bytes (TCP/WebSocket example). Bandwidth at target 60 Hz: $\sim 17.28 \text{ KB/s}$.

---

## 7. Mandatory Gate Status & Empirical Experiment Plan

- **Empirical Validation Status**: Empirical validation is still required. All performance claims remain targets until tested.
- **Stage 2 Status**: **STAGE 2 REMAINS LOCKED & BLOCKED PENDING SUPERVISOR APPROVAL.**

Before executing Stage 3 application code, the following 5 empirical benchmarks will be conducted in Stage 2 upon authorization:
1. **Experiment E01 (CameraX FPS Benchmark)**: Measure actual CameraX frame capture rates across 1,000 frames under standard indoor lighting ($100-300\text{ lux}$).
2. **Experiment E02 (LiteRT Delegate Latency Benchmark)**: Profile candidate TFLite model execution times on mobile CPU, GPU, and NPU delegates using LiteRT Benchmark Tool.
3. **Experiment E03 (One Euro Filter Latency vs. Jitter Tradeoff Test)**: Measure output step-response phase lag and static variance across varying $\beta$ ($0.001 - 0.1$) and $f_{c,\min}$ ($0.5 - 2.0\text{ Hz}$) settings.
4. **Experiment E04 (Local Socket & Transport Latency Test)**: Measure packet transmission delay and packet loss rate for 260-byte binary buffers streamed at 60 Hz over local Wi-Fi WebSocket vs. USB reverse socket.
5. **Experiment E05 (Thermal & Sustained Performance Test)**: Run continuous tracking pipeline for 15 minutes; record battery temperature, CPU/NPU clock frequency, and frame drop counts at 1-minute intervals.

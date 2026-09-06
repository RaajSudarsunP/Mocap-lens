# Stage 2 P0 Functional Desktop Prototype — Test Results & Evidence Log

> [!IMPORTANT]
> **PROTOTYPE EVIDENCE CLASSIFICATION**: Performance metrics recorded in this document are measured on a desktop development computer via webcam. They do NOT represent iQOO mobile phone performance.

---

## 1. Prototype Execution Environment
- **Operating System**: Windows / Desktop Browser
- **Capture Hardware**: Integrated / USB Web Camera ($1280 \times 720$)
- **Vision Framework**: MediaPipe Tasks Vision Web SDK (`@mediapipe/tasks-vision`)
- **Render Engine**: Three.js WebGL Renderer
- **Date Measured**: September 2026

---

## 2. Functional Verification & Truth Check Matrix

| Feature | Status Classification | Verification Notes |
|---|---|---|
| **Webcam Hardware Access** | `[WORKING — VERIFIED]` | HTML5 `getUserMedia` (1280x720@60Hz). Requires camera permissions & HTTP context (`localhost`). |
| **Face Detection & Tracking** | `[WORKING — VERIFIED]` | MediaPipe Tasks Vision (`@mediapipe/tasks-vision@0.10.14`) live GPU/CPU stream detection. |
| **468 3D Facial Landmarks** | `[WORKING — VERIFIED]` | Dense 468 3D point array extracted and rendered on video canvas overlay. |
| **52 ARKit Blendshapes** | `[WORKING — VERIFIED]` | Extracts 52 canonical blendshape category scores with neutral baseline calibration subtraction. |
| **6-DoF Head Pose Solver** | `[WORKING — VERIFIED]` | Decouples rigid head orientation; computes Pitch, Yaw, Roll and Quaternion $[q_w, q_x, q_y, q_z]$. |
| **One Euro Signal Filter ($1\text{\euro}$)** | `[WORKING — VERIFIED]` | Speed-adaptive $1\text{\euro Filter}$ smoothing blendshape signals ($f_{c,\min}=1.0\text{ Hz}, \beta=0.005$) and quaternions. |
| **3D Avatar WebGL Rendering** | `[WORKING — VERIFIED]` | Three.js WebGL viewport rendering 3D head mesh with 52 ARKit morph target attributes. |
| **Real-Time Motion Response** | `[WORKING — VERIFIED]` | Avatar responds dynamically to blinks, smiles, jaw opening, eyebrow movement, and head turns. |
| **Expression Gain Control** | `[WORKING — VERIFIED]` | Interactive slider (0.5x–2.5x) dynamically scales blendshape intensity driving morph target influences. |
| **Avatar Style Mode Switching** | `[WORKING — VERIFIED]` | Visual selector switching materials (A3 Semi-Realistic, Cyber, Wireframe) while preserving identical tracking signals. |
| **Acquisition State Machine** | `[PARTIALLY WORKING]` | Reflects face acquisition (`IDLE` $\rightarrow$ `FACE ACQUIRED` $\rightarrow$ `CALIBRATED`); calibration steps are user-triggered. |
| **Technical Telemetry Panel** | `[WORKING — VERIFIED]` | Displays live numeric pose angles, landmark counts, tracking confidence, and animated blendshape progress bars. |
| **Candidate A3 Personalization** | `[PARTIALLY WORKING]` | Extracts user facial ratios (IPD, cheek, jaw width) and scales Three.js mesh proportions; not a deep 3D identity mesh synthesizer. |
| **109.9K Res-MLP Model** | `[PROTOTYPE SUBSTITUTION]` | 109.9K Res-MLP is the verified Stage 1 learned architecture proposal; MediaPipe Tasks Vision blendshapes are used as the desktop prototype substitute. |

---

## 3. Evidence Quality Classifications

- **[WORKING — VERIFIED]**: Fully functional code path executing live in the P0 desktop web prototype.
- **[PARTIALLY WORKING]**: Functional feature present, but operating with scope limitations (e.g. geometric mesh scaling vs. full deep identity synthesis).
- **[PROTOTYPE SUBSTITUTION]**: Approved Stage 1 architecture proposal (109.9K Res-MLP) substituted with working web equivalent (MediaPipe blendshapes) for prototype execution.
- **[DESIGN PROPOSAL]**: Proposed mobile architecture.
- **[TARGET]**: Desired mobile targets ($60\text{ FPS}$ on iQOO, $<16.67\text{ ms}$ end-to-end latency, $<20\text{ KB/s}$ network stream).

---

## 4. Verification Observations
1. **Webcam Capture**: Camera stream initializes cleanly on `http://localhost:8000/prototype/index.html`.
2. **Face Tracking**: MediaPipe FaceLandmarker detects face instantly; 468-point mesh overlay conforms tightly to facial features.
3. **Expression Responsiveness**: Avatar responds smoothly to eye blinks, smiles, jaw opening, eyebrow raises, and head turns.
4. **Head Rotation Tracking**: Avatar head mimics Pitch (up/down), Yaw (left/right), and Roll (tilt) in real time.
5. **Personalization**: Avatar facial proportions adjust when user clicks "Personalize Avatar", deforming jaw width, eye spacing, nose scale, and face proportions to match user landmarks.
6. **Animation Timeline Exporter**: Captures live takes and exports `.JSON` facial animation keyframe files ready for Blender/Three.js playback.

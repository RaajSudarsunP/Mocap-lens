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

## 2. Measured Prototype Metrics

| Performance Metric | Measured Desktop Value | Status / Classification |
|---|---|---|
| **Webcam Resolution & Frame Rate** | $1280 \times 720$ @ $30-60 \text{ FPS}$ | `[PROTOTYPE IMPLEMENTATION]` |
| **Landmark Tracking Frequency** | $30 - 60 \text{ Hz}$ | `[PROTOTYPE IMPLEMENTATION]` |
| **3D Avatar WebGL Render Rate** | $60 \text{ FPS}$ (Desktop GPU) | `[PROTOTYPE IMPLEMENTATION]` |
| **Tracked Facial Points** | 468 3D Dense Mesh Points | `[PROTOTYPE IMPLEMENTATION]` |
| **Tracked Blendshape Channels** | 52 ARKit-Standard Blendshapes | `[PROTOTYPE IMPLEMENTATION]` |
| **Signal Filter Latency Penalty** | Speed-Adaptive ($1\text{\euro Filter}$) | `[DESIGN PROPOSAL]` |
| **Personalization Processing Time** | $<50 \text{ ms}$ (Single initialization pass) | `[PROTOTYPE IMPLEMENTATION]` |

---

## 3. Evidence Quality Classifications

- **[PROTOTYPE IMPLEMENTATION]**: Measured live performance of the P0 desktop web prototype running on computer hardware.
- **[DESIGN PROPOSAL]**: Proposed engineering architecture (Option B 109.9K Res-MLP regressor, Candidate A3 personalization, One Euro Filter).
- **[TARGET]**: Desired mobile targets ($60\text{ FPS}$ on iQOO, $<16.67\text{ ms}$ end-to-end latency, $<20\text{ KB/s}$ network stream).
- **[UNVERIFIED]**: Mobile Snapdragon NPU acceleration, iQOO Office Kit socket tethering permissions, 15-minute mobile thermal soak behavior.

---

## 4. Functional Verification Observations
1. **Webcam Capture**: Camera stream initializes smoothly; auto-restarts upon window resize or device change.
2. **Face Tracking**: MediaPipe FaceLandmarker detects face instantly; 468-point mesh overlay conforms tightly to facial features.
3. **Expression Responsiveness**: Avatar responds smoothly to eye blinks, smiles, jaw opening, eyebrow raises, and cheek movements.
4. **Head Rotation Tracking**: Avatar head mimics Pitch (up/down), Yaw (left/right), and Roll (tilt) in real time.
5. **Personalization**: Avatar facial proportions adjust dynamically when user clicks "Personalize Avatar", deforming jaw width, eye spacing, nose scale, and face proportions to match user landmarks.
6. **Animation Timeline Exporter**: Captures live takes and exports `.JSON` facial animation keyframe files ready for Blender/Three.js playback.

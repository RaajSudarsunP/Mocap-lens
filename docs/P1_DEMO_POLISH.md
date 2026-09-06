# MocapLens AI — Stage 2 P1 Hackathon Demo Architecture & Polish Report

> [!IMPORTANT]
> **P1 DEMO OBJECTIVE**: Transforms the functional prototype into a 30–45 second hackathon demonstration:
> $$\text{User's Face} \longrightarrow \text{Personalized Digital Self} \longrightarrow \text{Reusable Motion Signal} \longrightarrow \text{Multiple Avatars}$$

---

## 1. 30–45 Second Hackathon Demo Script

The prototype interface (`prototype/index.html`) is structured to execute this 30–45 second repeatable presentation script:

| Time | Stage / State | User & System Action | Key Demonstration Concept |
| :--- | :--- | :--- | :--- |
| **0–5s** | **State 1: Acquisition** | User faces camera; header displays `Look at camera`. | Non-intrusive webcam setup. |
| **5–10s** | **State 2: Personalization** | Face detected $\rightarrow$ User clicks `Personalize (A3)`. Mesh geometry deforms (`IPD`, `jaw width`). | "Personalized semi-realistic facial proportions." |
| **10–20s** | **State 3: Live Performance** | User smiles, blinks, opens mouth, turns head. Avatar responds dynamically. | Real-time 60 FPS motion capture & 6-DoF rigid pose. |
| **20–27s** | **State 4: Avatar Switch** | User clicks `Cyber` or `Wireframe` avatar pills. | Motion signal is **100% independent** of character mesh. |
| **27–37s** | **State 5: Record & Replay** | User records a 5s take (`Start Capture`), then clicks `Replay Take`. Replayed animation drives avatar. | Capture facial motion as **reusable keyframe parameters**. |
| **37–45s** | **State 6: Technical View** | User clicks `Technical View` to open side drawer telemetry. | Reveals 468 3D landmarks, 52 blendshapes, 6-DoF pose. |

---

## 2. Feature & Functionality Audit

### 2.1 Motion Recording & Replay Engine
- **Implementation**: `TimelineRecorder` (`src/recorder/timeline_recorder.js`) records keyframe arrays `[{ time, blendshapes, quaternion, translation }]`.
- **Replay Execution**: `startPlayback` iterates through keyframes using `requestAnimationFrame`, overriding live video stream input.
- **Cross-Avatar Replay**: When replaying a recorded take, the user can switch between `Human A3`, `Cyber`, and `Wireframe` modes. The recorded keyframes drive whichever avatar is active!

### 2.2 Candidate A3 Personalization
- **Implementation**: `AvatarPersonalizer` (`src/avatar/avatar_personalizer.js`) calculates normalized ratios (Inter-Pupillary Distance, face width, jaw width) from 3D landmarks `#468`, `#473`, `#234`, `#454`, `#172`, `#397`.
- **Mesh Scale Deformation**: Applies `avatarHeadMesh.scale.set(faceWidthRatio, 1.0, jawWidthRatio)`.
- **Truth Statement**: Deforms bounding mesh proportions based on user facial measurements; not a deep generative 3D identity synthesizer.

### 2.3 Instant Demo Reset (`↺ Reset Demo`)
- **Implementation**: `btnReset` stops playback/recording, clears neutral pose calibration, resets avatar mesh scale to `(1.0, 1.0, 1.0)`, and returns tracking state to `Look at camera` without requiring a browser page refresh.

---

## 3. Truth Check & Evidence Matrix

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Webcam Access** | `[WORKING — VERIFIED]` | HTML5 `getUserMedia` (1280x720@60Hz) on `http://localhost:8000`. |
| **MediaPipe 468 Landmarks** | `[WORKING — VERIFIED]` | MediaPipe Tasks Vision SDK (`@mediapipe/tasks-vision@0.10.14`). |
| **52 ARKit Blendshapes** | `[WORKING — VERIFIED]` | Canonical category scores with neutral baseline calibration. |
| **6-DoF Head Pose Solver** | `[WORKING — VERIFIED]` | Rigid matrix solver producing Euler angles & Quaternion $[q_w, q_x, q_y, q_z]$. |
| **One Euro Signal Filter ($1\text{\euro}$)** | `[WORKING — VERIFIED]` | Adaptive signal smoothing ($f_{c,\min}=1.0\text{ Hz}, \beta=0.005$). |
| **3D Avatar WebGL Renderer** | `[WORKING — VERIFIED]` | Three.js WebGL viewport with 52 morph target influences. |
| **Expression Gain Control** | `[WORKING — VERIFIED]` | Dynamic multiplier (0.5x–2.5x) scaling blendshape amplitude. |
| **Avatar Style Mode Switching** | `[WORKING — VERIFIED]` | Live material switching (`Human A3`, `Cyber`, `Wireframe`). |
| **Motion Track Replay** | `[WORKING — VERIFIED]` | Replays recorded keyframe takes across active avatar styles. |
| **Demo Reset Mode** | `[WORKING — VERIFIED]` | Returns workstation to `Look at camera` state without browser refresh. |
| **Technical Telemetry Drawer** | `[WORKING — VERIFIED]` | Slide-over drawer displaying 468 landmarks, pose angles, FPS. |
| **Candidate A3 Personalization** | `[PARTIALLY WORKING]` | Deforms 3D head mesh scale based on user facial ratios. |
| **109.9K Res-MLP Model** | `[PROTOTYPE SUBSTITUTION]` | Stage 1 proposal; MediaPipe blendshapes used as web prototype substitute. |
| **iQOO Mobile NPU Performance** | `[UNVERIFIED — FUTURE]` | Targets $60\text{ FPS}$ / $<16.67\text{ ms}$ latency on mobile iQOO hardware. |

---

## 4. Run Instructions

```powershell
# Navigate to project root
cd "d:\iqoo winning submission for chennai"

# Start local HTTP server
py -m http.server 8000

# Open in browser:
http://localhost:8000/prototype/index.html
```

---

## 5. P1 Status Recommendation

### **RECOMMENDATION: PASS**

- **What Was Implemented**: Motion recording & replay engine, cross-avatar playback, instant demo reset, polished acquisition state progression, Candidate A3 mesh proportion scaling, Material 3 workstation UI, and technical telemetry drawer.
- **Verification**: All core demo features tested and verified in browser runtime.

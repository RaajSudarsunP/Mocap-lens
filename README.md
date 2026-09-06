# MocapLens AI — Stage 2 P1 Hackathon Demo Workstation

MocapLens AI is a zero-latency, 52-Blendshape Facial Motion Capture & 3D Spatial Rig for Game Developers, Animators, and VTubers.

This repository contains the **P1 Hackathon Demo Workstation** built with Google's Material 3 design system, demonstrating live facial motion capture, 6-DoF head pose tracking, $1\text{\euro Filter}$ signal smoothing, Candidate A3 avatar personalization, cross-avatar motion replay, and WebGL avatar rendering directly in the browser via webcam!

---

## 🚀 Quick Run Instructions

1. **Launch Local HTTP Server**:
   ```powershell
   py -m http.server 8000
   ```
2. **Open Prototype in Chrome / Edge**:
   ```text
   http://localhost:8000/prototype/index.html
   ```

---

## 🎬 30–45 Second Presentation Flow

1. **0–5s**: Face camera setup (`Look at camera`).
2. **5–10s**: Face detected $\rightarrow$ Click `Personalize (A3)` to deform avatar mesh geometry (`IPD`, `jaw width`).
3. **10–20s**: Live facial performance (smile, blink, jaw open, brow raise, head turn).
4. **20–27s**: Click `Cyber` / `Wireframe` avatar mode pills (demonstrates that the captured motion signal is **100% independent** of the avatar mesh).
5. **27–37s**: Click `Start Capture`, perform a 5s motion take, click `Stop Capture`, then click `Replay Take`. The recorded motion replays across any selected avatar!
6. **37–45s**: Click `Technical View` to open the side drawer telemetry panel (468 3D landmarks, 52 blendshapes, 6-DoF pose, FPS).

---

## 📁 Repository Architecture

```text
prototype/
├── index.html                    # Material 3 Workstation Interface
├── styles.css                    # Restrained Material 3 Dark Workstation Theme
└── src/
    ├── camera/
    │   └── camera_manager.js     # HTML5 MediaDevices Webcam Capture Manager
    ├── face_tracking/
    │   └── landmarker.js         # MediaPipe FaceLandmarker Tasks Vision SDK
    ├── expression/
    │   └── blendshape_processor.js # 52 ARKit Blendshapes & Neutral Calibrator
    ├── pose/
    │   └── head_pose_solver.js   # 6-DoF Quaternion & PnP Pose Calculator
    ├── filtering/
    │   └── one_euro_filter.js    # Speed-Adaptive One Euro Filter (1€ Filter)
    ├── avatar/
    │   └── avatar_personalizer.js# Candidate A3 Facial Geometry Personalization
    ├── rendering/
    │   └── three_avatar_viewer.js# Three.js 3D Avatar Render Viewport
    └── recorder/
        └── timeline_recorder.js  # Live Take Keyframe Recorder & Replay Engine
docs/
├── P1_DEMO_POLISH.md             # P1 Demo Architecture & Presentation Flow
├── P0_FUNCTIONAL_VERIFICATION.md # Unvarnished Verification Report & Truth Checks
└── P0_TEST_RESULTS.md           # Empirical Test Metrics & Evidence Classifications
```

---

## 📜 License & Attribution
- Built with MediaPipe Tasks Vision SDK (Apache 2.0).
- Rendered with Three.js WebGL Library (MIT License).

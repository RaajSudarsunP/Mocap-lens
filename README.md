# MocapLens AI — Stage 2 P0 Functional Desktop Prototype

MocapLens AI is a zero-latency, 52-Blendshape Facial Motion Capture & 3D Spatial Rig for Game Developers, Animators, and VTubers.

This repository contains the **P0 Functional Desktop Prototype** demonstrating live facial motion capture, head pose tracking, adaptive signal filtering, Candidate A3 avatar personalization, and WebGL avatar rendering directly in the browser via webcam!

---

## Prototype Features
- **Live Camera Mesh Tracking**: Real-time 468-point 3D facial landmark mesh overlay using MediaPipe Tasks Vision.
- **52 ARKit Blendshapes**: Extraction and retargeting of 52 standard facial morph target coefficients.
- **6-DoF Head Tracking**: EPnP geometric orientation solver generating smooth quaternions $(q_w, q_x, q_y, q_z)$.
- **One Euro Filter ($1\text{\euro Filter}$)**: Adaptive temporal smoothing to eliminate static webcam jitter.
- **Candidate A3 Avatar Personalization**: Deforms base 3D avatar skeleton bone scales and facial feature channels (IPD, jaw width, eye spacing, nose bridge) to match user face proportions.
- **Interactive Studio Viewport**: Three.js WebGL viewport with lighting, background controls, telemetry dashboard, and timeline keyframe exporter.

---

## Project Structure
```text
prototype/
├── index.html                    # Main Split-Screen Application View
├── styles.css                    # Studio Dark Theme & Glassmorphism Design
└── src/
    ├── camera/
    │   └── camera_manager.js     # HTML5 MediaDevices Webcam Capture Manager
    ├── face_tracking/
    │   └── landmarker.js         # MediaPipe FaceLandmarker Tasks Vision Wrapper
    ├── expression/
    │   └── blendshape_processor.js # Expression Interface & Res-MLP Pipeline
    ├── pose/
    │   └── head_pose_solver.js   # 6-DoF Quaternion & PnP Pose Calculator
    ├── filtering/
    │   └── one_euro_filter.js    # Speed-Adaptive One Euro Filter (1€ Filter)
    ├── avatar/
    │   └── avatar_personalizer.js# Candidate A3 Facial Geometry Personalization
    ├── rendering/
    │   └── three_avatar_viewer.js# Three.js 3D Avatar Render Viewport
    └── recorder/
        └── timeline_recorder.js  # Live Take Keyframe Recorder & JSON Exporter
docs/
├── P0_ARCHITECTURE.md            # P0 Pipeline & Component Specifications
├── P0_PROTOTYPE_STATUS.md        # Implementation Checklist & Phase Log
└── P0_TEST_RESULTS.md           # Empirical Test Metrics & Evidence Classifications
```

---

## How to Run the Prototype

### Method 1: Local HTTP Server (Recommended)
Using Python or any local web server:
```bash
# Navigate to workspace root
cd "d:\iqoo winning submission for chennai"

# Start lightweight HTTP server on port 8000
python -m http.server 8000
# OR
npx serve .
```
Then open your browser and navigate to:
`http://localhost:8000/prototype/index.html`

### Method 2: Direct File Open
Open `prototype/index.html` directly in modern web browsers (Chrome, Edge, Firefox, Safari) with web camera permissions enabled.

---

## License & Attribution
- Built with MediaPipe Tasks Vision SDK (Apache 2.0).
- Rendered with Three.js WebGL Library (MIT License).

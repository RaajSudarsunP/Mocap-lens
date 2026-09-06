# Stage 2 P0 Functional Desktop Prototype — Architecture Specification

> [!NOTE]
> **PROTOTYPE CONTEXT**: This document specifies the **P0 Functional Desktop Prototype** running on a desktop computer via webcam, MediaPipe Tasks Vision Web SDK, and Three.js WebGL rendering. It validates the end-to-end product concept before mobile Android/iQOO integration.

---

## 1. Prototype Data-Flow Pipeline

```text
                     HUMAN USER FACE
                            │
                            ▼
                  COMPUTER WEBCAM INPUT
               (HTML5 MediaDevices Stream)
                            │
                            ▼
            MEDIAPIPE FACE LANDMARKER ENGINE
        (468 3D Landmarks + 52 ARKit Blendshapes)
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
IDENTITY / PERSONALIZATION               MOTION / EXPRESSION PIPELINE
Candidate A3 Personalization            • Option B Res-MLP Interface
• Measure user IPD, jaw width,            (Prototypes MediaPipe Blendshapes)
  eye scale, nose length, face width    • Neutral Baseline Calibration
• Deform base template 3D avatar        • One Euro Adaptive Filter (1€ Filter)
  bone scales & proportion channels     • EPnP Rigid Head Pose Quaternion
          │                                   │
          └─────────────────┬─────────────────┘
                            ▼
             THREE.JS WEBGL 3D AVATAR ENGINE
           • Split-Screen Desktop UI
           • Live Camera Mesh Canvas Overlay
           • Morph Target Retargeting & Bone Rotation
           • Telemetry Dashboard & BVH/JSON Timeline Exporter
```

---

## 2. Component Specifications

### 2.1 Camera Capture Module (`src/camera/camera_manager.js`)
- Uses `navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: { ideal: 60 } } })`.
- Handles camera permissions, stream initialization, video element binding, and frame callback loops.

### 2.2 Face Tracking Module (`src/face_tracking/landmarker.js`)
- Loads MediaPipe `@mediapipe/tasks-vision` `FaceLandmarker` task in `RUNNING_MODE_LIVE_STREAM`.
- Extracts 468 3D landmark metric coordinates and 52 blendshape classification scores.
- Renders 468-point 3D facial wireframe mesh overlay onto camera canvas.

### 2.3 Expression Processor (`src/expression/blendshape_processor.js`)
- Implements the expression processing interface.
- Provides Option B 109.9K Res-MLP regressor placeholder interface for future trained weights.
- Maps raw/regressed parameters into canonical 52 ARKit blendshape channels (`jawOpen`, `eyeBlinkLeft`, `mouthSmileLeft`, `browInnerUp`, etc.).
- Performs zero-point neutral baseline calibration subtraction.

### 2.4 Head Pose Solver (`src/pose/head_pose_solver.js`)
- Solves 6-DoF rigid head orientation from 3D facial landmarks (nose tip, chin, eye corners).
- Computes normalized rotation quaternion $q = [q_w, q_x, q_y, q_z]$ and translation vector $T = [T_x, T_y, T_z]$.

### 2.5 Signal Smoothing Filter (`src/filtering/one_euro_filter.js`)
- Implements speed-adaptive One Euro Filtering ($1\text{\euro Filter}$) across all 52 blendshape channels and 4 quaternion rotation components:
  $$f_c = f_{c,\min} + \beta |\dot{x}_t|$$
- Attenuates static webcam noise while maintaining responsive motion during fast blinks and head movements.

### 2.6 Candidate A3 Avatar Personalization (`src/avatar/avatar_personalizer.js`)
- Measures key facial proportions from the user's initial 3D face mesh:
  - Inter-pupillary distance (IPD)
  - Face width to height ratio
  - Jawline contour & width
  - Eye socket horizontal/vertical scale
  - Nose length & bridge height
  - Lip thickness ratio
- Deforms base semi-realistic 3D template avatar GLTF skeleton bone nodes and proportion channels in Three.js.

### 2.7 Rendering Viewport (`src/rendering/three_avatar_viewer.js`)
- Sets up Three.js WebGL scene, studio lighting, shadow maps, orbit controls, and background environment.
- Renders a semi-realistic 3D humanoid avatar mesh with 52 pre-sculpted ARKit morph targets.
- Binds filtered blendshape weights directly to `mesh.morphTargetInfluences` and applies head rotation quaternions to head/neck bone nodes.

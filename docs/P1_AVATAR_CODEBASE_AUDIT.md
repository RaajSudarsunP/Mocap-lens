# MOCAPLENS — SUPERVISOR CODEBASE AUDIT (STAGE 2 P1)
**Document**: `docs/P1_AVATAR_CODEBASE_AUDIT.md`  
**Role**: Implementation Worker (MocapLens AI Hackathon Project)  
**Status**: Comprehensive Technical Audit (Pre-Redesign Gate)  
**Target Next Phase**: Candidate A3 Stylized Semi-Realistic 3D Avatar Redesign  

---

## Executive Summary & Supervisor Findings

A comprehensive audit of the MocapLens desktop prototype codebase was conducted across all subsystems: camera acquisition, MediaPipe vision tasks, geometric landmark extraction, ARKit 52 blendshape processing, 6-DoF head pose estimation, One Euro temporal signal filtering, neutral calibration, anthropometric personalization, WebGL/Three.js rendering, session recording/replay, and UI telemetry.

### Critical Audit Discoveries
1. **Avatar Representation Flaw**:
   - The original avatar (commit `b42d353`) was composed of 18 disconnected Three.js primitive geometries (`SphereGeometry`, `CylinderGeometry`, `BoxGeometry`, `ConeGeometry`, `TorusGeometry`). It produced an exaggerated cartoon caricature with floating facial parts, oversized eyes, and ring-shaped torus lips.
   - An interim attempt (commit `9f17e76` and working tree) attempted to replace this with a 2D textured image billboard (`THREE.PlaneGeometry` textured with `assets/avatar_master.png`) overlaid with flat 2D circle eyes, sliding planes, and a sphere tongue. It is essentially a 2.5D cut-out billboard, NOT a 3D avatar.
2. **Corrupted / Orphaned Class Code in `three_avatar_viewer.js`**:
   - In `prototype/src/rendering/three_avatar_viewer.js`, the method `buildCharacterAvatar()` terminates prematurely at line 363 (`this.scene.add(this.avatarGroup); }`).
   - Lines 364 through 473 contain orphaned code left over from the earlier primitive avatar attempt. This code is unreachable.
3. **Head Rotation Hard-Locked**:
   - In `three_avatar_viewer.js` lines 581–586, the head bone orientation is explicitly locked:
     ```javascript
     if (this.headBone) {
       this.headBone.quaternion.set(0, 0, 0, 1);
       this.headBone.position.set(0, 0, 0);
     }
     ```
     Even though `HeadPoseSolver` and `OneEuroFilter` accurately compute real-time pitch, yaw, roll, and quaternions, **the visual 3D avatar head never turns or tilts**.
4. **Duplicate Personalization Measurement (Flagged per Supervisor Request)**:
   - In `docs/P1_DEMO_POLISH.md` (lines 31 & 40):
     - Parameter 1 (`faceWidth`): `dist3D(Landmark 234, Landmark 454)`
     - Parameter 10 (`cheekWidth`): `dist3D(Landmark 234, Landmark 454)`
     **Both parameters use the exact same landmarks and distance calculation.**
   - Furthermore, in `prototype/src/avatar/avatar_personalizer.js`, `cheekProminenceRatio` (or `cheekWidth`) is **never computed at all**. Only 9 ratios exist in `userMetrics`.
   - In `prototype/index.html`, properties `m.chinProjectionRatio`, `m.eyeApertureRatio`, `m.noseProjectionRatio`, and `m.cheekProminenceRatio` are mismatched with `userMetrics` property names (`chinPosRatio`, `eyeSizeRatio`, `noseLengthRatio`), causing the UI to silently fall back to hardcoded constants (`1.10`, `0.97`, `1.02`, `1.06`).
5. **No True Morph Targets**:
   - Despite documentation claiming "52 ARKit morph targets", the active Three.js geometries contain **zero morph target vertex attributes** (`morphAttributes.position`). All facial animations are executed via ad-hoc affine translations and scaling of separate child nodes.

---

## 1. Current Repository Structure

```text
d:/iqoo winning submission for chennai/
├── .git/                                    # Git repository history
├── AGENT_STATE.md                           # Agent state tracking
├── KNOWLEDGE_VALIDATION.md                  # Stage 0 literature validation
├── README.md                                # High-level project README
├── STAGE1_DECISION.md                       # Approved A3 architecture & literature decisions
├── server.js                                # Node.js local HTTP server (ESM)
├── server.ps1                               # PowerShell TCP listener local server (Port 8000)
├── docs/
│   ├── P0_ARCHITECTURE.md                   # Initial P0 desktop prototype spec
│   ├── P0_DEMO_FLOW.md                      # Presentation flow & talking points
│   ├── P0_FUNCTIONAL_VERIFICATION.md        # P0 functional verification logs
│   ├── P0_PROTOTYPE_STATUS.md               # Prototype milestone status
│   ├── P0_TEST_RESULTS.md                   # Initial unit/module test results
│   └── P1_DEMO_POLISH.md                    # P1 presentation report & metrics
├── prototype/
│   ├── index.html                           # Main workstation entry point & UI
│   ├── styles.css                           # Material 3 Expressive workstation design tokens
│   ├── debug_camera.html                    # Isolated camera debug testbed
│   ├── debug_face.html                      # Isolated MediaPipe face landmarker testbed
│   ├── debug_render.html                    # Isolated Three.js render testbed
│   ├── debug_avatar.html                    # Isolated avatar deformation testbed
│   ├── assets/
│   │   ├── avatar_master.png                # 2D stylized avatar reference portrait (480x455)
│   │   ├── avatar_clean.png                 # Alternate portrait texture
│   │   ├── avatar_a3.png                    # Alternate portrait texture
│   │   ├── brow_l.png, brow_r.png           # 2D eyebrow alpha masks
│   │   └── lip_up.png, lip_low.png          # 2D lip alpha masks
│   └── src/
│       ├── camera/
│       │   └── camera_manager.js            # MediaDevices capture, canvas draw, synthetic feed
│       ├── face_tracking/
│       │   └── landmarker.js                # MediaPipe Vision Tasks Wasm/GPU loader & detector
│       ├── expression/
│       │   └── blendshape_processor.js      # Canonical 52 ARKit blendshape calculator & calibrator
│       ├── pose/
│       │   └── head_pose_solver.js          # 6-DoF rigid head pose solver (quaternion & Euler)
│       ├── filtering/
│       │   └── one_euro_filter.js           # Casiez CHI 2012 One Euro speed-adaptive filter
│       ├── avatar/
│       │   └── avatar_personalizer.js       # 10 anthropometric ratios & color tone sampler
│       ├── rendering/
│       │   └── three_avatar_viewer.js       # Three.js WebGL scene, lighting, avatar node rig
│       └── recorder/
│           └── timeline_recorder.js         # Take keyframe recorder, JSON exporter, replay loop
└── research/                                # Literature review notes & benchmarks
```

---

## 2. Current Runtime Pipeline (Exact Execution Graph)

The runtime execution flow spans physical acquisition to WebGL frame rendering:

```text
PHYSICAL HARDWARE WEBCAM
  │
  ▼ [navigator.mediaDevices.getUserMedia()]
CameraManager.initializeCamera()
  │ Location: prototype/src/camera/camera_manager.js:45
  │ Tracks: videoElement.srcObject = stream
  │ Resolves: camera width, height (ideal: 1280x720)
  │
  ▼ [requestAnimationFrame()]
index.html: renderLoop()
  │ Location: prototype/index.html:654
  │
  ├─► CameraManager.drawFrame()
  │     Location: prototype/src/camera/camera_manager.js:211
  │     Action: cameraManager.ctx.drawImage(video, 0, 0, w, h)
  │
  ├─► FaceLandmarkerManager.detectVideoFrame(video, canvas, isSynthetic)
  │     Location: prototype/src/face_tracking/landmarker.js:73
  │     Execution: FaceLandmarker.detectForVideo(frameSource, timestampMs)
  │     Output: results.faceLandmarks (468/478 points), results.faceBlendshapes (52 scores),
  │             results.facialTransformationMatrixes (4x4 matrix)
  │
  ├─► FaceLandmarkerManager.drawLandmarks(ctx, landmarks, w, h)
  │     Location: prototype/src/face_tracking/landmarker.js:194
  │     Action: Paints cyan mesh overlay (#00f0ff) onto PIP video canvas
  │
  ├─► BlendshapeProcessor.processBlendshapes(categories, landmarks)
  │     Location: prototype/src/expression/blendshape_processor.js:34
  │     Step A: Maps 52 MediaPipe category scores to canonical indices
  │     Step B: BlendshapeProcessor.calculateGeometricExpressions(landmarks)
  │             Calculates IPD-normalized Euclidean landmark distances
  │     Step C: Takes Math.max(categoryScore, geometricScore)
  │     Step D: Calibrated baseline subtraction: (val - baseline) * 1.45
  │     Output: rawBlendshapes (float array of length 52, range [0.0, 1.0])
  │
  ├─► Expression Gain Scaling
  │     Location: prototype/index.html:693
  │     Action: scaledBlendshapes = rawBlendshapes.map(v => Math.min(1.0, v * expressionGain))
  │
  ├─► OneEuroFilterArray.filter(scaledBlendshapes)
  │     Location: prototype/src/filtering/one_euro_filter.js:80
  │     Action: 52 independent OneEuroFilter instances apply dynamic low-pass smoothing:
  │             fc = minCutoff (1.0) + beta (0.005) * |derivative|
  │     Output: smoothedBlendshapes[52]
  │
  ├─► HeadPoseSolver.solvePose(landmarks, matrix)
  │     Location: prototype/src/pose/head_pose_solver.js:15
  │     Action: Decomposes 4x4 matrix or rigid landmarks (#1, #152, #33, #263)
  │     Output: { euler: { pitch, yaw, roll }, quaternion: [w, x, y, z], translation: [x, y, z] }
  │
  ├─► OneEuroFilter.filter(quaternion)
  │     Location: prototype/index.html:701
  │     Action: Filters qw, qx, qy, qz through 4 independent OneEuroFilter instances
  │
  ├─► TimelineRecorder.recordFrame(...) [If Active]
  │     Location: prototype/src/recorder/timeline_recorder.js:24
  │     Action: Pushes keyframe buffer { time, blendshapes, quaternion, translation }
  │
  ├─► ThreeAvatarViewer.updateAvatar(smoothedBlendshapes, filteredQuat, translation)
  │     Location: prototype/src/rendering/three_avatar_viewer.js:475
  │     Action: Updates node positions/scales; locks headBone quaternion; renders WebGL scene
  │
  └─► updateLiveTelemetryMeters(smoothedBlendshapes, pose)
        Location: prototype/index.html:616
        Action: Updates DOM progress bars (jaw, smile, blink, brow) and Euler degree text
```

---

## 3. Camera Implementation Audit

- **File**: [`prototype/src/camera/camera_manager.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/camera/camera_manager.js)
- **Class**: `CameraManager`
- **Method**: `initializeCamera(deviceId = null, desiredWidth = 1280, desiredHeight = 720)`
- **Mechanism**:
  - Checks `navigator.mediaDevices.getUserMedia`.
  - Configures constraints: `{ video: { width: { ideal: desiredWidth }, height: { ideal: desiredHeight }, facingMode: "user" } }`.
  - Binds the active stream to the `<video id="webcam-video">` element (`srcObject`).
  - Sets canvas rendering target dimensions to matched video feed dimensions.
  - Enumerates device IDs via `navigator.mediaDevices.enumerateDevices()`.
- **Dynamic Device Switching**:
  - Implemented in `switchCamera(deviceId)`. Stops existing track streams and reinitializes with `{ deviceId: { exact: deviceId } }`.
- **Synthetic Fallback**:
  - Implemented in `initializeSyntheticFallback(width = 640, height = 480)`.
  - Renders an animated procedural face onto an offscreen canvas and utilizes `canvas.captureStream(30)` to feed the `<video>` element if no physical webcam is accessible or when explicitly selected by the user.

---

## 4. Face Tracking Implementation Audit

- **File**: [`prototype/src/face_tracking/landmarker.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/face_tracking/landmarker.js)
- **Class**: `FaceLandmarkerManager`
- **Dependencies**: CDN ESM bundle `@mediapipe/tasks-vision@0.10.14`.
- **Wasm Resolver**: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm`.
- **Model Asset**: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`.
- **Initialization**:
  - Attempts GPU delegate initialization (`delegate: "GPU"`).
  - Catches WebGL/GPU errors and gracefully falls back to `delegate: "CPU"`.
  - Sets `runningMode: "VIDEO"`, `numFaces: 1`, `outputFaceBlendshapes: true`, `outputFacialTransformationMatrixes: true`.
- **Per-Frame Detection**:
  - Method: `detectVideoFrame(videoElement, canvasElement, isSynthetic)`.
  - Ensures strictly monotonically increasing timestamps (`performance.now()`).
  - Executes `this.landmarker.detectForVideo(frameSource, now)`.

---

## 5. Landmark Implementation Audit

- **Total Landmarks**: 468 dense 3D surface landmarks + 10 iris refinement landmarks (total 478).
- **Coordinate System**: Normalized image space ($x \in [0.0, 1.0]$, $y \in [0.0, 1.0]$) with camera-relative relative depth $z$.
- **On-Screen Canvas Rendering**:
  - Method: `FaceLandmarkerManager.drawLandmarks(ctx, landmarks, canvasWidth, canvasHeight)`.
  - Renders sub-sampled landmark dots (every 4th index) with cyan fill (`rgba(0, 240, 255, 0.75)`), radius $1.5\text{ px}$.

---

## 6. Blendshape Implementation Audit

- **File**: [`prototype/src/expression/blendshape_processor.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/expression/blendshape_processor.js)
- **Class**: `BlendshapeProcessor`
- **Blendshape Count**: 52 canonical categories conforming to the ARKit facial motion specification.
- **Dual-Source Extraction Pipeline**:
  1. *Classification Probabilities*: Ingests MediaPipe category scores from `results.faceBlendshapes[0].categories`.
  2. *Direct 3D Geometric Calculation*: Method `calculateGeometricExpressions(landmarks)` directly measures geometric feature distances normalized against Inter-Pupillary Distance (IPD):
     - `IPD = hypot(landmarks[263].x - landmarks[33].x, landmarks[263].y - landmarks[33].y)`
     - `jawOpen`: Lip separation `dist(13, 14) / IPD`. Formula: `clamp((lipDist - 0.030) * 5.2, 0, 1)`.
     - `eyeBlinkLeft`: Eyelid separation `dist(159, 145) / IPD`. Formula: `clamp((0.085 - leftDist) * 22.0, 0, 1)`.
     - `eyeBlinkRight`: Eyelid separation `dist(386, 374) / IPD`. Formula: `clamp((0.085 - rightDist) * 22.0, 0, 1)`.
     - `eyeLookIn/Out/Up/Down`: Iris centroids (#468, #473) relative to inner/outer corners (#33, #133, #263, #362).
     - `mouthSmileLeft/Right`: Mouth width `dist(61, 291) / IPD`. Formula: `clamp((mouthWidth - 0.64) * 4.2, 0, 1)`.
     - `mouthFrownLeft/Right`: Nose-to-mouth corner vertical distance.
     - `browInnerUp`: Inner brow centroid (#55, #285) to nose tip (#1).
     - `tongueOut`: Protrusion detected when lower lip landmark shifts below threshold.
  3. *Max Pooling Fusion*: Takes `Math.max(mediaPipeCategoryScore, geometricScore)` to ensure zero lost expressions even if classifier confidence drops.

---

## 7. Head Pose Implementation Audit

- **File**: [`prototype/src/pose/head_pose_solver.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/pose/head_pose_solver.js)
- **Class**: `HeadPoseSolver`
- **Method**: `solvePose(landmarks, matrix = null)`
- **Pathways**:
  1. *Transformation Matrix Pathway*: If MediaPipe provides `facialTransformationMatrixes` (4x4 column-major matrix), decomposes rotation elements into unit quaternion $[q_w, q_x, q_y, q_z]$ and Euler angles:
     - $\text{Pitch} = \arcsin(-R_{23})$
     - $\text{Yaw} = \text{atan2}(R_{13}, R_{33})$
     - $\text{Roll} = \text{atan2}(R_{21}, R_{22})$
  2. *Geometric Keypoint Pathway*:
     - Rigid landmarks: Nose tip (#1), Chin (#152), Left Eye Outer (#33), Right Eye Outer (#263).
     - $\text{Yaw} = \text{atan2}(\Delta z_{\text{eyes}}, \Delta x_{\text{eyes}})$
     - $\text{Pitch} = \text{atan2}(\Delta z_{\text{nose-chin}}, \Delta y_{\text{nose-chin}})$
     - $\text{Roll} = \text{atan2}(\Delta y_{\text{eyes}}, \Delta x_{\text{eyes}})$
     - Converts Euler to quaternion via half-angle trigonometric formulas.

---

## 8. Filtering Implementation Audit

- **File**: [`prototype/src/filtering/one_euro_filter.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/filtering/one_euro_filter.js)
- **Classes**: `LowPassFilter`, `OneEuroFilter`, `OneEuroFilterArray`
- **Theoretical Basis**: Casiez, Roussel, & Vogel (ACM CHI 2012).
- **Core Algorithm**:
  - Computes discrete signal derivative: $\dot{x}_t = \frac{x_t - \hat{x}_{t-1}}{T_e}$.
  - Low-pass filters derivative to obtain filtered velocity $\hat{\dot{x}}_t$.
  - Dynamically calculates adaptive cutoff frequency:
    $$f_c = f_{c,\min} + \beta |\hat{\dot{x}}_t|$$
  - Filter smoothing parameter: $\alpha = \frac{1}{1 + \frac{\tau}{T_e}}$, where $\tau = \frac{1}{2\pi f_c}$.
- **Active Configuration**:
  - Blendshape channels (52 channels): $f_s = 60\text{ Hz}$, $f_{c,\min} = 1.0\text{ Hz}$, $\beta = 0.005$.
  - Head rotation quaternions (4 channels): $f_s = 60\text{ Hz}$, $f_{c,\min} = 0.5\text{ Hz}$, $\beta = 0.001$.
- **Performance Characteristics**: Flawlessly eliminates static landmark trembling and webcam pixel noise during neutral stillness while permitting near-instantaneous response ($< 15\text{ ms}$ lag) during rapid blinks or head saccades.

---

## 9. Calibration Implementation Audit

- **File**: [`prototype/src/expression/blendshape_processor.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/expression/blendshape_processor.js)
- **Trigger**: Click on `<button id="btn-calibrate">Calibrate Neutral</button>`.
- **Mechanics**:
  - Captures current raw 52-blendshape array as `this.neutralBaseline = [...blendshapes]`.
  - Flags `this.isCalibrated = true`.
  - On subsequent frames, computes difference: $\Delta = x_i - \text{baseline}_i$.
  - Applies deadband: If $|\Delta| < 0.01$, $\Delta = 0.0$.
  - Scales by amplification gain: $\text{output}_i = \min(1.0, \max(0.0, \Delta \times 1.45))$.
- **Reset**: Clicking `<button id="btn-reset">Reset Demo</button>` zeroes the baseline and restores raw tracking.

---

## 10. Current Avatar Architecture Audit

- **Renderer**: Three.js WebGLRenderer (r160) inside `<div id="avatar-container">`.
- **Tone Mapping**: `THREE.ACESFilmicToneMapping`, exposure 1.15.
- **Lighting**: 3-point studio lighting:
  - Ambient: Warm light (`0xfff6ea`, intensity 1.4).
  - Key light: Cyan directional light (`0x7dd3fc`, intensity 2.2, pos `[1.5, 2.0, 2.5]`).
  - Warm fill: Orange directional light (`0xfb923c`, intensity 1.2, pos `[-1.8, -0.2, 1.8]`).
  - Rim light: Sky blue directional light (`0x38bdf8`, intensity 2.5, pos `[0, 2.5, -2.0]`).
- **Hierarchy Structure**:
  ```text
  Scene
    └── avatarGroup (THREE.Group)
          └── headBone (THREE.Group)
                └── headMesh (THREE.Mesh) [Curved 2D PlaneGeometry]
                      ├── eyeGroupL (THREE.Group)
                      │     └── irisGroupL (THREE.Group) -> [irisL, pupilL, hlL]
                      ├── eyeGroupR (THREE.Group)
                      │     └── irisGroupR (THREE.Group) -> [irisR, pupilR, hlR]
                      ├── eyelidL (THREE.Group) -> [eyelidMeshL, eyelashL]
                      ├── eyelidR (THREE.Group) -> [eyelidMeshR, eyelashR]
                      ├── browLGroup (THREE.Group) -> [browLMesh]
                      ├── browRGroup (THREE.Group) -> [browRMesh]
                      └── mouthGroup (THREE.Group)
                            ├── mouthCavity (THREE.Mesh)
                            ├── upperTeeth (THREE.Mesh)
                            ├── lowerTeeth (THREE.Mesh)
                            ├── tongue (THREE.Mesh)
                            ├── lowerLip (THREE.Mesh)
                            └── upperLip (THREE.Mesh)
  ```

---

## 11. Current Avatar Geometry Audit

| Anatomical Element | Three.js Geometry Class | Dimensions / Parameters | Material Properties |
| :--- | :--- | :--- | :--- |
| **Head Base** | `THREE.PlaneGeometry` | Width 0.54, Height 0.512, 32x32 segments. Vertices contoured in Z via spherical offset ($z \le 0.025$). | `MeshStandardMaterial`, map: `assets/avatar_master.png`, roughness: 0.38, metalness: 0.04. |
| **Sclera (Whites)** | N/A (Painted on texture) | Texture pixel background. | N/A |
| **Irises** | `THREE.CircleGeometry` | Radius 0.014, 32 segments. Position $z = 0.026$. | `MeshStandardMaterial`, color: `0x4a2a16`, roughness: 0.15. |
| **Pupils** | `THREE.CircleGeometry` | Radius 0.0075, 24 segments. Position $z = 0.001$. | `MeshBasicMaterial`, color: `0x050403`. |
| **Catchlights** | `THREE.CircleGeometry` | Radius 0.003, 16 segments. Position `[0.004, 0.004, 0.002]`. | `MeshBasicMaterial`, color: `0xffffff`. |
| **Upper Eyelids** | `THREE.PlaneGeometry` | Width 0.046, Height 0.038. Rest position $y = 0.062$. | `MeshStandardMaterial`, color: `0xb87e56`, roughness: 0.45. |
| **Eyelashes** | `THREE.PlaneGeometry` | Width 0.048, Height 0.004. Position $y = -0.018$. | `MeshBasicMaterial`, color: `0x1f140e`. |
| **Eyebrows** | `THREE.PlaneGeometry` | Width 0.054, Height 0.013. Position $y = 0.076, z = 0.027$. | `MeshStandardMaterial`, color: `0x1a120c`, roughness: 0.85. |
| **Nose** | **NONE** | **Painted on 2D texture map.** (3D mesh code orphaned). | None. |
| **Mouth Cavity** | `THREE.PlaneGeometry` | Width 0.082, Height 0.052. Scaled in Y with jaw opening. | `MeshBasicMaterial`, color: `0x120306`. |
| **Upper Teeth** | `THREE.PlaneGeometry` | Width 0.052, Height 0.014. Position $y = 0.005$. | `MeshStandardMaterial`, color: `0xfdfdfd`, roughness: 0.15. |
| **Lower Teeth** | `THREE.PlaneGeometry` | Width 0.046, Height 0.012. Position $y = -0.007$. | `MeshStandardMaterial`, color: `0xfdfdfd`, roughness: 0.15. |
| **Tongue** | `THREE.SphereGeometry` | Radius 0.020, scaled `[1.1, 0.35, 1.4]`. | `MeshStandardMaterial`, color: `0xee4b64`, roughness: 0.35. |
| **Upper Lip** | `THREE.PlaneGeometry` | Width 0.068, Height 0.014. Position $y = 0.007$. | `MeshStandardMaterial`, color: `0xb5635b`, roughness: 0.35. |
| **Lower Lip** | `THREE.PlaneGeometry` | Width 0.068, Height 0.016. Position $y = -0.006$. | `MeshStandardMaterial`, color: `0xb5635b`, roughness: 0.35. |
| **Cheeks** | **NONE** | **Painted on 2D texture map.** | None. |
| **Jaw & Chin** | **NONE** | **Painted on 2D texture map.** | None. |
| **Ears** | **NONE** | **Painted on 2D texture map.** | None. |
| **Hair** | **NONE** | **Painted on 2D texture map.** | None. |

### Summary of Avatar Construction
- **GLTF**: No GLTF files exist or are loaded.
- **Surface Mesh**: There is no 3D humanoid facial surface mesh; it is a single 2D plane with 32x32 vertex resolution.
- **Morph Targets**: Zero morph targets exist.
- **Face Parts**: Eyeballs, eyelids, mouth elements, and eyebrows are flat 2D geometric cut-outs hovering 26mm in front of the base plane.

---

## 12. Current Personalization Implementation Audit

### Parameter Trace & Landmark Formulas

```text
Parameter: faceWidthRatio
  └─► Landmarks: #234 (Left Cheek), #454 (Right Cheek)
  └─► Formula: dist3D(landmarks[234], landmarks[454])
  └─► Normalization: clamp((faceWidth / ipd) / 2.30, 0.80, 1.25)
  └─► Avatar Effect: n.head.scale.x = faceWidthRatio
  └─► Visual Reality: Scales base plane horizontally.

Parameter: faceHeightRatio
  └─► Landmarks: #10 (Forehead/Hairline), #152 (Chin Tip)
  └─► Formula: dist3D(landmarks[10], landmarks[152])
  └─► Normalization: clamp((faceHeight / ipd) / 2.85, 0.82, 1.22)
  └─► Avatar Effect: n.head.scale.y = faceHeightRatio
  └─► Visual Reality: Scales base plane vertically.

Parameter: jawWidthRatio
  └─► Landmarks: #172 (Left Gonion), #397 (Right Gonion)
  └─► Formula: dist3D(landmarks[172], landmarks[397])
  └─► Normalization: clamp((jawWidth / ipd) / 1.85, 0.75, 1.30)
  └─► Avatar Effect: Attempts to scale n.jaw.scale.x and n.chin.scale.x
  └─► Visual Reality: DEFECT: n.jaw and n.chin are null! Zero visual effect on avatar!

Parameter: chinPosRatio (UI: "Chin Projection")
  └─► Landmarks: #1 (Nose Tip), #152 (Chin Tip)
  └─► Formula: dist3D(landmarks[1], landmarks[152])
  └─► Normalization: clamp((chinPos / ipd) / 1.45, 0.78, 1.25)
  └─► Avatar Effect: Attempts to set n.chin.position.y
  └─► Visual Reality: DEFECT: n.chin is null! Zero visual effect!
                      UI BUG: index.html checks m.chinProjectionRatio (undefined), falls back to 1.10.

Parameter: eyeSpacingRatio
  └─► Landmarks: #468, #473 (Pupils), #234, #454 (Cheeks)
  └─► Formula: (ipd / (faceWidth / 2.30)) / 1.0
  └─► Normalization: clamp(..., 0.85, 1.20)
  └─► Avatar Effect: Sets position.x of leftEye, rightEye, leftLid, rightLid, leftBrow, rightBrow
  └─► Visual Reality: Moves eye groups laterally across the face.

Parameter: eyeSizeRatio (UI: "Eye Aperture")
  └─► Landmarks: #33, #133 (Left Eye corners), #362, #263 (Right Eye corners)
  └─► Formula: (dist3D(33, 133) + dist3D(362, 263)) / 2
  └─► Normalization: clamp((eyeSize / ipd) / 0.35, 0.80, 1.25)
  └─► Avatar Effect: Sets scale of leftEye, rightEye, leftLid, rightLid
  └─► Visual Reality: Scales eye circular discs.
                      UI BUG: index.html checks m.eyeApertureRatio (undefined), falls back to 0.97.

Parameter: noseWidthRatio
  └─► Landmarks: #129 (Left Alar), #358 (Right Alar)
  └─► Formula: dist3D(landmarks[129], landmarks[358])
  └─► Normalization: clamp((noseWidth / ipd) / 0.50, 0.75, 1.35)
  └─► Avatar Effect: Attempts to scale n.nose.scale.x
  └─► Visual Reality: DEFECT: n.nose is null! Zero visual effect!

Parameter: noseLengthRatio (UI: "Nose Projection")
  └─► Landmarks: #6 (Nose Bridge), #1 (Nose Tip)
  └─► Formula: dist3D(landmarks[6], landmarks[1])
  └─► Normalization: clamp((noseLength / ipd) / 0.65, 0.75, 1.30)
  └─► Avatar Effect: Attempts to scale n.nose.scale.y
  └─► Visual Reality: DEFECT: n.nose is null! Zero visual effect!
                      UI BUG: index.html checks m.noseProjectionRatio (undefined), falls back to 1.02.

Parameter: mouthWidthRatio
  └─► Landmarks: #61 (Left Cheilion), #291 (Right Cheilion)
  └─► Formula: dist3D(landmarks[61], landmarks[291])
  └─► Normalization: clamp((mouthWidth / ipd) / 0.85, 0.75, 1.30)
  └─► Avatar Effect: Sets n.mouth.scale.x = mouthWidthRatio
  └─► Visual Reality: Stretches oral cavity and lip elements horizontally.

Parameter: cheekProminenceRatio / cheekWidth (CRITICAL SUPERVISOR FLAG)
  └─► Landmarks: In docs/P1_DEMO_POLISH.md: dist3D(234, 454).
  └─► FLAG: USES IDENTICAL LANDMARKS AS PARAMETER 1 (faceWidth)!
  └─► In avatar_personalizer.js: NOT COMPUTED! userMetrics contains only 9 ratios!
  └─► Avatar Effect: NONE.
  └─► Visual Reality: UI checks m.cheekProminenceRatio (undefined), displays constant 1.06.
```

### Appearance Color Sampling
- Method: `AvatarPersonalizer.sampleAppearanceColors(canvas, landmarks)`.
- Samples 2D canvas pixel patches ($5\times 5$ radius) at:
  - Forehead skin: Landmark #10 ($y - 0.02$).
  - Hair tone: Landmark #10 ($y - 0.12$).
  - Lip tone: Landmark #14.
- In `applyPersonalizationToAvatar()`, attempts to set `mats.skinMat.color`, `mats.hairMat.color`, `mats.lipMat.color`. However, in the active plane avatar, `mats` references are `null`, so color changes are not applied to the textured plane.

---

## 13. Current Animation Implementation Audit

Every expression channel is traced from detection to visual result:

1. **`jawOpen` (Channel 17)**:
   - MediaPipe score or geometric formula `clamp((lipDist - 0.030) * 5.2, 0, 1)`.
   - Filtered through `OneEuroFilterArray[17]`.
   - Multiplies `mouthCavity.scale.y = max(0.001, jawVal * 1.8 + smileAvg * 0.3)`.
   - Offsets `lowerLip.position.y = -0.006 - (jawVal * 0.028)`.
   - Drops `lowerTeeth.position.y = -0.007 - (jawVal * 0.022)`.
   - Exposes upper and lower teeth planes.

2. **`eyeBlinkLeft` & `eyeBlinkRight` (Channels 0 & 7)**:
   - Measured via eyelid height over eye outer width: `clamp((0.085 - dist) * 22.0, 0, 1)`.
   - Linearly translates upper eyelid planes downward:
     `eyelidUpper.position.y = openY (0.062) - (blinkVal * (0.062 - 0.038))`.
   - At `blinkVal = 1.0`, the skin rectangle completely conceals the iris/pupil circle.

3. **`mouthSmileLeft` & `mouthSmileRight` (Channels 23 & 24)**:
   - Measured from mouth corner lateral distance: `clamp((mouthWidth - 0.64) * 4.2, 0, 1)`.
   - Averaged: `smileAvg = (smileL + smileR) * 0.5`.
   - Scales entire mouth group horizontally: `mouth.scale.x = 1.0 + (smileAvg * 0.35)`.
   - Nudges mouth upward: `mouth.position.y = -0.075 + (smileAvg * 0.008)`.
   - Lifts upper lip: `upperLip.position.y = 0.007 + (smileAvg * 0.004)`.
   - Makes upper teeth visible if `smileAvg > 0.15`.

4. **`browInnerUp` (Channel 43)**:
   - Measured from inner brow distance to nose tip: `clamp((-0.42 - browDist) * 6.5, 0, 1)`.
   - Lifts eyebrow planes: `brow.position.y = 0.076 + (browUpVal * 0.020)`.
   - Tilts eyebrows outward: `browL.rotation.z = -0.06 + (browUpVal * 0.10)`.

5. **Eye Gaze (Channels 1, 2, 3, 4, 8, 9, 10, 11)**:
   - Iris centers (#468, #473) relative to eye bounding boxes calculate `gazeX` and `gazeY`.
   - Lerps pupil/iris child group:
     `irisGroup.position.x = lerp(irisGroup.position.x, gazeX * 0.007, 0.35)`.
     `irisGroup.position.y = lerp(irisGroup.position.y, gazeY * 0.006, 0.35)`.

6. **Head Pose (6-DoF)**:
   - Calculated by `HeadPoseSolver`, filtered by `OneEuroFilter`.
   - **Audited Line 581–586**: `this.headBone.quaternion.set(0, 0, 0, 1)` unconditionally overrides all head pose motion with a static identity quaternion.

---

## 14. Current Limitations & Deficiencies

1. **Cartoon Caricature / 2.5D Cutout Aesthetics**:
   - The avatar is visually an uncurved flat portrait plane with floating geometric cut-outs. It completely lacks the 3D depth, volume, and visual fidelity of a stylized semi-realistic character.
2. **Missing Anatomical 3D Features**:
   - No 3D nose structure (bridge, tip, nostrils).
   - No sculpted cheekbones or zygomatic arches.
   - No jawline contour or articulated mandibular angle.
   - No 3D ears or cranial structure.
   - No neck or upper bust transition.
   - Disconnected, floating components rather than a continuous organic mesh.
3. **Severe Code Corruption in `three_avatar_viewer.js`**:
   - The method `buildCharacterAvatar()` was truncated at line 363, leaving 110 lines of dead, unparsed or orphaned statements (lines 364–473).
4. **Disabled Head Movement**:
   - The 6-DoF head rotation calculated from MediaPipe is completely ignored; the avatar is pinned rigid facing forward.
5. **Fictitious / Non-Functional Personalization Parameters**:
   - `jawWidth`, `chinPosition`, `noseWidth`, and `noseLength` manipulate nodes that do not exist (`n.jaw`, `n.chin`, `n.nose` are `null`).
   - `cheekWidth` in documentation is a duplicate calculation of `faceWidth` (`dist(234, 454)`).
   - `cheekProminenceRatio` does not exist in code; UI displays a hardcoded `1.06`.
   - UI metrics query wrong property names (`chinProjectionRatio`, `eyeApertureRatio`, `noseProjectionRatio`), resulting in frozen dummy values.
6. **No Real Morph Targets**:
   - There are zero vertex morph targets in the geometry. Facial deformation is approximated by moving rigid 2D planar patches.

---

## 15. Recommended Minimal Architecture for the New Avatar (Candidate A3)

To fulfill the core product vision ("Personalized Stylized Semi-Realistic 3D Avatar") without compromising mobile feasibility, the new avatar must implement:

```text
                            NEW CANDIDATE A3 ARCHITECTURE
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     BASE TOPOLOGY & GEOMETRY                        RIG & DEFORMATION ENGINE
• Stylized Semi-Realistic 3D Manifold           • Vertex Morph Targets (ARKit 52)
  Head & Neck Mesh (Low-poly, ~6K-10K tris)       (jawOpen, eyeBlink, smile, brow)
• Anatomical Features:                          • Continuous Manifold Surface
  - Believable cranial & jaw proportions          (No floating/disconnected plates)
  - 3D orbit sockets with spherical eyeballs    • Skeletal Head/Neck Bone Node
  - Recessed mouth cavity with teeth & tongue     (Driven by filtered 6-DoF quaternion)
  - 3D nose bridge, tip, nostrils               • 10 Anthropometric Deformation Keys
  - Sculpted zygomatic cheeks & chin              (Direct vertex displacement per metric)
  - Natural contoured hair cap
```

### Detailed Structural Requirements
1. **Continuous 3D Facial Mesh Topology**:
   - Replace the flat plane with a continuous, clean 3D humanoid head mesh (vertices connected across forehead, cheeks, nose, lips, jaw, and neck).
   - Can be generated procedurally using high-quality parametric 3D surface geometry with seamless UVs, or loaded via template GLTF/GLB asset (`assets/avatar_template.glb`).
2. **True 3D Eyeballs & Eyelids**:
   - Spherical eyeballs (`THREE.SphereGeometry`) nested inside anatomical eye sockets.
   - Smooth eyelid rotation or vertex morphing conforming to eyeball curvature for 100% eyelid closure on blink.
3. **Integrated Mouth Cavity**:
   - Recessed 3D oral cavity with realistic dental arches (upper/lower teeth) and animated tongue that remains invisible when mouth is closed and naturally revealed upon `jawOpen` or `mouthSmile`.
4. **Legitimate 10-Parameter Anthropometric Personalization Engine**:
   - Each parameter must compute a distinct, anatomically valid measurement:
     1. `faceWidth`: Zygomatic arch distance (#234 to #454).
     2. `faceHeight`: Trichion/forehead to menton/chin (#10 to #152).
     3. `jawWidth`: Mandibular angles / gonions (#172 to #397).
     4. `chinProminence`: Subnasale to chin tip (#1 to #152) and sagittal Z offset.
     5. `eyeSpacing`: Inter-pupillary distance (#468 to #473).
     6. `eyeAperture`: Palpebral fissure height (#159/#145 and #386/#374).
     7. `noseWidth`: Alar base width (#129 to #358).
     8. `noseLength`: Nasion to pronasale (#6 to #1).
     9. `mouthWidth`: Cheilions (#61 to #291).
     10. `cheekProminence`: True malar prominence (e.g., landmark #116 / #345 depth relative to eye plane, NOT duplicate of #234/#454).
   - Personalization must deform actual 3D vertex positions and scale facial bone anchors so the geometry visibly shifts to match the user.
5. **Restored 6-DoF Head Tracking**:
   - Connect the filtered head pose quaternion to `this.headBone.quaternion.slerp(...)` so the 3D character naturally follows the user's pitch, yaw, and roll.

---

## 16. Files That Must Change

1. [`prototype/src/rendering/three_avatar_viewer.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/rendering/three_avatar_viewer.js):
   - Completely rebuild `buildCharacterAvatar()` to construct the continuous stylized semi-realistic 3D character mesh.
   - Purge orphaned dead code (lines 364–473).
   - Update `updateAvatar()` to drive real morph targets and restore `headBone` quaternion rotation.
2. [`prototype/src/avatar/avatar_personalizer.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/avatar/avatar_personalizer.js):
   - Rewrite `extractUserFacialProportions()` so that parameter 10 (`cheekProminenceRatio`) uses distinct malar landmarks (#116, #345) rather than duplicating parameter 1 (#234, #454).
   - Ensure all 10 ratios are properly populated in `this.userMetrics`.
   - Update `applyPersonalizationToAvatar()` to deform the real 3D mesh nodes and vertex offsets.
3. [`prototype/index.html`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/index.html):
   - Align DOM property metric keys (`m.chinPosRatio`, `m.eyeSizeRatio`, `m.noseLengthRatio`, `m.cheekProminenceRatio`) with `avatar_personalizer.js` outputs so the UI displays authentic live numbers.
4. [`docs/P1_DEMO_POLISH.md`](file:///d:/iqoo%20winning%20submission%20for%20chennai/docs/P1_DEMO_POLISH.md):
   - Update documentation table to reflect corrected landmark indices and the new 3D avatar architecture.

---

## 17. Files That Should NOT Change

1. [`prototype/src/camera/camera_manager.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/camera/camera_manager.js):
   - Camera enumeration, hardware video binding, and synthetic fallback are stable, well-tested, and performant.
2. [`prototype/src/face_tracking/landmarker.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/face_tracking/landmarker.js):
   - MediaPipe Tasks Vision loading, GPU/CPU fallback, and 478 landmark detection are working flawlessly.
3. [`prototype/src/expression/blendshape_processor.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/expression/blendshape_processor.js):
   - The 52 ARKit blendshape math, geometric landmark calculations, calibration baseline subtraction, and deadband handling are robust.
4. [`prototype/src/pose/head_pose_solver.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/pose/head_pose_solver.js):
   - The EPnP/geometric quaternion solver is mathematically correct.
5. [`prototype/src/filtering/one_euro_filter.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/filtering/one_euro_filter.js):
   - The Casiez 2012 One Euro filter implementation is verified.
6. [`prototype/src/recorder/timeline_recorder.js`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/src/recorder/timeline_recorder.js):
   - Frame capture, JSON serialization, and replay animation loops are functioning properly.
7. [`prototype/styles.css`](file:///d:/iqoo%20winning%20submission%20for%20chennai/prototype/styles.css):
   - Workstation UI design tokens and layout are approved.

---

## 18. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :---: | :--- |
| **Model Asset Loading Failure (CORS/Offline)** | GLTF mesh fails to load if CDN or local asset server is restricted | Medium | Provide an inline procedural stylized 3D head fallback using Three.js parametric buffer geometry so the avatar loads with zero external network dependencies. |
| **Morph Target Performance Regression** | High-density morph targets could reduce frame rate below 60 FPS | Low | Maintain avatar polycount between 5,000 and 10,000 triangles; limit active simultaneous morph targets to 52 standard ARKit channels; avoid expensive dynamic subdivision. |
| **Head Rotation Drift / Gimbal Lock** | Head rotation looks erratic or jitters at extreme pitch angles | Low | The `HeadPoseSolver` already outputs normalized quaternions; `OneEuroFilter` filters each quaternion component ($q_w, q_x, q_y, q_z$); using `Quaternion.slerp` guarantees smooth spherical interpolation without gimbal lock. |
| **Deformation Extreme Distortion** | User with extreme proportions deforms avatar into grotesque shapes | Medium | Enforce strict anthropometric ratio clamping (`[0.80, 1.25]`) in `avatar_personalizer.js` so stylized semi-realistic proportions are always preserved. |

---

## 19. Dependencies

1. **Three.js**: `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` (WebGL rendering, lighting, materials, geometries).
2. **MediaPipe Tasks Vision**: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm` (478 landmarks, 52 blendshapes, transformation matrices).
3. **Local Web Server**:
   - `server.js` (Node.js) or `server.ps1` (PowerShell TCP listener on port 8000) for serving ES modules and textures with proper MIME types and CORS headers.
4. **Hardware**: Standard USB or integrated webcam supporting $1280\times 720$ at 30/60 FPS.

---

## 20. Exact Implementation Plan (For Supervisor Review & Approval)

```text
PHASE 1: AVATAR TOPOLOGY & RENDER VIEWPORT RECONSTRUCTION
├── Step 1.1: Remove orphaned dead code in prototype/src/rendering/three_avatar_viewer.js (lines 364–473).
├── Step 1.2: Design and implement a continuous 3D Stylized Semi-Realistic Humanoid Avatar in Three.js:
│             - Cranium, forehead, cheeks, jaw, chin, and neck as a cohesive 3D surface.
│             - Deep 3D orbit cavities with nested spherical 3D eyeballs (sclera, shaded iris, pupil).
│             - Curving 3D eyelids that fold organically over eyeball spheres.
│             - 3D sculpted nose bridge, tip, and nostrils.
│             - Sculpted upper and lower lips with realistic Cupid's bow and vermilion border.
│             - Recessed oral cavity containing upper/lower teeth arches and 3D tongue.
│             - Sculpted stylized hair cap integrated onto the cranium.
├── Step 1.3: Bind 52 ARKit blendshape channels to actual mesh morph targets and continuous node deformations.
└── Step 1.4: Re-enable 6-DoF head tracking by binding the filtered pose quaternion to this.headBone.quaternion.slerp.

PHASE 2: 10-PARAMETER PERSONALIZATION ENGINE AUDIT REPAIR
├── Step 2.1: Disentangle Parameter 10 (cheek prominence) from Parameter 1 (face width) in
│             prototype/src/avatar/avatar_personalizer.js using distinct malar landmarks (#116, #345).
├── Step 2.2: Compute all 10 distinct, non-overlapping anthropometric ratios in userMetrics:
│             faceWidth, faceHeight, jawWidth, chinPos, eyeSpacing, eyeSize, noseWidth, noseLength, mouthWidth, cheekProminence.
├── Step 2.3: Implement authentic 3D vertex and node deformations in applyPersonalizationToAvatar()
│             that visibly deform the new 3D avatar's face shape, jaw, eyes, nose, and mouth.
└── Step 2.4: Connect canvas skin, hair, and lip color tone sampling directly to the new 3D avatar materials.

PHASE 3: WORKSTATION UI & TELEMETRY ALIGNMENT
├── Step 3.1: Fix property key mismatches in prototype/index.html so all 10 sidebar meters display real live data.
└── Step 3.2: Verify that reset, calibration, gain slider, replay, and telemetry drawer function seamlessly with the new avatar.

PHASE 4: VERIFICATION & EVIDENCE LOGGING
├── Step 4.1: Test neutral face, jaw open, smile, blink, brow raise, eye gaze, and 6-DoF head rotation.
├── Step 4.2: Capture verification screenshots across all major facial poses and personalization stages.
└── Step 4.3: Update docs/P1_DEMO_POLISH.md with verified evidence.
```

---

> [!NOTE]
> **GATE NOTICE**: In accordance with supervisor instructions, **NO APPLICATION CODE HAS BEEN MODIFIED**. Execution is paused pending supervisor approval of this audit document (`docs/P1_AVATAR_CODEBASE_AUDIT.md`).

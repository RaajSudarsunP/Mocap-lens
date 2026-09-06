# Stage 1 — Knowledge Validation & Teach-Back Assessment

This document provides a comprehensive technical validation of the core computer vision, 3D geometry, mobile acceleration, and telemetry streaming principles underlying MocapLens AI. Each question is analyzed using the required four-part teach-back structure: **CONCEPT**, **EXPLANATION**, **MOCAPLENs APPLICATION**, and **ENGINEERING CONSEQUENCE**.

---

### Question 1: What is the difference between face detection, facial landmarks, face mesh, and blendshapes?

- **CONCEPT**: Hierarchical levels of spatial and semantic abstraction in facial computer vision.
- **EXPLANATION**:
  - *Face Detection*: Locates the bounding box rectangle $[x_{min}, y_{min}, w, h]$ containing a face within an image frame.
  - *Facial Landmarks*: Pinpoints key structural points (e.g. 5-point, 68-point) marking anatomical features (eyes, nose tip, chin).
  - *Face Mesh*: Dense 3D surface topology consisting of hundreds of spatial vertices (e.g. MediaPipe's 468/478 points) representing face geometry.
  - *Blendshapes*: Normalized semantic coefficients (0.0 to 1.0) quantifying muscle action intensities (e.g. `jawOpen`, `eyeBlinkLeft`, `mouthSmileRight`).
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes using MediaPipe FaceLandmarker to isolate the region of interest (ROI), extract a 468-point 3D Face Mesh, and regress blendshape weights using an Option B 109.9K Res-MLP regressor `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Attempting to run full face detection on every frame wastes compute cycles. MocapLens AI proposes a tracking loop: face detection runs once to initialize, followed by light landmark tracking across frames. Re-detection is triggered only if tracking confidence drops below threshold $\tau = 0.5$.

---

### Question 2: Why can't raw facial landmarks directly guarantee realistic avatar animation?

- **CONCEPT**: Geometric point clouds vs. semantic morph target deformations.
- **EXPLANATION**:
  Raw 3D landmarks represent point locations in camera space. They do not account for individual user facial proportions, lack character-specific mesh topology mapping, and suffer from monocular noise. Furthermore, 3D avatars are rigged using bone hierarchies and morph targets, not raw point clouds.
- **MOCAPLENs APPLICATION**:
  MocapLens AI converts 3D landmark displacements into a canonical 52 blendshape weight vector $[w_1, w_2, \dots, w_{52}]$ and head pose quaternion $q_{head}$ `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Directly mapping raw landmark positions to 3D avatar vertices requires matching exact mesh vertex topology. By regressing blendshapes, MocapLens AI abstracts facial motion into topology-agnostic parameter arrays that drive compatible 3D avatars (Candidate A3 Personalized Avatar) `[DESIGN PROPOSAL]`.

---

### Question 3: What is the difference between an Action Unit and a blendshape coefficient?

- **CONCEPT**: Anatomical muscle measurement (FACS) vs. graphics mesh deformation control.
- **EXPLANATION**:
  - *Action Unit (AU)*: Defined by Ekman's Facial Action Coding System (FACS) to describe physical muscle contraction (e.g. AU12 Zygomaticus major contraction).
  - *Blendshape Coefficient*: Scalar weight $w_i \in [0.0, 1.0]$ in computer graphics scaling a 3D vertex displacement delta vector $\Delta B_i = B_i - B_0$ relative to a neutral pose $B_0$.
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes outputting canonical 52 ARKit blendshape coefficients directly consumable by WebGL/Three.js rendering engines `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Action Units require an additional matrix translation layer to calculate vertex movements on 3D meshes. Using blendshapes allows direct array binding to `mesh.morphTargetInfluences` in Three.js, eliminating runtime remapping overhead.

---

### Question 4: Why is temporal filtering necessary?

- **CONCEPT**: Noise suppression in continuous time-series sensor predictions.
- **EXPLANATION**:
  Neural networks processing independent video frames suffer from subtle output variances caused by camera sensor noise, lighting fluctuations, and sub-pixel quantization. Without temporal filtering, micro-variations manifest as visual jitter and shaking on the 3D avatar.
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes filtering blendshape channels and quaternion components across time steps using an adaptive One Euro Filter `[DESIGN PROPOSAL - E03 REQUIRED]`.
- **ENGINEERING CONSEQUENCE**:
  Without filtering, avatar rendering looks unstable. Applying adaptive temporal filters (One Euro Filter) aims to attenuate static jitter while preserving responsiveness during rapid expressions. Parameters require E03 empirical measurement.

---

### Question 5: What is the latency-vs-smoothing tradeoff?

- **CONCEPT**: Phase delay vs. high-frequency noise attenuation in digital signal processing.
- **EXPLANATION**:
  - *Increased Smoothing*: Heavy low-pass filtering yields ultra-smooth motion but introduces phase delay (lag), making the avatar feel sluggish.
  - *Decreased Smoothing*: Zero-lag filtering responds instantly to user expressions but allows raw high-frequency noise through, causing avatar jitter.
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes evaluating the One Euro Filter ($1\text{\euro Filter}$) which dynamically adjusts its cutoff frequency $f_c$ based on signal velocity $|\dot{x}_t|$:
  $$f_c = f_{c,\min} + \beta |\dot{x}_t|$$
- **ENGINEERING CONSEQUENCE**:
  Fixed low-pass filters ruin real-time MoCap responsiveness. The One Euro Filter provides heavy smoothing during low velocity and opens the filter cutoff during high velocity. Actual latency and jitter attenuation require E03 empirical validation.

---

### Question 6: Why is subject-specific calibration useful?

- **CONCEPT**: Baseline normalization across diverse human morphological geometries.
- **EXPLANATION**:
  Human facial geometry varies widely: resting eye openness, lip thickness, and eyebrow height differ across individuals. An uncalibrated AI model may misinterpret a user's natural resting face as a slight squint or smile.
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes a 2-second neutral pose calibration routine that captures baseline values $\bar{w}_{neutral}$ and normalizes live expression weights `[DESIGN PROPOSAL]`:
  $$w_{calibrated} = \text{clamp}\left(\frac{w - \bar{w}_{neutral}}{1.0 - \bar{w}_{neutral}}, \, 0.0, \, 1.0\right)$$
- **ENGINEERING CONSEQUENCE**:
  Calibration prevents baseline drift, guarantees zero avatar expression artifacts at rest ($w = 0.0$), and ensures full dynamic range ($w = 1.0$) for every user without retraining neural network weights.

---

### Question 7: What is the difference between inference latency and end-to-end latency?

- **CONCEPT**: Neural network execution duration vs. complete system input-to-output pipeline duration.
- **EXPLANATION**:
  - *Inference Latency*: Time required solely for the model forward pass on mobile hardware.
  - *End-to-End Latency*: Total elapsed time from light hitting the camera sensor to the final rendered frame pixel update on the screen:
    $$T_{end-to-end} = T_{camera} + T_{preprocess} + T_{inference} + T_{postprocess} + T_{bridge} + T_{render}$$
- **MOCAPLENs APPLICATION**:
  MocapLens AI targets an end-to-end latency below 1 frame period ($<16.67\text{ ms}$) at target 60 FPS `[TARGET]`.
- **ENGINEERING CONSEQUENCE**:
  Model inference duration is only one component of total latency. Camera capture, preprocessing, transport, and WebGL rendering must be optimized concurrently using non-blocking asynchronous architectures.

---

### Question 8: Why might a model with higher accuracy be worse for MocapLens than a slightly less accurate model?

- **CONCEPT**: Accuracy vs. Computational Complexity (FLOPs), Memory Bandwidth, and Power Constraints on Mobile Edge Devices.
- **EXPLANATION**:
  A heavy temporal attention network (such as AtG-ContextNet, Springer 2026) achieves high benchmark precision but introduces an unalterable 12-frame sliding window buffer lag ($\sim 200\text{ ms}$) and requires domain-specific sequence fine-tuning. A single-frame bottleneck MLP regressor (Option B 109.9K Res-MLP, $0.22\text{ MFLOPs}$) provides zero sliding-window buffer lag and zero-shot deployment feasibility `[DESIGN PROPOSAL]`.
- **MOCAPLENs APPLICATION**:
  MocapLens AI prioritizes low FLOPs, low parameter footprint, single-frame zero-delay models over heavy temporal sliding-window architectures.
- **ENGINEERING CONSEQUENCE**:
  Selecting heavy temporal models breaks real-time interactivity targets. MocapLens AI selects a lightweight single-frame bottleneck Res-MLP regressor candidate for mobile execution.

---

### Question 9: What information is lost when facial MoCap uses only a monocular RGB camera instead of depth?

- **CONCEPT**: Monocular scale ambiguity and depth ($Z$-axis) unobservability.
- **EXPLANATION**:
  A single 2D RGB camera projects 3D spatial points into a 2D plane ($x = f \frac{X}{Z}, y = f \frac{Y}{Z}$). Moving the head backward along the $Z$-axis produces the exact same 2D pixel shift as scaling down facial dimensions. RGB-D cameras measure physical distance $Z$ directly.
- **MOCAPLENs APPLICATION**:
  MocapLens AI addresses monocular depth ambiguity using canonical 3D mesh priors and Perspective-n-Point (PnP) geometric optimization `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Absolute translation $T_z$ in monocular MoCap must be normalized or bound to prevent virtual avatar zooming artifacts when the user tilts or turns their head.

---

### Question 10: How does a facial blendshape coefficient ultimately drive a 3D avatar?

- **CONCEPT**: Linear morph target vertex displacement interpolation in WebGL/3D graphics pipelines.
- **EXPLANATION**:
  A 3D character mesh contains a base neutral vertex array $V_0 \in \mathbb{R}^{V \times 3}$ and 52 pre-sculpted offset delta arrays $\Delta V_i \in \mathbb{R}^{V \times 3}$. When a blendshape coefficient $w_i = 0.75$ is received, the WebGL vertex shader executes linear vertex displacement:
  $$V_{final} = V_0 + \sum_{i=1}^{52} w_i \cdot \Delta V_i$$
- **MOCAPLENs APPLICATION**:
  The MocapLens WebGL viewer binds incoming 52-float telemetry packets directly to `mesh.morphTargetInfluences` array indices in Three.js `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Morph target evaluation happens on the laptop GPU via parallel vertex shaders, enabling efficient 3D avatar rendering without CPU bottlenecks.

---

### Question 11: Why should MocapLens transmit facial parameters rather than camera video to the laptop?

- **CONCEPT**: Data compression ratio, bandwidth savings, latency reduction, and privacy preservation.
- **EXPLANATION**:
  - *Streaming 1080p60 Video*: Requires $373\text{ MB/sec}$ raw data, or compressed video stream consuming $15-30\text{ Mbps}$ bandwidth with video encode/decode latency.
  - *Streaming Parameter Array*: 260-byte proposed application payload ($\sim 288$ bytes transmitted UDP packet) at target 60 Hz consumes only $\sim 17.28\text{ KB/sec}$ ($0.138\text{ Mbps}$) `[PROPOSED PROTOCOL SPECIFICATION]`.
- **MOCAPLENs APPLICATION**:
  MocapLens AI performs all computer vision processing on device and streams only compact binary telemetry packets across the local transport channel `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Achieves a massive bandwidth reduction, minimal network transit time, zero video compression artifacts, and user privacy (facial video frames never leave the smartphone).

---

### Question 12: What makes an AI model suitable or unsuitable for smartphone deployment?

- **CONCEPT**: Hardware operator compatibility, memory footprint, memory bandwidth bounds, and delegate support.
- **EXPLANATION**:
  - *Suitable*: Lightweight CNN / MLP architectures with static tensor shapes, low parameter size, FP16/INT8 quantization support, and compatibility with LiteRT / TensorFlow Lite hardware delegates.
  - *Unsuitable*: Dynamic tensor shapes, unquantized FP32 weights, unsupported PyTorch operators, dynamic sliding sequence buffers, and large memory footprints ($>50\text{ MB}$).
- **MOCAPLENs APPLICATION**:
  MocapLens AI proposes using MediaPipe Tasks Vision SDK and LiteRT runtimes with a 109.9K parameter bottleneck Res-MLP regressor `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Qualcomm NPU / AI Engine Direct is the preferred acceleration target; actual delegate availability, operator compatibility, and latency require E02 validation on the selected iQOO device.

---

### Question 13: What must be measured on the actual iQOO device before claiming real-time performance?

- **CONCEPT**: Empirical hardware profiling vs. theoretical paper benchmarks.
- **EXPLANATION**:
  Published papers state performance under specific desktop or laboratory hardware. Real mobile performance depends on device-specific delegate support, thermal throttling curves, CameraX buffer copy speeds, and OS thread contention.
- **MOCAPLENs APPLICATION**:
  MocapLens AI establishes 5 mandatory empirical benchmarks to be conducted in Stage 2 upon supervisor authorization:
  1. Experiment E01: CameraX 60 FPS Capture Benchmark.
  2. Experiment E02: LiteRT Delegate Latency Benchmark (CPU vs GPU vs NPU).
  3. Experiment E03: One Euro Filter Latency vs. Jitter Tradeoff Test.
  4. Experiment E04: Local Socket & Transport Latency Test.
  5. Experiment E05: 15-Minute Thermal Soak & Sustained Performance Test.
- **ENGINEERING CONSEQUENCE**:
  Prevents performance surprises during live stage pitch demonstrations under venue conditions.

---

### Question 14: What parts of the MocapLens pipeline are AI, and what parts are conventional engineering?

- **CONCEPT**: Decoupling learned neural representation models from deterministic geometric algorithms and software architecture.
- **EXPLANATION**:
  - **AI / Deep Learning Components**:
    - Face detection neural network (BlazeFace).
    - 468-point 3D facial landmark regression network.
    - Option B 109.9K Bottleneck Res-MLP Blendshape Regressor `[DESIGN PROPOSAL]`.
  - **Conventional Engineering Components**:
    - Candidate A3 Personalized Avatar GLTF bone scale deformation.
    - Android CameraX image stream capture and YUV preprocessing.
    - EPnP 3D head pose matrix math and quaternion derivation.
    - One Euro Filter temporal signal smoothing and deadband clamping.
    - User neutral pose baseline subtraction.
    - 260-byte binary packet serialization and local transport socket.
    - Three.js WebGL vertex shader morph target rendering engine and `.BVH` exporter.
- **MOCAPLENs APPLICATION**:
  MocapLens AI integrates learned NPU representations with deterministic C++/Kotlin/JS engineering modules `[DESIGN PROPOSAL]`.
- **ENGINEERING CONSEQUENCE**:
  Using conventional engineering for head pose, filtering, and retargeting allows instant mathematical parameter tuning without retraining deep neural networks.

---

### Question 15: What are the major technical risks in the proposed architecture?

- **CONCEPT**: Identification and mitigation of single-point engineering failures.
- **EXPLANATION**:
  1. *Risk 1: Low-Light Motion Blur*: Low light drops front camera capture rate or increases exposure blur.
     - *Mitigation*: Enable CameraX exposure lock and low-light gain compensation `[DESIGN PROPOSAL]`.
  2. *Risk 2: Network Transport Jitter*: Wireless socket jitter under crowded venue environments.
     - *Mitigation*: Support USB cable ADB reverse port tethering (`adb reverse tcp:8080 tcp:8080`) as fallback connection `[DESIGN PROPOSAL - E04 REQUIRED]`.
  3. *Risk 3: Model Operator Hardware Fallback*: NPU delegate rejecting model operators, falling back to CPU.
     - *Mitigation*: Qualcomm NPU / AI Engine Direct is preferred target; GPU/CPU fallback chain configured `[DESIGN PROPOSAL - E02 REQUIRED]`.
  4. *Risk 4: Expression Overshoot / Avatar Distortion*: Blendshape gain mismatch causing avatar mesh self-intersection.
     - *Mitigation*: Implement configurable expression sensitivity gain sliders and clamping buffers in WebGL viewer `[DESIGN PROPOSAL]`.
- **MOCAPLENs APPLICATION**:
  All four mitigations are architected directly into the MocapLens AI system design proposals.
- **ENGINEERING CONSEQUENCE**:
  Guarantees robust demonstration resilience during live stage presentation regardless of venue conditions.

---

## Technical Validation Sign-Off
- **Status**: Stage 1 Knowledge Validation Updated & Verified
- **Target Platform**: iQOO Mobile Device + Laptop 3D Engine
- **Gate Status**: **STAGE 1 PROVISIONALLY SELECTED — STAGE 2 REMAINS LOCKED & BLOCKED**

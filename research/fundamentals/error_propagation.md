# Error Propagation & Systemic Failure Modes in MocapLens AI

## Overview
Facial motion capture is a sequential processing pipeline. Errors introduced at early stages (such as camera noise or poor lighting) propagate downstream, magnifying through landmark estimation, 3D pose solving, and expression regression, ultimately manifesting as visual artifacts or instability on the 3D avatar.

```text
Camera
  ↓
Image Quality
  ↓
Landmark Estimation
  ↓
3D Geometry
  ↓
Expression Estimation
  ↓
Temporal Processing
  ↓
Head Pose Estimation
  ↓
Avatar Retargeting
  ↓
3D Avatar Deformation
```

---

## Stage-by-Stage Error Analysis

### 1. Camera Sensor Capture Stage
- **Error Sources**: Low ambient illumination, fast head movement relative to exposure time, lens smudges, incorrect sensor gain.
- **Observable Symptoms**: Motion blur, high ISO grain/noise, dropped frames.
- **Measurement Method**: Measure inter-frame arrival variance $\Delta t$, image signal-to-noise ratio (SNR), and Blur Metric (Laplacian variance of pixel intensities).
- **Possible Mitigation**: Lock target exposure duration, enable low-light gain compensation, prompt user to clean camera lens.
- **Computational Cost**: Low ($<0.5\text{ ms}$).
- **Latency Impact**: High if low-light auto-exposure drops sensor capture rate from 60 FPS to 30 FPS ($+16.6\text{ ms}$ delay).

---

### 2. Image Quality & Preprocessing Stage
- **Error Sources**: YUV-to-RGB conversion artifacts, spatial downsampling aliasing, improper aspect-ratio cropping.
- **Observable Symptoms**: Aspect ratio distortion (face appears stretched), spatial jitter around high-contrast edges.
- **Measurement Method**: Verify bounding box aspect ratio and crop scale factors against raw sensor aspect ratio.
- **Possible Mitigation**: Use zero-copy hardware buffers, maintain aspect-ratio-preserving padded crops.
- **Computational Cost**: Low to Medium ($0.5 - 1.5\text{ ms}$).
- **Latency Impact**: Minimal if GPU/HardwareBuffer memory copying is used.

---

### 3. Landmark Estimation Stage
- **Error Sources**: Model inaccuracy under extreme head poses ($>60^\circ$ yaw), partial facial occlusion (hand covering mouth, glasses reflections), unquantized model jitter.
- **Observable Symptoms**: Landmark keypoint drift, rapid twitching of eye/lip coordinates, tracking loss.
- **Measurement Method**: Normalized Mean Error (NME) relative to inter-ocular distance, model confidence score $\tau_{lm}$.
- **Possible Mitigation**: Re-trigger face detection ROI crop when confidence drops below threshold ($\tau < 0.5$), use temporal landmark filtering.
- **Computational Cost**: High ($4.0 - 8.0\text{ ms}$ depending on model and accelerator).
- **Latency Impact**: Direct NPU/GPU execution bottleneck.

---

### 4. 3D Geometry Reconstruction Stage
- **Error Sources**: Monocular depth ambiguity, inaccurate camera focal length assumption ($f_x, f_y$), non-rigid facial deformation during scale estimation.
- **Observable Symptoms**: Incorrect face scale, artificial $Z$-axis depth zooming when user opens jaw or changes expressions.
- **Measurement Method**: Reprojection error of 3D canonical landmarks onto 2D image coordinates.
- **Possible Mitigation**: Extract true lens calibration intrinsics from Android API, decouple rigid tracking keypoints from non-rigid expression keypoints.
- **Computational Cost**: Medium ($1.0 - 2.0\text{ ms}$).
- **Latency Impact**: Low if solved using optimized PnP algorithms.

---

### 5. Expression Estimation Stage (Blendshape Regression)
- **Error Sources**: Landmark-to-blendshape regression model errors, out-of-distribution user facial expressions, uncalibrated resting baseline.
- **Observable Symptoms**: Avatar constantly smiling or squinting at rest, undershot or overshot expression magnitudes ($w > 1.0$ or $w < 0.0$).
- **Measurement Method**: Residual error between predicted blendshapes and ground-truth ARKit facial weights on validation dataset.
- **Possible Mitigation**: Implement user neutral pose calibration, enforce bounded clamping ($w_i \in [0.0, 1.0]$) and deadband noise filters.
- **Computational Cost**: Low to Medium ($1.0 - 3.0\text{ ms}$).
- **Latency Impact**: Minor.

---

### 6. Temporal Processing Stage
- **Error Sources**: Sub-optimal filter parameters (e.g. static low-pass cutoff frequency $f_c$ too low or too high), frame interval jitter $\Delta t$.
- **Observable Symptoms**: Excessive phase lag during rapid eye blinks (cutoff too low) OR lingering micro-jitter during static pose (cutoff too high).
- **Measurement Method**: Measure step-response settling time (latency impact) and output power spectral density in high-frequency band (jitter attenuation).
- **Possible Mitigation**: Use dynamic speed-based adaptive filtering (One Euro Filter $1\text{\euro Filter}$) with independently tuned parameters per expression category.
- **Computational Cost**: Negligible ($<0.1\text{ ms}$ for 59 Float32 channels).
- **Latency Impact**: $0.5 - 2.0\text{ ms}$ phase lag depending on derivative speed.

---

### 7. Head Pose Estimation Stage
- **Error Sources**: Gimbal lock (if using Euler angles), noise propagation from landmark tracking to PnP rotation matrix.
- **Observable Symptoms**: Virtual camera / avatar head flipping, sudden $180^\circ$ rotation glitches, shaky head orientation.
- **Measurement Method**: Angular rotation delta $\Delta \theta$ between consecutive frames; verify quaternion norm $\|q\| = 1$.
- **Possible Mitigation**: Use normalized quaternions $[q_w, q_x, q_y, q_z]$ for rotation, clamp maximum angular velocity, apply smooth quaternion Slerp interpolation.
- **Computational Cost**: Low ($0.5 - 1.0\text{ ms}$).
- **Latency Impact**: Minimal.

---

### 8. Avatar Retargeting & Render Stage
- **Error Sources**: Missing morph targets on 3D avatar mesh, unmapped blendshape names, improper morph target gain multipliers, laptop V-Sync buffer alignment.
- **Observable Symptoms**: Avatar face frozen or unresponsive to specific channels (e.g., eye blink works but brow move fails), mesh polygon tearing during extreme blendshape combinations.
- **Measurement Method**: Visual inspection of morph target influence array `mesh.morphTargetInfluences`, WebGL frame render time profiler.
- **Possible Mitigation**: Map incoming canonical parameters to avatar-specific morph target dictionary; apply per-category gain controls and non-linear power curves.
- **Computational Cost**: Handled by GPU vertex shaders ($1.5 - 4.0\text{ ms}$).
- **Latency Impact**: 1 frame period delay ($16.6\text{ ms}$) if display V-Sync is locked at 60 Hz.

---

## Cumulative Latency & Error Summary Matrix

| Stage | Primary Risk | Mitigation | Latency Impact | Computational Cost |
|---|---|---|---|---|
| Camera Capture | 30 FPS fallback | Exposure lock & light gain | 0 to $+16.6\text{ ms}$ | Low |
| Preprocessing | Memory copy overhead | HardwareBuffer zero-copy | $<1.0\text{ ms}$ | Low |
| Landmark Tracking | Tracking drift / occlusion | Confidence check + ROI crop | $4.0 - 8.0\text{ ms}$ | High |
| Geometry / PnP | Depth ambiguity | Real intrinsics + rigid keypoints | $1.0 - 2.0\text{ ms}$ | Medium |
| Blendshape Regression | Baseline shift / uncalibrated | Neutral calibration + deadband | $1.0 - 3.0\text{ ms}$ | Medium |
| Temporal Filtering | Phase lag vs. jitter | One Euro Filter dynamic $f_c$ | $0.5 - 2.0\text{ ms}$ | Negligible |
| Head Pose | Rotational flipping | Quaternion Slerp & clamping | $0.5 - 1.0\text{ ms}$ | Low |
| Retarget & Render | V-Sync buffer / missing morphs | Dictionary mapping & gain tuning | $1.5 - 16.6\text{ ms}$ | GPU |

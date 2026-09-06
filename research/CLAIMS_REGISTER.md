# MocapLens AI — Claims Register

This register serves as the authoritative log for all technical claims made about MocapLens AI. No technical capability or performance metric may be presented as achieved unless it is backed by empirical evidence recorded in this register.

---

## Claim Structure Standard

Every entry strictly follows this traceability chain:

```text
CLAIM: [Specific performance or technical capability assertion]
TYPE: [TARGET | DESIGN PROPOSAL | PAPER-REPORTED | FACT | UNVERIFIED]
EVIDENCE: [Empirical measurement / benchmark log / literature source]
DEVICE / CONTEXT: [Hardware platform or runtime environment]
STATUS: [UNVERIFIED | EXPERIMENTALLY VERIFIED]
```

---

## Registered Claims Log

### Claim C01: Sustained 60 FPS Camera Capture
- **CLAIM**: MocapLens AI aims to sustain a 60 FPS camera capture and frame processing stream on target mobile hardware.
- **TYPE**: `[TARGET]`
- **EVIDENCE**: Pending empirical device benchmark (Experiment E01).
- **DEVICE / CONTEXT**: Target smartphone front camera (CameraX API).
- **STATUS**: `[UNVERIFIED - E01 REQUIRED]`

---

### Claim C02: Low-Latency On-Device Model Inference
- **CLAIM**: Candidate facial tracking models aim to execute on-device within a low millisecond budget per frame.
- **TYPE**: `[TARGET]`
- **EVIDENCE**: Pending LiteRT / ONNX Runtime benchmark (Experiment E02).
- **DEVICE / CONTEXT**: Target mobile SoC (Qualcomm NPU / Adreno GPU / CPU fallback).
- **STATUS**: `[UNVERIFIED - E02 REQUIRED]`

---

### Claim C03: End-to-End Latency Below 1 Frame Period
- **CLAIM**: Target total end-to-end latency from light capture to laptop 3D avatar deformation is $<16.67\text{ ms}$.
- **TYPE**: `[TARGET]`
- **EVIDENCE**: Pending end-to-end timestamp synchronization benchmark.
- **DEVICE / CONTEXT**: Mobile Phone + Laptop 3D Viewport.
- **STATUS**: `[UNVERIFIED - TARGET]`

---

### Claim C04: Low-Bandwidth Telemetry Network Stream
- **CLAIM**: Telemetry streaming payload is modeled to consume $<20\text{ KB/s}$ network bandwidth over local socket transport.
- **TYPE**: `[PROPOSED PROTOCOL SPECIFICATION]`
- **EVIDENCE**: Calculated theoretical packet size: 260 bytes payload, 288 bytes transmitted UDP/IP packet $\times 60 \text{ Hz} = 17.28 \text{ KB/s} \quad (0.138 \text{ Mbps})$. (Empirical measurement pending Experiment E04).
- **DEVICE / CONTEXT**: Mobile Phone to Laptop Bridge (Wi-Fi WebSocket / USB reverse socket).
- **STATUS**: `[UNVERIFIED - E04 REQUIRED]`

---

### Claim C05: Sustained Thermal & Frame Stability
- **CLAIM**: MocapLens AI aims to operate continuously for 15 minutes without severe thermal throttling or frame rate degradation.
- **TYPE**: `[TARGET]`
- **EVIDENCE**: Pending 15-minute empirical thermal soak test (Experiment E05).
- **DEVICE / CONTEXT**: Target smartphone hardware.
- **STATUS**: `[UNVERIFIED - E05 REQUIRED]`

---

### Claim C06: Personalized Semi-Realistic Facial Proportions (Candidate A3)
- **CLAIM**: Candidate A3 deforms base GLTF avatar skeleton bone scales and proportion channels (IPD, jaw width, nose bridge, eye scale) matching user 3D face mesh metrics to produce personalized semi-realistic facial proportions.
- **TYPE**: `[DESIGN PROPOSAL]`
- **EVIDENCE**: Initial Three.js GLTF bone scaling design model.
- **DEVICE / CONTEXT**: Three.js / WebGL 3D Avatar Render Engine.
- **STATUS**: `[UNVERIFIED - PROTOTYPE VALIDATION REQUIRED]`

---

## Verification Rules
1. Claims marked `[UNVERIFIED]` or `[TARGET]` must NEVER be presented as completed achievements.
2. Only after an empirical experiment is conducted and logged may the status be upgraded to `[EXPERIMENTALLY VERIFIED]`.

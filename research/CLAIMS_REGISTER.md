# MocapLens AI — Claims Register

This register serves as the authoritative log for all technical claims made about MocapLens AI. No technical capability or performance metric may be presented as achieved unless it is backed by empirical evidence recorded in this register.

---

## Claim Structure Standard

Every entry must strictly follow this traceability chain:

```text
CLAIM: [Specific performance or technical capability assertion]
EVIDENCE: [Empirical measurement / benchmark log / test result]
DEVICE: [Exact hardware configuration tested]
MODEL / RUNTIME: [Exact neural network model and accelerator delegate]
INPUT: [Resolution, frame format, illumination condition]
RESULT: [Quantified measured output]
STATUS: [UNVERIFIED | EXPERIMENTALLY VERIFIED]
```

---

## Registered Claims

### Claim C01: Sustained 60 FPS Capture
- **CLAIM**: MocapLens AI achieves sustained 60 FPS camera capture and frame processing on target mobile hardware.
- **EVIDENCE**: Pending empirical device benchmark.
- **DEVICE**: Target smartphone (To Be Tested).
- **MODEL / RUNTIME**: Candidate CameraX pipeline + MediaPipe / TFLite delegate.
- **INPUT**: $1920 \times 1080$ @ 60 FPS front camera stream.
- **RESULT**: TBD (Target: $60.0 \pm 0.5 \text{ FPS}$).
- **STATUS**: `[UNVERIFIED - TARGET]`

---

### Claim C02: Low-Latency On-Device Model Inference
- **CLAIM**: Candidate facial tracking model executes on-device in $<8.0\text{ ms}$ per frame.
- **EVIDENCE**: Pending LiteRT / ONNX Runtime benchmark.
- **DEVICE**: Target mobile SoC (Snapdragon NPU / Adreno GPU).
- **MODEL / RUNTIME**: Candidate 3D Face Mesh & Blendshape Regressor.
- **INPUT**: $256 \times 256$ ROI tensor.
- **RESULT**: TBD (Target: $<8.0\text{ ms}$).
- **STATUS**: `[UNVERIFIED - TARGET]`

---

### Claim C03: End-to-End Latency Below 1 Frame Period
- **CLAIM**: Total end-to-end latency from light capture to laptop 3D avatar deformation is $<16.67\text{ ms}$.
- **EVIDENCE**: Pending end-to-end timestamp synchronization benchmark.
- **DEVICE**: Mobile Phone + Laptop 3D Viewport.
- **MODEL / RUNTIME**: Full MocapLens Pipeline.
- **INPUT**: Live facial motion capture performance.
- **RESULT**: TBD (Target: $<16.67\text{ ms}$).
- **STATUS**: `[UNVERIFIED - TARGET]`

---

### Claim C04: Low-Bandwidth Telemetry Network Stream
- **CLAIM**: Parameter streaming payload consumes $<20\text{ KB/s}$ network bandwidth over local socket bridge.
- **EVIDENCE**: Pending network socket Wireshark trace.
- **DEVICE**: Mobile Phone to Laptop Bridge.
- **MODEL / RUNTIME**: 59 Float32 Parameter Packet (Binary over WebSocket/UDP).
- **INPUT**: 60 Hz parameter array stream.
- **RESULT**: Calculated theoretical payload: $276 \text{ bytes/packet} \times 60 \text{ Hz} = 16.56 \text{ KB/s}$ (Empirical measurement pending).
- **STATUS**: `[UNVERIFIED - THEORETICAL MODEL]`

---

### Claim C05: Sustained Thermal Stability
- **CLAIM**: MocapLens AI operates continuously for $>15$ minutes without thermal throttling or frame rate degradation.
- **EVIDENCE**: Pending 15-minute empirical thermal soak test.
- **DEVICE**: Target smartphone.
- **MODEL / RUNTIME**: Full mobile tracking pipeline.
- **INPUT**: Continuous front camera video feed.
- **RESULT**: TBD.
- **STATUS**: `[UNVERIFIED - TARGET]`

---

## Verification Rules
1. Claims marked `[UNVERIFIED - TARGET]` or `[UNVERIFIED - THEORETICAL MODEL]` must NEVER be presented to external stakeholders or juries as completed achievements.
2. Only after an empirical experiment is conducted and logged may the status be upgraded to `[EXPERIMENTALLY VERIFIED]`.

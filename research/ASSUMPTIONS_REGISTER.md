# MocapLens AI — Assumptions Register

This register documents every major technical assumption made across the MocapLens AI architecture. Every assumption is categorized, assigned a risk level, and associated with a specific empirical verification method to be executed in subsequent project stages.

| ID | Assumption | Category | Evidence | Risk | Verification Method | Status |
|---|---|---|---|---|---|---|
| A01 | Smartphone front camera natively supports sustained 60 FPS hardware capture under typical indoor lighting. | Hardware | CameraX specs / Paper literature | High | Empirical CameraX FPS benchmark on target phone under indoor lighting. | UNVERIFIED |
| A02 | Candidate neural network model can execute on target mobile hardware accelerator (NPU/GPU) in $<8.0\text{ ms}$ per frame. | Deployment | TFLite / LiteRT paper claims | High | Empirical LiteRT / ONNX mobile benchmark on target SoC. | UNVERIFIED |
| A03 | All TFLite/ONNX model operators used by candidate models are 100% compatible with hardware NPU delegate without CPU fallback. | Deployment | TFLite Delegate Docs | High | Run TFLite Benchmark Tool with GPU/NPU delegate enabled; inspect delegate log output. | UNVERIFIED |
| A04 | iQOO Office Kit or underlying local network interface permits low-latency local TCP/UDP socket streaming in Airplane Mode. | Integration | Android Local Socket Docs | High | Test local socket communication between phone and laptop without internet connection. | UNVERIFIED |
| A05 | USB reverse port tethering (`adb reverse` / USB serial socket) is accessible and provides stable packet transfer without OS security blocking. | Integration | ADB Documentation | Medium | Execute `adb reverse tcp:8080 tcp:8080` and measure throughput and jitter over physical USB cable. | UNVERIFIED |
| A06 | A canonical parameter set of 52 ARKit-style blendshapes is sufficient to drive arbitrary 3D avatars without loss of key expressions. | Representation | ARKit Standard Docs / Literature | Medium | Evaluate expressiveness on Ready Player Me, Mixamo, and stylized 3D avatar meshes. | OPEN |
| A07 | One Euro Filter adaptive parameters ($\beta, f_{c,\min}$) can eliminate static jitter without introducing $>2.0\text{ ms}$ perceptual phase lag. | Filtering | Casiez et al. (2012) Paper | Medium | Measure output step response phase lag and high-frequency power spectral density. | UNVERIFIED |
| A08 | A 2-second neutral pose calibration routine is sufficient to normalize user-specific resting facial morphology differences. | Calibration | Literature on facial rigging | Medium | User study evaluating resting expression zero-point offset across 5 distinct individuals. | OPEN |
| A09 | 3D head pose PnP estimation using rigid facial keypoints is decoupled from non-rigid mouth/eye expressions. | Geometry | EPnP / PnP Literature | Low | Test PnP head pose output stability while user executes extreme facial expressions (max jaw open, max smile). | UNVERIFIED |
| A10 | Continuous 60 FPS camera capture and NPU inference for $>15$ minutes does not trigger aggressive thermal throttling on target phone. | Hardware / Thermal | Vendor SoC claims | High | Sustained 15-minute empirical performance test measuring temperature, battery drain, and FPS drop. | UNVERIFIED |
| A11 | Transmitted binary telemetry packet size ($\sim 248 - 296 \text{ bytes}$) yields network bandwidth $<20\text{ KB/s}$, eliminating network queuing bottlenecks. | Networking | Protocol payload calculations | Low | Capture network socket trace using Wireshark / Chrome DevTools during 60 Hz streaming. | UNVERIFIED |
| A12 | WebGL / Three.js vertex shader morph target evaluation on laptop GPU introduces $<4.0\text{ ms}$ render overhead per frame. | Rendering | Three.js benchmarks | Low | Profile WebGL frame render duration using `requestAnimationFrame` timing performance API. | UNVERIFIED |

---

## Status Definitions
- **UNVERIFIED**: Assumption requires empirical measurement or hardware testing.
- **OPEN**: Assumption under evaluation during Stage 1 / Stage 2 design.
- **EXPERIMENTALLY VERIFIED**: Assumption confirmed by empirical evidence gathered on actual hardware.

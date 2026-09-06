# MocapLens AI — Assumptions Register

This register documents every major technical assumption made across the MocapLens AI architecture. Every assumption is categorized, assigned a risk level, and associated with a specific empirical verification method to be executed in Stage 2.

| ID | Assumption | Category | Evidence | Risk | Verification Method | Status |
|---|---|---|---|---|---|---|
| A01 | Smartphone front camera natively supports sustained 60 FPS hardware capture under typical indoor lighting. | Hardware | CameraX specs / Literature | High | Empirical CameraX FPS benchmark on target phone (Experiment E01). | UNVERIFIED |
| A02 | Candidate neural network model can execute on target mobile hardware accelerator in a low millisecond budget per frame. | Deployment | TFLite / LiteRT specs | High | Empirical LiteRT benchmark on target SoC (Experiment E02). | UNVERIFIED |
| A03 | Qualcomm NPU / AI Engine Direct delegate supports all candidate model operators without falling back to CPU. | Deployment | TFLite Delegate Docs | High | Run TFLite Benchmark Tool with GPU/NPU delegate enabled on target phone. | UNVERIFIED |
| A04 | iQOO Office Kit or underlying local network interface permits low-latency local TCP/UDP socket streaming in Airplane Mode. | Integration | Android Local Socket Docs | High | Test local socket communication between phone and laptop without internet connection. | UNVERIFIED |
| A05 | USB reverse port tethering (`adb reverse` / USB serial socket) is accessible and provides stable packet transfer without OS security blocking. | Integration | ADB Documentation | Medium | Execute `adb reverse tcp:8080 tcp:8080` and measure latency and jitter over USB cable (Experiment E04). | UNVERIFIED |
| A06 | A canonical parameter set of 52 ARKit-style blendshapes is sufficient to drive target 3D avatars without loss of key expressions. | Representation | ARKit Standard Docs | Medium | Evaluate expressiveness on Ready Player Me and custom 3D avatar meshes. | OPEN |
| A07 | One Euro Filter adaptive parameters ($\beta, f_{c,\min}$) can eliminate static jitter without introducing unalterable phase lag. | Filtering | Casiez et al. (2012) Paper | Medium | Measure output step response phase lag and static variance (Experiment E03). | UNVERIFIED |
| A08 | A 2-second neutral pose calibration routine is sufficient to normalize user-specific resting facial morphology differences. | Calibration | Literature on facial rigging | Medium | User study evaluating resting expression zero-point offset across 5 distinct individuals. | OPEN |
| A09 | 3D head pose PnP estimation using rigid facial keypoints is decoupled from non-rigid mouth/eye expressions. | Geometry | EPnP / PnP Literature | Low | Test PnP head pose output stability while user executes extreme facial expressions. | UNVERIFIED |
| A10 | Continuous 60 FPS camera capture and model inference for 15 minutes does not trigger aggressive thermal throttling on target phone. | Hardware / Thermal | Vendor SoC claims | High | Sustained 15-minute empirical performance test measuring temperature and FPS drop (Experiment E05). | UNVERIFIED |
| A11 | Proposed binary telemetry payload (260 bytes payload, 288 bytes UDP packet) yields network bandwidth $<20\text{ KB/s}$, eliminating queuing bottlenecks. | Networking | Protocol payload calculations | Low | Capture network socket trace during 60 Hz streaming (Experiment E04). | UNVERIFIED |
| A12 | Candidate A3 deforms template GLTF bone scales and vertex proportions in Three.js without distorting 3D avatar mesh topology. | Rendering | Three.js benchmarks | Medium | Prototype GLTF bone scaling test in Three.js viewport. | UNVERIFIED |

---

## Status Definitions
- **UNVERIFIED**: Assumption requires empirical measurement or hardware testing.
- **OPEN**: Assumption under evaluation during design planning.
- **EXPERIMENTALLY VERIFIED**: Assumption confirmed by empirical evidence gathered on actual hardware.

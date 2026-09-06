# Track E — Mobile Deployment & Acceleration Comparison

## Overview
Track E evaluates mobile inference engines, model quantization strategies, hardware delegates, and memory management pipelines for deploying MocapLens AI models on Android devices.

---

## 1. Candidate Mobile Inference Runtimes

| Runtime Engine | Hardware Delegate Options | Quantization Formats | Android Integration Overhead | Supported Operator Coverage | Memory Bandwidth Optimization |
|---|---|---|---|---|---|
| **LiteRT (TensorFlow Lite)** | Qualcomm Hexagon NPU Delegate, Vulkan GPU Delegate, NNAPI Delegate | FP32, FP16, INT8 (PTQ / QAT) | Native Android Gradle Dependency (`org.tensorflow:tensorflow-lite`) | High (All vision ops supported) | Zero-copy `HardwareBuffer` support |
| **ONNX Runtime Mobile** | NNAPI Execution Provider, QNN EP | FP32, FP16, INT8 | Native AAR / JNI bindings | High | Tensor memory buffer sharing |
| **MediaPipe Tasks Vision SDK** | GPU Delegate, NPU Delegate, CPU | Built-in FP16/INT8 task graphs | Native AAR (`com.google.mediapipe:tasks-vision`) | Excellent (Optimized face pipelines) | Internal zero-copy OpenGL texture binding |

---

## 2. Hardware Acceleration Delegate Strategy [DESIGN PROPOSAL]

- **NPU Acceleration Statement [AUDIT CORRECTION]**: Qualcomm NPU / AI Engine Direct is the preferred acceleration target; actual delegate availability, operator compatibility, and latency require E02 validation on the selected iQOO device `[UNVERIFIED - E02 BENCHMARK REQUIRED]`.
- **Fallback Execution Sequence**:
  ```text
  Qualcomm NPU / AI Engine Direct Delegate (NNAPI / QNN)
        ↓ (if operator or delegate unavailable)
  Adreno GPU Delegate (Vulkan / OpenGL ES 3.0)
        ↓ (if GPU delegate initialization fails)
  Multi-Threaded ARM Neon CPU (4 Threads)
  ```

---

## 3. Quantization & Memory Footprint Impact [FACT & AUDIT CORRECTION]

- FP16/INT8 quantization may reduce computational and memory bandwidth requirements depending on model, runtime, and hardware, but sustained thermal behavior must be measured experimentally on the target device `[UNVERIFIED - E05 REQUIRED]`.

---

## 4. Track E Recommendation
**Recommended Deployment Configuration**: **MediaPipe Tasks Vision SDK / LiteRT Runtime with FP16 GPU/NPU Delegate Fallback** `[DESIGN PROPOSAL]`.

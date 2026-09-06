# Track E — Mobile Deployment & Acceleration Comparison

## Overview
Track E evaluates mobile inference engines, model quantization strategies, hardware delegates, and memory management pipelines for deploying MocapLens AI models on Android devices.

---

## 1. Candidate Mobile Inference Runtimes

| Runtime Engine | Hardware Delegate Options | Quantization Formats | Android Integration Overhead | Supported Operator Coverage | Memory Bandwidth Optimization |
|---|---|---|---|---|---|
| **LiteRT (TensorFlow Lite)** | Qualcomm Hexagon NPU Delegate, Vulkan GPU Delegate, NNAPI Delegate | FP32, FP16, INT8 (PTQ / QAT) | Native Android Gradle Dependency (`org.tensorflow:tensorflow-lite`) | High (All vision ops supported) | Zero-copy `HardwareBuffer` support |
| **ONNX Runtime Mobile** | NNAPI Execution Provider, QNN (Qualcomm Neural Network) EP | FP32, FP16, INT8 | Native AAR / JNI bindings | High | Tensor memory buffer sharing |
| **MediaPipe Tasks Vision SDK** | GPU Delegate, NPU Delegate, CPU | Built-in FP16/INT8 task graphs | Native AAR (`com.google.mediapipe:tasks-vision`) | Excellent (Optimized face pipelines) | Internal zero-copy OpenGL texture binding |

---

## 2. Hardware Acceleration Delegate Strategy

1. **Primary Acceleration Target**: Qualcomm Hexagon NPU / Adreno GPU via LiteRT GPU/NPU Delegate `[DESIGN PROPOSAL]`.
2. **Fallback Execution Sequence**:
   ```text
   Snapdragon Hexagon NPU Delegate (NNAPI / QNN)
         ↓ (if operator unsupported)
   Adreno GPU Delegate (Vulkan / OpenGL ES 3.0)
         ↓ (if GPU delegate initialization fails)
   Multi-Threaded ARM Neon CPU (4 Threads)
   ```

---

## 3. Quantization & Memory Footprint Tradeoff

| Quantization Type | Model Size Reduction | Inference Speedup | Accuracy Impact | Delegate Compatibility |
|---|---|---|---|---|
| **FP32 (Full Precision)** | Baseline ($1.0\times$) | Baseline ($1.0\times$) | Zero Loss | $100\%$ Compatible |
| **FP16 (Half Precision)** | $50\%$ Reduction ($2.0\times$ smaller) | $1.8\times - 2.5\times$ Speedup | Negligible ($<0.1\%$ NME loss) | Highly Supported on Mobile GPUs/NPUs |
| **INT8 (Quantized Integer)** | $75\%$ Reduction ($4.0\times$ smaller) | $2.5\times - 4.0\times$ Speedup | Minor ($0.3 - 0.8\%$ NME loss) | NPU Hardware Native |

---

## 4. Track E Recommendation
**Recommended Deployment Configuration**: **MediaPipe Tasks Vision SDK / LiteRT Runtime with FP16 GPU/NPU Delegate Fallback** `[DESIGN PROPOSAL]`.
- Native Android integration minimizes JNI binding overhead.
- Built-in zero-copy camera frame texture sharing reduces CPU memory copy delay to near zero.

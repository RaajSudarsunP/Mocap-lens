# Mobile AI Acceleration & Hardware Deployment

## Definition [FACT]
Mobile AI acceleration is the optimization and execution of deep learning models on smartphone edge hardware—specifically Neural Processing Units (NPUs), GPUs, and Digital Signal Processors (DSPs)—to achieve efficient inference with low latency and reduced power consumption.

## Why it Matters to MocapLens AI [TARGET / UNVERIFIED]
MocapLens AI targets hardware acceleration (such as Snapdragon NPU or Adreno GPU delegates) on target smartphones. Running dense landmark tracking and blendshape regression at target 60 FPS requires squeezing full inference into a low millisecond budget `[TARGET]` without triggering excessive thermal throttling.

## Core Concepts [FACT]
1. **Hardware Acceleration Hierarchy**:
   - **CPU**: General purpose; high latency for dense matrix multiplication; higher energy consumption for large convolutions.
   - **GPU**: Parallel floating-point architecture (OpenCL / Vulkan); effective for vision models.
   - **NPU / DSP (e.g. Snapdragon Hexagon NPU)**: Specialized tensor processing units optimized for low-bitwidth integer (INT8) and half-precision float (FP16) matrix math `[UNVERIFIED - HARDWARE DEPENDENT]`.
2. **Model Quantization**:
   - **FP32**: Standard training representation (32-bit float).
   - **FP16**: Half-precision float; reduces memory bandwidth requirements.
   - **INT8**: 8-bit integer quantization; requires Post-Training Quantization (PTQ) or Quantization-Aware Training (QAT).
   - **Thermal & Compute Impact [FACT & AUDIT CORRECTION]**: FP16/INT8 quantization may reduce computational and memory bandwidth requirements depending on model, runtime, and hardware, but sustained thermal behavior must be measured experimentally on the target device `[UNVERIFIED]`.

## Important Equations & Technical Details [FACT]
- **Affine Post-Training Quantization Formula**:
  $$r = S \cdot (q - Z)$$
  where $r \in \mathbb{R}$ is the float value, $q \in \mathbb{Z}^8$ is the quantized integer, $S > 0$ is the scale factor, and $Z \in \mathbb{Z}$ is zero-point offset.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Howard, A. G., et al. (2017). "MobileNets: Efficient ConvNets for Mobile Vision Applications." *arXiv:1704.04861*.
- Wu, B., et al. (2019). "FBNet: Hardware-Aware Efficient ConvNet Design via NAS." *IEEE CVPR*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Candidate runtime delegate: LiteRT (TFLite GPU/NPU delegate) or ONNX Runtime Mobile `[CANDIDATE TECHNOLOGY - TO BE EVALUATED IN STAGE 1]`.
- Memory transfers between camera buffers and model inputs should evaluate Android `HardwareBuffer` / EGLImage to avoid CPU memory copy overhead.

## Known Limitations & Verification Requirements [UNVERIFIED]
- SoC delegate compatibility: Model operators must be verified against hardware delegate supported matrices; unsupported ops fall back to CPU execution.
- Paper benchmarks vs. device reality: Published FLOPs/FPS paper numbers do NOT guarantee identical performance on target phone hardware; empirical benchmarking is required.

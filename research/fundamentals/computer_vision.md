# Computer Vision Fundamentals for MocapLens AI

## Definition [FACT]
Computer Vision (CV) in the context of facial motion capture is the process of acquiring, processing, analyzing, and understanding digital RGB images from a sensor to extract geometric and semantic facial state information.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
MocapLens AI proposes using a front-facing mobile RGB camera (e.g., target 60 FPS stream on a smartphone). The fundamental computer vision pipeline transforms raw pixel data into 3D facial spatial dynamics and blendshape regression parameters.

## Core Concepts [FACT]
1. **RGB Image Format & Color Spaces**:
   - YUV (NV21 / YUV_420_888) output directly from mobile camera hardware buffers.
   - Fast conversion to RGB/RGBA or grayscale tensors for neural network inference.
2. **Resolution & Frame Rate Tradeoff**:
   - High resolution (1080p/4K) increases spatial pixel density but incurs high spatial convolution overhead.
   - Lower resolution or Region-of-Interest (ROI) crop reduces FLOPs while preserving micro-expression details.
   - Target frame rate of 60 FPS yields a ~16.67 ms frame period budget per cycle `[TARGET]`.
3. **Camera Calibration & Pin-hole Camera Model**:
   - Intrinsic Matrix $K$:
     $$K = \begin{bmatrix} f_x & 0 & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}$$
     where $f_x, f_y$ are focal lengths in pixel units, and $c_x, c_y$ represent the principal point (optical center).
4. **Perspective Projection**:
   - Mapping a 3D point $P_c = (X_c, Y_c, Z_c)^T$ in camera coordinate space to a normalized image plane point $(x, y)^T$ and pixel coordinates $(u, v)^T$:
     $$\begin{bmatrix} u \\ v \\ 1 \end{bmatrix} \sim K \cdot P_c = \begin{bmatrix} f_x \frac{X_c}{Z_c} + c_x \\ f_y \frac{Y_c}{Z_c} + c_y \\ 1 \end{bmatrix}$$

## Important Equations & Technical Details [FACT]
- **Normalized Device Coordinates (NDC)**:
  $$x_{ndc} = \frac{2u - W}{W}, \quad y_{ndc} = \frac{H - 2v}{H}$$
  where $W$ and $H$ are image width and height.
- **Radial and Tangential Distortion Correction**:
  $$x' = x(1 + k_1 r^2 + k_2 r^4) + [2p_1 x y + p_2(r^2 + 2x^2)]$$
  $$y' = y(1 + k_1 r^2 + k_2 r^4) + [p_1(r^2 + 2y^2) + 2p_2 x y]$$
  where $r^2 = x^2 + y^2$.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Zhang, Z. (2000). "A flexible new technique for camera calibration." *IEEE TPAMI*, 22(11), 1330-1334.
- Lugaresi, C., et al. (2019). "MediaPipe: A Framework for Building Perception Pipelines." *arXiv:1906.08172*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Android camera frames are recommended to be cropped using a tight face bounding box (Region-of-Interest) to maintain spatial resolution without feeding full 1080p frames into the neural network.
- Camera intrinsics ($f_x, f_y, c_x, c_y$) should be extracted from Android `CameraCharacteristics` API (`LENS_INTRINSIC_CALIBRATION`) whenever supported by hardware.

## Candidate Implementation Choices [DESIGN PROPOSAL]
- Candidate API: Android `CameraX` in `YUV_420_888` mode or native NDK camera stream.
- Candidate Acceleration: Hardware acceleration via LiteRT (TFLite GPU/NPU delegate) or ONNX Runtime Mobile `[UNVERIFIED - TO BE BENCHMARKED IN STAGE 1]`.

## Known Limitations [FACT]
- Monocular Depth Ambiguity: Single RGB cameras lack direct depth sensors (like structured light or Time-of-Flight). Scale and absolute depth $Z_c$ exhibit monocular depth ambiguity that requires canonical geometric priors.

# Facial Landmarks & Mesh Fundamentals

## Definition [FACT]
Facial landmarks are localized 2D or 3D coordinate points $(x, y, z)$ corresponding to specific anatomical keypoints on a human face (eyes, eyebrows, nose, lips, jawline, contour). A dense facial mesh connects hundreds of landmarks into a 3D surface topology representing face geometry.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
MocapLens AI considers candidate dense 3D facial landmark topologies (such as 468-point MediaPipe Face Mesh or alternative dense keypoint regressors) to supply the spatial features required for head pose estimation (PnP geometry) and facial expression regression.

## Core Concepts [FACT]
1. **Bounding Box vs. Landmark Detection vs. Mesh**:
   - *Face Detection*: Locates the 2D bounding box $[x_{min}, y_{min}, width, height]$ of the face in the image frame.
   - *Landmark Detection*: Predicts sparse keypoints (e.g., 5-point, 68-point dlib/Multi-PIE).
   - *Dense 3D Mesh*: Predicts dense spatial points (e.g. 468/478 points), forming a metric 3D mesh surface `[PAPER-REPORTED]`.
2. **Detection vs. Tracking Loop**:
   - Running full face detection on every frame is computationally redundant.
   - *Tracking Pipeline (Engineering Recommendation)*: Detect face on Frame 0 $\rightarrow$ expand bounding box by margin $\rightarrow$ re-crop and track landmarks on Frames 1..N. Re-trigger full face detector only if landmark confidence score falls below threshold $\tau = 0.5$.
3. **Landmark Indexing Standard [PAPER-REPORTED]**:
   - Canonical Face Meshes (such as MediaPipe) define index mapping:
     - Lips, Eyes, Nose Tip, Chin keypoint indices.

## Important Equations & Technical Details [FACT]
- **Normalized Coordinates to Pixel Coordinates**:
  $$x_{pixel} = x_{norm} \cdot W, \quad y_{pixel} = y_{norm} \cdot H, \quad z_{pixel} = z_{norm} \cdot W$$
  where $z_{norm}$ represents depth relative to the mesh center scaled by image width.
- **Landmark Tracking Confidence Loss**:
  $$\mathcal{L}_{lm} = \frac{1}{N}\sum_{i=1}^{N} \left( \| p_i - \hat{p}_i \|_2^2 + \alpha (1 - c_i) \right)$$
  where $c_i \in [0, 1]$ is the landmark presence/confidence score.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Kartynnik, Y., Ablavatski, A., Grishchenko, I., & Grundmann, M. (2019). "Real-time Facial Surface Geometry Estimation of Single Images in the Wild." *CVPR Workshops*.
- Sanyal, S., et al. (2019). "Learning to Regress 3D Face Shapes from In-the-Wild Images." *IEEE/CVF CVPR*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Storing landmarks as a single contiguous `Float32Array` buffer ensures SIMD vector alignment and cache locality for downstream processing.
- Landmark temporal filtering is recommended prior to PnP head-pose solving to mitigate high-frequency micro-shaking in the 3D viewport.

## Candidate Implementation Choices [CANDIDATE TECHNOLOGY]
- Candidate model: MediaPipe `FaceLandmarker` task configured in video/stream mode `[UNVERIFIED - TO BE BENCHMARKED IN STAGE 1]`.

## Known Limitations [FACT]
- Extreme head rotation (yaw $> 60^\circ$) causes self-occlusion where key points (e.g. far eye/cheek) are hidden, degrading 3D coordinate accuracy.

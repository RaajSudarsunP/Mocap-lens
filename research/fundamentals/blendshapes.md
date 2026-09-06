# Blendshapes & FACS Action Units Fundamentals

## Definition [FACT]
A Blendshape (or Morph Target) is a computer graphics technique for keyframe-free facial animation where predefined 3D mesh deformations are combined weighted by scalar coefficients. FACS Action Units represent anatomical muscle contractions.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
Blendshapes form a candidate bridge between the on-device AI regression engine and the 3D avatar rendering viewport. Regressing standardized blendshapes allows MocapLens AI to drive compatible 3D character meshes.

## Core Concepts [FACT]
1. **Neutral Base Mesh ($B_0$)**:
   - Represents the subject's face at rest with zero muscle activation ($w_i = 0$).
2. **Delta Vectors ($\Delta B_i = B_i - B_0$)**:
   - Geometric displacement of each vertex from the neutral state to maximum expression intensity ($w_i = 1.0$).
3. **ARKit 52 Blendshape Categories [PAPER-REPORTED]**:
   - Standard set of 52 facial coefficients covering Eyes, Jaw, Mouth/Lips, Eyebrows, and Cheeks/Nose.

## Important Equations & Technical Details [FACT]
- **Vertex Deformation Formula**:
  $$P_j(w) = P_{j,0} + \sum_{i=1}^{K} w_i \cdot \Delta P_{j,i}$$
  where $P_j(w)$ is the position of 3D mesh vertex $j$, $P_{j,0}$ is its neutral position, and $\Delta P_{j,i}$ is the position offset vector for blendshape $i$.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Alexander, O., et al. (2010). "The Digital Emily Project: Achieving Photorealism in Real-Time." *IEEE CG&A*, 30(4), 20-31.
- Thies, J., et al. (2016). "Face2Face: Real-time Face Capture and Reenactment of RGB Videos." *IEEE CVPR*.

## Candidate Technology Evaluation [CANDIDATE TECHNOLOGY]
- Candidate model: MediaPipe `FaceLandmarker` with `setOutputFaceBlendshapes(true)` directly outputs 52 blendshapes `[UNVERIFIED - TO BE EVALUATED IN STAGE 1]`.
- Alternative candidate model: Custom TFLite/LiteRT FACS Action Unit or blendshape regressor model trained on 3DMM dataset `[CANDIDATE TECHNOLOGY]`.

## Known Limitations [FACT]
- Characters with custom or non-standard topology (e.g. anime characters with non-human mouth proportion) require custom retargeting remap curves ($w'_{target} = f(w_{source})$).

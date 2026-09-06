# Track B — Expression & Blendshape Estimation Comparison

## Overview
Track B evaluates the core facial expression regression mechanism for MocapLens AI. This track compares six distinct algorithmic approaches for converting visual inputs into animatable facial parameter representations.

---

## 1. Evaluation of the 6 Architectural Approaches

### Approach 1: Landmarks $\rightarrow$ Deterministic Geometry $\rightarrow$ Blendshapes
- **Mechanism**: Calculates Euclidean distances and angle ratios between key 3D landmarks (e.g. upper-to-lower lip distance for `jawOpen`, eye lid distance for `eyeBlink`).
- **Accuracy**: Moderate; sensitive to individual anatomical differences (e.g. users with naturally larger lips get distorted scale).
- **Latency**: Negligible ($<0.1\text{ ms}$).
- **Complexity**: Low; pure deterministic math.
- **Limitation**: Fails to capture subtle non-linear muscle interactions (e.g. cheek puff, sneer, mouth stretch).

### Approach 2: Landmarks $\rightarrow$ Neural Blendshape Regressor
- **Mechanism**: A lightweight Multi-Layer Perceptron (MLP) or Residual Network takes normalized 3D landmark coordinates ($N \times 3$) and regresses continuous blendshape weights $[w_1, \dots, w_K]$.
- **Accuracy**: High; captures complex non-linear combinations across facial keypoints.
- **Latency**: Very Low ($0.3 - 0.8\text{ ms}$).
- **Complexity**: Low ($\sim 100\text{K}-500\text{K}$ parameters).
- **Limitation**: Requires normalized 3D landmark inputs to eliminate head-pose dependencies.

### Approach 3: Landmarks $\rightarrow$ Action Units $\rightarrow$ Blendshapes
- **Mechanism**: Regresses 12-17 FACS Action Unit (AU) intensities first (e.g. GraphAU), then applies a static linear transformation matrix to convert AU intensities into 3D morph targets.
- **Accuracy**: High semantic interpretability; moderate animation precision.
- **Latency**: Low to Medium ($1.5 - 3.0\text{ ms}$).
- **Complexity**: Medium ($\sim 2\text{M}$ parameters).
- **Limitation**: AU-to-Blendshape matrix translation can lose subtle asymmetric expression nuances.

### Approach 4: Direct Image $\rightarrow$ Neural Blendshape Regression
- **Mechanism**: End-to-end Convolutional or Vision Transformer network taking raw camera image crops and regressing blendshape parameters directly.
- **Accuracy**: High; utilizes complete texture information (wrinkles, skin folds).
- **Latency**: High ($8.0 - 18.0\text{ ms}$ on mobile).
- **Complexity**: High ($\sim 15\text{M}-45\text{M}$ parameters).
- **Limitation**: Computationally heavy for 60 FPS mobile execution; highly sensitive to lighting and skin tone variations.

### Approach 5: Temporal Landmarks $\rightarrow$ Temporal Neural Model $\rightarrow$ Blendshapes
- **Mechanism**: Sequences of $T$ past landmark frames ($T \times N \times 3$) fed into a Temporal CNN, GRU, or Attention model.
- **Accuracy**: High temporal smoothness.
- **Latency**: Medium to High ($3.0 - 10.0\text{ ms}$ plus input buffer window lag).
- **Complexity**: Medium ($\sim 3\text{M}-8\text{M}$ parameters).
- **Limitation**: Fixed temporal sliding windows introduce phase lag ($\sim 30-50\text{ ms}$ buffer delay), violating real-time responsiveness goals.

### Approach 6: Hybrid Geometry + Neural Regression (Recommended)
- **Mechanism**: Primary neural landmark-to-blendshape regression supplemented by deterministic geometric bounds (clamping, zero-point baseline calibration, and deadband noise filtering).
- **Accuracy**: Highest combined precision and anatomical stability.
- **Latency**: Very Low ($0.4 - 1.0\text{ ms}$).
- **Complexity**: Low ($\sim 150\text{K}$ parameters + deterministic bounds).
- **Limitation**: Requires one-time neutral calibration step.

---

## 2. Output Representation Comparison

| Parameterization | Channel Count | Industry Standard Compatibility | Expressive Granularity | Mobile Transmission Size |
|---|---|---|---|---|
| **52 ARKit Blendshapes** | 52 Floats | Native (Ready Player Me, Unreal Live Link, Unity, Blender) | High (Separate L/R eye, brow, mouth, cheek) | 208 Bytes / frame |
| **FACS Action Units** | 12–17 Floats | Low (Requires AU-to-Morph retargeting matrix) | Moderate (Anatomical muscle focus) | 48–68 Bytes / frame |
| **Compact Custom Parameter Set** | 20–30 Floats | Poor (Requires custom avatar mesh sculpting) | Moderate (Combines symmetric channels) | 80–120 Bytes / frame |

---

## 3. Track B Recommendation
**Recommended Approach**: **Approach 6 (Hybrid Geometry + Neural Regression)** using **52 ARKit Blendshapes** as the canonical internal parameter representation `[DESIGN PROPOSAL]`.
- Provides direct compatibility with standard 3D digital avatars (Ready Player Me, Mixamo, Unreal Live Link).
- Combines neural non-linear expression learning with deterministic calibration bounds to prevent baseline drift.

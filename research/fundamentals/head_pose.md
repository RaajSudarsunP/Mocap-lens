# Head Pose Estimation Fundamentals

## Definition [FACT]
Head Pose Estimation is the problem of determining the 3D orientation (Pitch, Yaw, Roll) and 3D translation $(T_x, T_y, T_z)$ of the human head relative to the camera coordinate system using visual features.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
A complete facial motion capture performance requires tracking both internal facial expressions (blendshapes) and external head movements (nodding, turning, tilting). MocapLens AI proposes extracting 3D head pose and streaming it alongside blendshape data.

## Core Concepts [FACT]
1. **Degrees of Freedom (6-DoF)**:
   - 3 Rotational DoF: Pitch, Yaw, Roll.
   - 3 Translational DoF: $X$ (lateral), $Y$ (vertical), $Z$ (depth distance from camera).
2. **PnP (Perspective-n-Point) Geometric Solver**:
   - Matches key 3D facial landmarks from a canonical 3D head model with observed 2D image coordinates.
   - Solves for optimal rotation matrix $R$ and translation vector $T$ minimizing reprojection error.
3. **Decoupling Expression from Head Pose**:
   - Non-rigid facial deformation alters 2D landmark coordinates. Using rigid landmarks (nose bridge, outer eye corners, skull reference points) for PnP prevents facial expressions from distorting head pose calculations.
4. **Rotation Representation Preference [DESIGN PROPOSAL]**:
   - Quaternions are the preferred representation for head rotation because they avoid Euler-angle singularities and are convenient for interpolation and avatar transforms. Communication format remains a design decision.

## Important Equations & Technical Details [FACT]
- **Reprojection Error Minimization**:
  $$\text{Error}(R, T) = \sum_{i \in \text{rigid\_pts}} \left\| p_i - K \left( R P_i + T \right) \right\|_2^2$$
- **Rotation Matrix to Quaternion Transformation**:
  $$q_w = \frac{1}{2}\sqrt{1 + R_{11} + R_{22} + R_{33}}$$

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Murphy-Chutorian, E., & Trivedi, M. M. (2009). "Head Pose Estimation in Computer Vision: A Survey." *IEEE TPAMI*, 31(4).
- Ruiz, N., Chong, E., & Rehg, J. M. (2018). "Fine-Grained Head Pose Estimation Without Keypoints." *CVPR Workshops*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Transmitting head orientation as a normalized 4-float quaternion $[q_w, q_x, q_y, q_z]$ allows direct binding to 3D avatar head/neck bone nodes in WebGL/Unity engines.
- Soft-clamping maximum head rotation angles (e.g. $\pm 60^\circ$ Yaw) prevents avatar mesh breaking when user turns past camera field of view.

## Known Limitations [FACT]
- Extreme yaw rotations ($>70^\circ$) cause one half of the face landmarks to be fully occluded, requiring temporal pose extrapolation.

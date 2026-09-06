# 3D Face Geometry & Coordinate Transformations

## Definition [FACT]
3D Face Geometry describes the spatial representation, orientation, scale, and rigid transformation of a human face in 3-dimensional space using vector mathematics, transformation matrices, and projection geometry.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
In MocapLens AI, separating rigid 3D head movement (Pitch, Yaw, Roll, Translation) from non-rigid facial expressions (blendshapes) is a core structural design principle. 3D geometry enables spatial tracking of the head while isolating muscle deformations for avatar retargeting.

## Core Concepts [FACT]
1. **Coordinate Systems**:
   - *World Coordinate System*: Static 3D scene reference.
   - *Camera Coordinate System*: Origin at camera optical center; $+X$ right, $+Y$ down, $+Z$ pointing into scene.
   - *Head Local Coordinate System*: Origin at head center of mass (or nose bridge); local orientation axes attached to skull.
2. **Rigid 3D Transformations**:
   - A 3D point $P_{head}$ is mapped to camera space $P_{camera}$ via rotation matrix $R \in SO(3)$ and translation vector $T \in \mathbb{R}^3$:
     $$P_{camera} = R \cdot P_{head} + T$$
3. **Representations of 3D Rotation**:
   - **Euler Angles**: Pitch ($\theta_x$), Yaw ($\theta_y$), Roll ($\theta_z$). Intuitive but susceptible to Gimbal Lock when Pitch approaches $\pm 90^\circ$.
   - **Rotation Matrix**: $3 \times 3$ orthogonal matrix with $\det(R) = 1$.
   - **Quaternion**: $q = [w, x, y, z]^T$ with $\|q\| = 1$. Gimbal-lock-free, smoothly interpolable via Slerp (Spherical Linear Interpolation).
   - **Engineering Note [DESIGN PROPOSAL]**: Quaternions are the preferred representation for head rotation because they avoid Euler-angle singularities and are convenient for interpolation and avatar transforms. Communication format remains a design decision to be benchmarked.

## Important Equations & Technical Details [FACT]
- **Euler Angle to Rotation Matrix ($Z-Y-X$ convention)**:
  $$R = R_z(\text{Roll}) \cdot R_y(\text{Yaw}) \cdot R_x(\text{Pitch})$$
- **Quaternion Representation**:
  $$q = \cos\frac{\theta}{2} + \sin\frac{\theta}{2}(u_x i + u_y j + u_z k)$$
- **Perspective-n-Point (PnP)**:
  Given 3D canonical reference points $P_i \in \mathbb{R}^3$ and observed 2D image projections $p_i \in \mathbb{R}^2$:
  $$\min_{R, T} \sum_{i=1}^N \left\| p_i - \text{Project}\left( K \cdot (R P_i + T) \right) \right\|^2$$

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Terzo, M., et al. (2020). "Head Pose Estimation from 2D and 3D Landmarks." *IEEE Transactions on Cybernetics*.
- Lepetit, V., Moreno-Noguer, F., & Fua, P. (2009). "EPnP: An Accurate $O(N)$ Solution to the PnP Problem." *IJCV*, 81(2), 155-166.

## Engineering Recommendations [DESIGN PROPOSAL]
- Canonical 3D face models (e.g. Mean 3D Face Model) should be scaled to match user face proportions during calibration to avoid PnP depth distortion.

## Candidate Implementation Choices [CANDIDATE TECHNOLOGY]
- Solve PnP using OpenCV `solvePnP` / `solvePnPRansac` or candidate model direct pose matrix output `[UNVERIFIED - TO BE BENCHMARKED IN STAGE 1]`.

## Known Limitations [FACT]
- Monocular depth ambiguity: Moving the head away from the camera ($+Z$) can be confounded with face scale variations if camera focal length $f$ is inaccurate.

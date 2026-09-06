# Subject-Specific Personal Calibration Fundamentals

## Definition [FACT]
Personal Calibration is the process of establishing a user's neutral baseline face geometry and expression thresholds at rest, normalizing individual morphological differences (face shape, resting eye openness, lip width) relative to a standardized 3D avatar rig.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
Every human face has distinct resting geometry. Resting eye openness and lip position differ across individuals. Without calibration, an avatar might incorrectly appear to be constantly squinting or smiling. Calibration aims to establish a zero-point baseline ($w_i = 0.0$) and full-range scaling ($w_i = 1.0$).

## Core Concepts [FACT]
1. **Neutral Pose Baseline Capture ($B_{neutral}$)**:
   - Captures frames while the user maintains a relaxed, neutral expression.
   - Computes baseline landmark mean $\bar{L}_0$ or baseline expression coefficients.
2. **Relative Offset Normalization**:
   - Instead of using raw expression weights directly, the system regresses deltas relative to baseline:
     $$w_{calibrated} = \text{clamp}\left(\frac{w - w_{rest}}{1.0 - w_{rest}}, \, 0.0, \, 1.0\right)$$
3. **Scale Normalization**:
   - Normalizes mesh coordinates by an observed metric, such as inter-pupillary distance $d_{IPD}$:
     $$L_{norm} = \frac{L - C_{face}}{d_{IPD}}$$

## Important Equations & Technical Details [FACT]
- **Min-Max Expression Rescaling with Deadband**:
  $$w_{calibrated} = \begin{cases} 0.0 & \text{if } w \le w_{rest} + \epsilon \\ \frac{w - (w_{rest} + \epsilon)}{1.0 - (w_{rest} + \epsilon)} & \text{if } w > w_{rest} + \epsilon \end{cases}$$
  where $\epsilon$ is a small noise deadband buffer (e.g. 0.02) `[DESIGN PROPOSAL]`.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Li, H., et al. (2010). "Example-Based Facial Rigging." *ACM TOG*, 29(4).
- Bouaziz, S., Wang, Y., & Pauly, M. (2013). "Online Modeling for Real-Time Facial Animation." *ACM TOG*, 32(4).

## Engineering Recommendations [DESIGN PROPOSAL]
- Evaluate a "One-Tap Calibration" routine during app startup.
- Store user calibration profiles in local device storage (`SharedPreferences` / `LocalStorage`) to eliminate recalibration between sessions.

## Known Limitations [FACT]
- If a user smiles or blinks during the neutral calibration phase, the baseline will be corrupted, resulting in distorted expression scaling during live tracking.

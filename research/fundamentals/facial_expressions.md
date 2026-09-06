# Facial Expression Representation Fundamentals

## Definition [FACT]
Facial Expression Representation is the mathematical parameterization of human facial micro-expressions and muscle activations, decomposing complex emotional and physiological movements into structured numerical vectors.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
Capturing expressions in real time requires converting continuous 2D/3D camera observations into semantic expression parameters (0.0 to 1.0 intensity) that represent blinking, smiling, jaw opening, and brow movements without transmitting raw video data.

## Core Concepts [FACT]
1. **Facial Action Coding System (FACS)**:
   - Developed by Ekman & Friesen (1978). Decomposes facial expressions into individual **Action Units (AUs)** based on anatomical muscle contractions (e.g. AU12 Lip Corner Puller, AU45 Blink).
2. **Blendshapes (Morph Targets)**:
   - 3D Computer Graphics representation where a mesh expression $M$ is formed as a linear combination of target facial poses $B_k$ relative to a neutral pose $B_0$:
     $$M(w) = B_0 + \sum_{k=1}^K w_k (B_k - B_0)$$
     where $w_k \in [0.0, 1.0]$ are blendshape weight coefficients.
3. **Parameter Mapping Chain [DESIGN PROPOSAL]**:
   - It is important to distinguish the parameter flow:
     $$\text{Model Output} \longrightarrow \text{MocapLens Canonical Representation} \longrightarrow \text{Avatar-Specific Retargeting}$$
   - A model evaluated in Stage 1 may output raw landmarks, Action Units, 51 blendshapes, 52 ARKit blendshapes, or another parameterization. MocapLens AI will standardize on a canonical parameterization for internal transport and avatar retargeting.

## Important Equations & Technical Details [FACT]
- **Linear Blend Shape Equation**:
  $$V_{final} = V_{neutral} + \sum_{i=1}^{K} w_i \cdot \Delta V_i$$
  where $V_{neutral} \in \mathbb{R}^{V \times 3}$ is the vertex matrix of the neutral face, and $\Delta V_i = V_i - V_{neutral}$ is the vertex displacement delta for blendshape $i$.
- **Bounded Intensity Constraints**:
  $$\forall i \in \{1, \dots, K\}, \quad 0.0 \le w_i \le 1.0$$

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Ekman, P., & Friesen, W. V. (1978). "Facial Action Coding System." *Consulting Psychologists Press*.
- Lewis, J. P., et al. (2014). "Practice and Theory of Blendshape Facial Animation." *Eurographics 2014 STAR*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Standardizing internal parameter naming to match ARKit conventions (`jawOpen`, `eyeBlinkLeft`, `mouthSmileLeft`) simplifies integration with standard 3D engines (Three.js, Blender, Unreal Engine Live Link).

## Known Limitations [FACT]
- Extreme linear blendshape combinations can cause mesh self-intersection or visual artifacts if displacement deltas overlap without corrective shape poses.

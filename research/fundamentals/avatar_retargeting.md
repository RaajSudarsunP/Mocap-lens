# Avatar Retargeting & Morph Target Animation Fundamentals

## Definition [FACT]
Avatar Retargeting is the process of mapping captured human motion parameters (blendshapes, quaternions) onto arbitrary 3D digital character rigs, ensuring that micro-expressions and spatial movements map naturally regardless of character proportion or topology.

## Why it Matters to MocapLens AI [DESIGN PROPOSAL]
MocapLens AI proposes streaming standardized telemetry parameters (blendshapes, head pose). Retargeting enables these telemetry streams to drive stylized 3D avatars, Ready Player Me models, VTuber characters, or custom Blender/Unity assets without custom model retraining.

## Core Concepts [FACT]
1. **Morph Target Binding**:
   - In 3D engines (WebGL / Three.js / Unity / Unreal), a 3D mesh contains morph target dictionary maps binding shape names to vertex displacement index channels:
     ```js
     mesh.morphTargetInfluences[mesh.morphTargetDictionary['jawOpen']] = weight;
     ```
2. **Expression Gain Tuning & Remapping [DESIGN PROPOSAL]**:
   - Direct 1:1 mapping ($w_{avatar} = w_{actor}$) can result in under-expressed or over-expressed motions on stylized characters (e.g. big-eyed anime avatars vs realistic human models).
   - *Transfer Functions*:
     $$w_{avatar} = f(w_{actor}) = \text{clamp}\left(\gamma \cdot w_{actor}^p, \, 0.0, \, 1.0\right)$$
     where $\gamma$ is sensitivity gain multiplier and $p$ is non-linear power exponent.
3. **Bone Skeleton Binding (Rigid Head Rotation)**:
   - Binding the head rotation quaternion $q_{head}$ to the 3D avatar's head/neck bone node in the transform hierarchy.

## Important Equations & Technical Details [FACT]
- **Remapped Morph Weight Calculation**:
  $$w'_{i} = \text{clamp}\left( s_i \cdot (w_i - o_i), \, 0.0, \, 1.0 \right)$$
  where $s_i$ is channel sensitivity scale and $o_i$ is channel zero-offset.

## Relevant Papers & Academic Citations [PAPER-REPORTED]
- Gleicher, M. (1998). "Retargetting Motion to New Characters." *ACM SIGGRAPH 98*, 33-42.
- Feng, A., Shapiro, A., & Ruiz, R. (2014). "Facial Animation Retargeting." *IEEE VR*.

## Engineering Recommendations [DESIGN PROPOSAL]
- Standardizing canonical channel names simplifies integration with standard 3D asset formats (GLTF/GLB).
- Providing per-category expression gain controls (Eyes, Mouth, Brows, Head) in the viewport allows animators to fine-tune expression intensity live.

## Candidate Implementation Choices [CANDIDATE TECHNOLOGY]
- Candidate viewport engine: Three.js `GLTFLoader` with `morphTargetInfluences` binding engine in browser/laptop viewport `[CANDIDATE TECHNOLOGY - TO BE EVALUATED IN STAGE 1]`.

## Known Limitations [FACT]
- Custom avatar models missing specific morph targets (e.g. missing `cheekPuff` or `tongueOut`) will ignore those parameter channels unless mapped to alternative shape keys.

# Blendshapes, Action Units & Motion Parameterization

## Definition [FACT]
A Blendshape (or Morph Target) is a 3D graphics technique where predefined mesh deformations are combined weighted by scalar coefficients. FACS Action Units represent anatomical muscle contractions.

## Core Architectural Separation [DESIGN PROPOSAL]
To maintain modularity, MocapLens AI distinguishes between internal tracking parameters and target character animation controls:

```text
Internal Motion Representation (Canonical Parameter Set)
                ↓
    Retargeting Engine (Gain & Sensitivity Remap)
                ↓
Avatar Output Representation (Target 3D Character Mesh)
```

1. **INTERNAL MOTION REPRESENTATION**:
   - Proposed Candidate: 52 ARKit-compatible coefficient array `[DESIGN PROPOSAL]`.
   - Reason: Provides a balanced, high-resolution parameter space covering independent left/right eye tracking, brows, jaw, mouth, and cheek movements.
2. **AVATAR OUTPUT REPRESENTATION**:
   - Target mesh morph target dictionary bindings (e.g., Ready Player Me GLTF morph targets, VRoid anime shape keys, Blender Shape Keys).
   - Retargeting layer handles missing morph channels, channel remapping, and sensitivity gain curves ($w_{avatar} = \text{clamp}(\gamma \cdot w_{internal}^p, 0.0, 1.0)$).

## Assumption Status Notice [AUDIT NOTICE]
- **Assumption A06** ("52 coefficients are sufficient to drive target avatars without expression loss") remains **OPEN** and will be experimentally evaluated across multiple 3D avatar topologies during Stage 2.
